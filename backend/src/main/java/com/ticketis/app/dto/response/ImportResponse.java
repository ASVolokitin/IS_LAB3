package com.ticketis.app.dto.response;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@Builder
public class ImportResponse {
    
    private final LocalDateTime timestamp;
    private final String filename;
    private final Long fileSize;
    private final String message;
    private final String entityType;
    private Integer processedCount;
    private Integer errorCount;

    public ImportResponse(String filename, Long fileSize, String message, String entityType, Integer processedCount, Integer errorCount) {
        this.timestamp = LocalDateTime.now();
        this.filename = filename;
        this.fileSize = fileSize;
        this.message = message;
        this.entityType = entityType;
    }
}

