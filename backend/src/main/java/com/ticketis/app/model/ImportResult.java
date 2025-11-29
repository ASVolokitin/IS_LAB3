package com.ticketis.app.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
public class ImportResult {

    private Integer processedCount;
    private Integer errorCount;
    private List<String> errors;

    private Long importHistoryId;
    private String message;
    private boolean isAsync;
    private Integer totalRecords;
}
