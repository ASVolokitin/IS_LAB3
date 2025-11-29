package com.ticketis.app.dto;

import com.ticketis.app.model.enums.WebSocketEventType;
import lombok.Data;

import java.time.Instant;

@Data
public class ImportWebSocketEvent {
    private WebSocketEventType eventType;
    private Long importHistoryId;
    private Instant timestamp = Instant.now();

    public ImportWebSocketEvent(WebSocketEventType eventType, Long importHistoryId) {
        this.eventType = eventType;
        this.importHistoryId = importHistoryId;
    }
}
