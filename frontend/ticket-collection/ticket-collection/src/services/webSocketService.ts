import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { devLog } from "./logger";

const WS_URL = "http://localhost:8081/ws";

interface PendingSubscription {
  topic: string;
  callback: (msg: IMessage) => void;
}

class WebSocketService {
  private client: Client | null = null;
  private connected = false;
  private pendingSubscriptions: PendingSubscription[] = [];

  connect() {
    if (this.client) return; 
    const socket = new SockJS(WS_URL);
    this.client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: (msg) => console.log("[STOMP]", msg),
    });

    this.client.onConnect = () => {
      devLog.log("[WS] Connected");
      this.connected = true;

      this.pendingSubscriptions.forEach(({ topic, callback }) => {
        if (this.client?.active) {
          devLog.log(`subscribed to ${topic}`);
          this.client.subscribe(topic, callback);
        } else {
          devLog.warn("[WS] Tried to subscribe but client not active yet:", topic);
        }
      });

      this.pendingSubscriptions = [];
    };

    this.client.onStompError = (frame) => {
      devLog.error("[WS] STOMP Error:", frame.headers, frame.body);
    };

    this.client.onWebSocketClose = () => {
      devLog.log("[WS] WebSocket closed");
      this.connected = false;
    };

    this.client.activate();
  }

  disconnect() {
    if (!this.client) return;
    this.client.deactivate();
    this.connected = false;
    this.pendingSubscriptions = [];
  }

  subscribe(topic: string, callback: (msg: IMessage) => void): StompSubscription {
    if (!this.client) throw new Error("WebSocket client not initialized");

    if (this.connected && this.client.active) {
      return this.client.subscribe(topic, callback);
    } else {
      this.pendingSubscriptions.push({ topic, callback });
      return {
        unsubscribe: () => {
          this.pendingSubscriptions = this.pendingSubscriptions.filter(
            (sub) => sub.topic !== topic || sub.callback !== callback
          );
        },
      } as StompSubscription;
    }
  }

  publish(destination: string, body: object) {
    if (this.client?.active) {
      this.client.publish({
        destination,
        body: JSON.stringify(body),
      });
    } else {
      devLog.warn("[WS] Cannot publish, client not active yet:", destination);
    }
  }
}

export const webSocketService = new WebSocketService();
