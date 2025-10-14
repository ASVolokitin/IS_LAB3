package com.ticketis.app.dto;

import com.ticketis.app.model.enums.WebSocketEventType;
import java.time.LocalDateTime;
import lombok.Data;

@Data
public class WebSocketEvent {
    private WebSocketEventType eventType;
    private Number entityId;
    private LocalDateTime timestamp;

    public WebSocketEvent(WebSocketEventType eventType, Number entityId) {
        this.eventType = eventType;
        this.entityId = entityId;
    }
}
