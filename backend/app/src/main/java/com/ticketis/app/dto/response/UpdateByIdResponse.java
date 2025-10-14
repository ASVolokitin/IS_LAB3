package com.ticketis.app.dto.response;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class UpdateByIdResponse {
    Number entityId;
    String message;
     LocalDateTime timestamp;

    public UpdateByIdResponse(Number entityId, String message) {
        this.entityId = entityId;
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }
}
