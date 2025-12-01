package com.ticketis.app.service.fileImport;

import com.ticketis.app.controller.WebSocketEventController;
import com.ticketis.app.dto.ImportWebSocketEvent;
import com.ticketis.app.dto.jms.ImportProgress;
import com.ticketis.app.model.enums.BatchStatus;
import com.ticketis.app.model.enums.ImportStatus;
import com.ticketis.app.model.enums.WebSocketEventType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
@RequiredArgsConstructor
public class ImportProgressTrackingService {

    private final WebSocketEventController webSocketEventController;
    private final ImportHistoryService importHistoryService;
    private final Map<Long, ImportProgress> progressMap = new ConcurrentHashMap<>();

    public void initializeProgress(Long importHistoryId, int totalBatches, int totalRecords) {
        ImportProgress progress = new ImportProgress(importHistoryId, totalBatches, totalRecords);
        progressMap.put(importHistoryId, progress);
        sendProgressEvent(progress, WebSocketEventType.ASYNC_IMPORT_PROGRESS_STARTED, "Import task initialized");

        log.info("Initialized progress tracking for task: {}, total batches: {}, total records: {}", importHistoryId,
                totalBatches, totalRecords);
    }

    public void updateBatchProgress(Long importHistoryId, Long batchId, int processedRecords, int errorCount,
            BatchStatus status) {
        ImportProgress progress = progressMap.get(importHistoryId);
        if (progress == null) {
            log.warn("Progress not found for task: {}", importHistoryId);
            return;
        }

        progress.updateBatch(batchId, processedRecords, errorCount, status);
        sendProgressEvent(progress, WebSocketEventType.UPDATED, getProgressMessage(progress));
        updateDatabaseStatus(progress);

        log.debug("Updated progress for task: {}, batch: {}, status: {}", importHistoryId, batchId, status);
    }

    public ImportProgress getProgress(String taskId) {
        return progressMap.get(taskId);
    }

    private void sendProgressEvent(ImportProgress progress, WebSocketEventType eventType, String message) {
        ImportWebSocketEvent event = new ImportWebSocketEvent(eventType, progress.getImportHistoryId());
        webSocketEventController.sendImportEvent(event);
    }

    private String getProgressMessage(ImportProgress progress) {
        if (progress.isCompleted()) {
            return String.format("Import completed. Processed: %d, Errors: %d",
                    progress.getTotalProcessed(), progress.getTotalErrors());
        } else if (progress.isFailed()) {
            return String.format("Import failed. Processed: %d, Errors: %d",
                    progress.getTotalProcessed(), progress.getTotalErrors());
        } else {
            return String.format("Proccessed %d/%d batches",
                    progress.getCompletedBatches(), progress.getTotalBatches(),
                    progress.getTotalProcessed(), progress.getTotalRecords());
        }
    }

    private void updateDatabaseStatus(ImportProgress progress) {
        try {
            if (progress.isCompleted()) {
                String message = String.format("Import completed. Processed: %d, Errors: %d",
                        progress.getTotalProcessed(), progress.getTotalErrors());
                ImportStatus status = progress.isFailed() ? ImportStatus.FAILED : ImportStatus.SUCCESS;
                importHistoryService.updateStatus(progress.getImportHistoryId(), status, message);

                sendProgressEvent(progress, WebSocketEventType.UPDATED, message);

                progressMap.remove(progress.getImportHistoryId());
                log.info("Import task {} completed with status: {}", progress.getImportHistoryId(), status);

            } else {
                String message = getProgressMessage(progress);
                importHistoryService.updateStatus(progress.getImportHistoryId(), ImportStatus.PROCESSING, message);
            }
        } catch (Exception e) {
            log.error("Failed to update database status for task: {}", progress.getImportHistoryId(), e);
        }
    }
}
