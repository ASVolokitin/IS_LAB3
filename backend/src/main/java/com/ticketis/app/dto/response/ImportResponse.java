package com.ticketis.app.dto.response;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ImportResponse {
    
    private final LocalDateTime timestamp;
    private final String filename;
    private final Long fileSize;
    private final String message;
    private final String entityType;

    public ImportResponse(String filename, Long fileSize, String message, String entityType) {
        this.timestamp = LocalDateTime.now();
        this.filename = filename;
        this.fileSize = fileSize;
        this.message = message;
        this.entityType = entityType;
    }
}

