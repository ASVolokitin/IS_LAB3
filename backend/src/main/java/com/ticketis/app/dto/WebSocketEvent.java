package com.ticketis.app.dto;

import com.ticketis.app.model.enums.WebSocketEventType;

import java.time.Instant;
import lombok.Data;

@Data
public class WebSocketEvent {
    private WebSocketEventType eventType;
    private Number entityId;
    private Instant timestamp = Instant.now();

    public WebSocketEvent(WebSocketEventType eventType, Number entityId) {
        this.eventType = eventType;
        this.entityId = entityId;
    }
}
