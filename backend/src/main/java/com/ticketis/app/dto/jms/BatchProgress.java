package com.ticketis.app.dto.jms;

import com.ticketis.app.model.enums.BatchStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
class BatchProgress {
    private Long batchId;
    private int processedRecords;
    private int errorCount;
    private BatchStatus status;
}
