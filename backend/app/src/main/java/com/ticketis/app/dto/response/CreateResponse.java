package com.ticketis.app.dto.response;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class CreateResponse {
    Number entityId;
    String message;
    private final LocalDateTime timestamp;

    public CreateResponse(Number entityId, String message) {
        this.entityId = entityId;
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }

}
