package com.ticketis.app.controller;

import com.ticketis.app.dto.WebSocketEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Slf4j
@Controller
@RequiredArgsConstructor
public class WebSocketEventController {

    private final SimpMessagingTemplate messagingTemplate;

    public void sendEntityEvent(String topic, WebSocketEvent event) {
        messagingTemplate.convertAndSend(topic, event);
        log.info("WS EVENT ({}): {} with id {}", topic, event.getEventType(), event.getEntityId());
    }

    public void sendCoordinatesEvent(WebSocketEvent event) {
        messagingTemplate.convertAndSend("/topic/coordinates", event);
        log.info(
            "WS EVENT (coordinates): {} with id {}", event.getEventType(), event.getEntityId());
    }

    public void sendEventEvent(WebSocketEvent event) {
        messagingTemplate.convertAndSend("/topic/events", event);
        log.info("WS EVENT (event): {} with id {}", event.getEventType(), event.getEntityId());
    }

    public void sendLocationEvent(WebSocketEvent event) {
        messagingTemplate.convertAndSend("/topic/locations", event);
        log.info("WS EVENT (location): {} with id {}", event.getEventType(), event.getEntityId());
    }

    public void sendPersonEvent(WebSocketEvent event) {
        messagingTemplate.convertAndSend("/topic/persons", event);
        log.info("WS EVENT (person): {} with id {}", event.getEventType(), event.getEntityId());
    }

    public void sendTicketEvent(WebSocketEvent event) {
        messagingTemplate.convertAndSend("/topic/tickets", event);
        log.info("WS EVENT (ticket): {} with id {}", event.getEventType(), event.getEntityId());
    }

    public void sendVenueEvent(WebSocketEvent event) {
        messagingTemplate.convertAndSend("/topic/venues", event);
        log.info("WS EVENT (venue): {} with id {}", event.getEventType(), event.getEntityId());
    }
}
