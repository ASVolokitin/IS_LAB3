export type WebSocketEvent = {
  eventType: 'CREATED' | 'UPDATED' | 'UPDATED_MANY' | 'DELETED';
  entityId: number;
  timestamp: string;
}