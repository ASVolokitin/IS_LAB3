package com.ticketis.app.service.fileImport;

import com.ticketis.app.controller.WebSocketEventController;
import com.ticketis.app.dto.ImportWebSocketEvent;
import com.ticketis.app.dto.jms.ImportBatchEntity;
import com.ticketis.app.dto.jms.ImportBatchMessage;
import com.ticketis.app.importProcessor.ImportProcessor;
import com.ticketis.app.model.enums.BatchStatus;
import com.ticketis.app.model.enums.ImportStatus;
import com.ticketis.app.model.enums.WebSocketEventType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.persistence.exceptions.DatabaseException;
import org.postgresql.util.PSQLException;
import org.springframework.jms.annotation.JmsListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionSystemException;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
@Slf4j
@RequiredArgsConstructor
public class ImportBatchWorker {

        private final ImportProcessorDispatcher processorDispatcher;
        private final ImportProgressTrackingService trackingService;
        private final PlatformTransactionManager transactionManager;
        private final ImportHistoryService historyService;
        private final ImportBatchService batchService;
        private final WebSocketEventController webSocketController;

        @JmsListener(destination = "import.batch.queue", containerFactory = "queueListenerFactory")
        public void processBatch(ImportBatchMessage batchMessage) {
                try {
                        log.info("Processing batch {}/{} for task: {}",
                                        batchMessage.getBatchNumber(), batchMessage.getTotalBatches(),
                                        batchMessage.getImportHistoryId());

                        updateBatchStatus(batchMessage.getBatchId(), BatchStatus.PROCESSING, 0);

                        ProcessResult result = processBatchData(batchMessage);

                        updateFinalStatus(batchMessage, result);

                        log.info("Finished processing batch {} with {}/{} successful records",
                                        batchMessage.getBatchId(), result.getSuccessCount(),
                                        batchMessage.getRecords().size());

                        refreshHistoryStatus(batchMessage.getImportHistoryId());

                } catch (Exception e) {
                        log.error("Failed to process batch {}: {}", batchMessage.getBatchId(), e.getMessage());
                        markBatchAsFailed(batchMessage, e.getMessage());
                }
        }

        public ProcessResult processBatchData(ImportBatchMessage batchMessage) {
                TransactionTemplate transactionTemplate = new TransactionTemplate(transactionManager);
                transactionTemplate.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
                transactionTemplate.setReadOnly(false);

                return transactionTemplate.execute(status -> {
                        ImportProcessor processor = processorDispatcher.findProcessor(batchMessage.getEntityType());
                        List<String> errors = new ArrayList<>();
                        int successCount = 0;

                        for (int i = 0; i < batchMessage.getRecords().size(); i++) {
                                try {
                                        List<String> recordErrors = retryImportEntity(processor,
                                                        batchMessage.getRecords().get(i), i);

                                        if (recordErrors.isEmpty()) {
                                                successCount++;
                                        } else {
                                                errors.addAll(recordErrors);
                                        }

                                        if (i > 0 && i % (batchMessage.getRecords().size() / 10) == 0) {
                                                updateBatchProgress(batchMessage.getBatchId(), i);
                                        }

                                } catch (Exception e) {
                                        log.error("Error processing record {} in batch {}/{}: {}", i,
                                                        batchMessage.getBatchNumber(), batchMessage.getTotalBatches(),
                                                        e.getMessage());
                                        errors.add("Record " + i + ": " + e.getMessage());

                                }
                        }

                        return new ProcessResult(successCount, errors);
                });
        }

        @Getter
        @AllArgsConstructor
        public static class ProcessResult {
                private int successCount;
                private List<String> errors;
        }

        public void updateBatchStatus(Long batchId, BatchStatus status, int processed) {
                TransactionTemplate transactionTemplate = new TransactionTemplate(transactionManager);
                transactionTemplate.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);

                transactionTemplate.executeWithoutResult(txStatus -> {
                        ImportBatchEntity batchEntity = getBatchWithRetry(batchId, 3);
                        if (batchEntity != null) {
                                batchEntity.setBatchStatus(status.name());
                                batchEntity.setProcessedRecords(processed);
                                batchService.saveBatch(batchEntity);
                                log.debug("Updated batch {} status to {}", batchId, status);
                        }
                });
        }

        public void updateBatchProgress(Long batchId, int processed) {
                TransactionTemplate transactionTemplate = new TransactionTemplate(transactionManager);
                transactionTemplate.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);

                transactionTemplate.executeWithoutResult(status -> {
                        ImportBatchEntity batchEntity = getBatchWithRetry(batchId, 3);
                        if (batchEntity != null) {
                                batchEntity.setProcessedRecords(processed);
                                batchService.saveBatch(batchEntity);
                                log.debug("Updated batch {} progress to {}", batchId, processed);
                        }
                });
        }

        public void updateFinalStatus(ImportBatchMessage batchMessage, ProcessResult result) {
                TransactionTemplate transactionTemplate = new TransactionTemplate(transactionManager);
                transactionTemplate.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);

                transactionTemplate.executeWithoutResult(status -> {
                        BatchStatus finalStatus = determineFinalStatus(result.getSuccessCount(),
                                        batchMessage.getRecords().size());

                        ImportBatchEntity batchEntity = getBatchWithRetry(batchMessage.getBatchId(), 3);
                        if (batchEntity != null) {
                                batchEntity.setBatchStatus(finalStatus.name());
                                batchEntity.setProcessedRecords(result.getSuccessCount());
                                batchService.saveBatch(batchEntity);
                                log.info("Updated batch {} final status to {}", batchMessage.getBatchId(), finalStatus);
                        }

                        trackingService.updateBatchProgress(batchMessage.getImportHistoryId(),
                                        batchMessage.getBatchId(), result.getSuccessCount(),
                                        batchMessage.getRecords().size() - result.getSuccessCount(), finalStatus);

                        refreshHistoryStatus(batchMessage.getImportHistoryId());
                });
        }

        public void markBatchAsFailed(ImportBatchMessage batchMessage, String errorMessage) {
                TransactionTemplate transactionTemplate = new TransactionTemplate(transactionManager);
                transactionTemplate.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);

                transactionTemplate.executeWithoutResult(status -> {
                        ImportBatchEntity batchEntity = getBatchWithRetry(batchMessage.getBatchId(), 3);
                        if (batchEntity != null) {
                                batchEntity.setBatchStatus(BatchStatus.FAILED.name());
                                batchService.saveBatch(batchEntity);
                                log.error("Marked batch {} as FAILED: {}", batchMessage.getBatchId(), errorMessage);
                        }

                        trackingService.updateBatchProgress(batchMessage.getImportHistoryId(),
                                        batchMessage.getBatchId(), 0,
                                        batchMessage.getRecords().size(), BatchStatus.FAILED);

                        refreshHistoryStatus(batchMessage.getImportHistoryId());
                });
        }

        public void refreshHistoryStatus(Long historyId) {
                TransactionTemplate transactionTemplate = new TransactionTemplate(transactionManager);
                transactionTemplate.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);

                transactionTemplate.executeWithoutResult(status -> {
                        System.out.println("Refreshing import status");
                        List<ImportBatchEntity> batches = batchService.getBatchesByImportHistoryItemId(historyId);

                        if (batches == null || batches.isEmpty()) {
                                return;
                        }

                        boolean hasProcessing = false;
                        boolean hasSuccess = false;
                        boolean hasFailed = false;

                        for (ImportBatchEntity batch : batches) {
                                String statusStr = batch.getBatchStatus();
                                if (statusStr == null) {
                                        continue;
                                }

                                BatchStatus batchStatus = parseBatchStatus(statusStr);
                                if (batchStatus == null) {
                                        log.warn("Unknown batch status: {} for batch {}", statusStr, batch.getId());
                                        continue;
                                }

                                if (batchStatus == BatchStatus.PROCESSING || batchStatus == BatchStatus.PENDING) {
                                        hasProcessing = true;
                                } else if (batchStatus == BatchStatus.SUCCESS) {
                                        hasSuccess = true;
                                } else if (batchStatus == BatchStatus.FAILED) {
                                        hasFailed = true;
                                }
                        }

                        ImportStatus importStatus;
                        String description;

                        if (hasProcessing) {
                                importStatus = ImportStatus.PROCESSING;
                                long processingCount = batches.stream()
                                                .map(ImportBatchEntity::getBatchStatus)
                                                .filter(Objects::nonNull)
                                                .map(this::parseBatchStatus)
                                                .filter(bs -> bs != null && (bs == BatchStatus.PROCESSING
                                                                || bs == BatchStatus.PENDING))
                                                .count();
                                description = String.format("Processing batches. Completed: %d/%d",
                                                batches.size() - (int) processingCount, batches.size());
                        } else if (hasSuccess && hasFailed) {
                                importStatus = ImportStatus.PARTIAL_SUCCESS;
                                long successCount = batches.stream()
                                                .map(ImportBatchEntity::getBatchStatus)
                                                .filter(Objects::nonNull)
                                                .map(this::parseBatchStatus)
                                                .filter(bs -> bs != null && bs == BatchStatus.SUCCESS)
                                                .count();
                                long failedCount = batches.stream()
                                                .map(ImportBatchEntity::getBatchStatus)
                                                .filter(Objects::nonNull)
                                                .map(this::parseBatchStatus)
                                                .filter(bs -> bs != null && bs == BatchStatus.FAILED)
                                                .count();
                                description = String.format("Partial success: %d batches succeeded, %d batches failed",
                                                successCount, failedCount);
                        } else if (hasSuccess && !hasFailed) {
                                importStatus = ImportStatus.SUCCESS;
                                description = String.format("All %d batches completed successfully", batches.size());
                        } else if (hasFailed && !hasSuccess) {
                                importStatus = ImportStatus.FAILED;
                                description = String.format("All %d batches failed", batches.size());
                        } else {
                                importStatus = ImportStatus.PROCESSING;
                                description = "Processing batches";
                        }

                        historyService.updateStatus(historyId, importStatus, description);

                        WebSocketEventType eventType = WebSocketEventType.ASYNC_IMPORT_PROGRESS_STARTED;
                        switch (importStatus) {

                                case PROCESSING:
                                        eventType = WebSocketEventType.ASYNC_IMPORT_PROGRESS_PROCESSING;
                                        break;

                                case PARTIAL_SUCCESS:
                                        eventType = WebSocketEventType.ASYNC_IMPORT_PROGRESS_PARTIAL_SUCCESS;
                                        break;

                                case SUCCESS:
                                        eventType = WebSocketEventType.ASYNC_IMPORT_PROGRESS_SUCCESS;
                                        break;

                                case FAILED:
                                        eventType = WebSocketEventType.ASYNC_IMPORT_PROGRESS_FAILED;
                                        break;

                                default:
                                        eventType = WebSocketEventType.ASYNC_IMPORT_PROGRESS_CHANGED;
                        }
                        ImportWebSocketEvent event = new ImportWebSocketEvent(eventType, historyId);
                        webSocketController.sendImportEvent(event);
                });
        }

        private BatchStatus determineFinalStatus(int successCount, int totalRecords) {
                if (successCount == totalRecords) {
                        return BatchStatus.SUCCESS;
                } else if (successCount > 0) {
                        return BatchStatus.PARTIAL_SUCCESS;
                } else {
                        return BatchStatus.FAILED;
                }
        }

        private BatchStatus parseBatchStatus(String status) {
                if (status == null) {
                        return null;
                }
                try {
                        return BatchStatus.valueOf(status);
                } catch (IllegalArgumentException e) {
                        return null;
                }
        }

        private List<String> retryImportEntity(ImportProcessor processor, com.fasterxml.jackson.databind.JsonNode node,
                        int nodeIndex) throws Exception {
                final int MAX_RETRIES = 10;
                Exception lastException = null;

                for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
                        try {
                                return processor.importEntity(node, nodeIndex);
                        } catch (Exception e) {
                                lastException = e;

                                if (isSerializableException(e)) {
                                        if (attempt < MAX_RETRIES) {
                                                long backoffMs = calculateBackoff(attempt);
                                                log.warn("Serializable exception on attempt {}/{} for record {}: {}. Retrying after {}ms",
                                                                attempt, MAX_RETRIES, nodeIndex, e.getMessage(),
                                                                backoffMs);
                                                try {
                                                        Thread.sleep(backoffMs);
                                                } catch (InterruptedException ie) {
                                                        Thread.currentThread().interrupt();
                                                        throw new RuntimeException("Retry interrupted", ie);
                                                }
                                        } else {
                                                log.error("Failed to process record {} after {} retries due to serializable exception: {}",
                                                                nodeIndex, MAX_RETRIES, e.getMessage());
                                        }
                                } else {
                                        log.error("Non-retryable exception processing record {}: {}", nodeIndex,
                                                        e.getMessage());
                                        throw e;
                                }
                        }
                }

                throw new RuntimeException("Failed to process record after " + MAX_RETRIES + " retries", lastException);
        }

        private boolean isSerializableException(Throwable throwable) {
                if (throwable == null) {
                        return false;
                }

                PSQLException psqlException = findPSQLException(throwable);
                if (psqlException != null && "40001".equals(psqlException.getSQLState())) {
                        return true;
                }

                if (throwable instanceof DatabaseException) {
                        DatabaseException dbEx = (DatabaseException) throwable;
                        String message = dbEx.getMessage();
                        if (message != null && message.contains(
                                        "could not serialize access due to read/write dependencies among transactions")) {
                                return true;
                        }

                        Throwable internalException = dbEx.getInternalException();
                        if (internalException instanceof PSQLException) {
                                PSQLException internalPsql = (PSQLException) internalException;
                                if ("40001".equals(internalPsql.getSQLState())) {
                                        return true;
                                }
                        }
                }

                if (throwable instanceof TransactionSystemException) {
                        return isSerializableException(throwable.getCause());
                }

                return isSerializableException(throwable.getCause());
        }

        private PSQLException findPSQLException(Throwable throwable) {
                if (throwable == null) {
                        return null;
                }

                if (throwable instanceof PSQLException) {
                        return (PSQLException) throwable;
                }

                if (throwable instanceof DatabaseException) {
                        DatabaseException dbEx = (DatabaseException) throwable;
                        Throwable internalException = dbEx.getInternalException();
                        if (internalException instanceof PSQLException) {
                                return (PSQLException) internalException;
                        }
                }

                return findPSQLException(throwable.getCause());
        }

        private ImportBatchEntity getBatchWithRetry(Long batchId, int maxRetries) {
                for (int attempt = 1; attempt <= maxRetries; attempt++) {
                        try {
                                ImportBatchEntity batch = batchService.getBatchById(batchId);
                                if (batch != null) {
                                        return batch;
                                }
                        } catch (Exception e) {
                                System.out.println("Concurrency exception while trying to get batch");
                                if (attempt < maxRetries) {
                                        long backoffMs = calculateBackoff(attempt);
                                        log.debug("Batch {} not found on attempt {}/{}, retrying after {}ms",
                                                        batchId, attempt, maxRetries, backoffMs);
                                        try {
                                                Thread.sleep(backoffMs);
                                        } catch (InterruptedException ie) {
                                                Thread.currentThread().interrupt();
                                                log.warn("Interrupted while waiting for batch {}", batchId);
                                                return null;
                                        }
                                } else {
                                        log.warn("Failed to find batch {} after {} attempts: {}",
                                                        batchId, maxRetries, e.getMessage());
                                }
                        }
                }
                return null;
        }

        private long calculateBackoff(int attempt) {
                long backoff = (long) (50 * Math.pow(2, attempt - 1));
                return Math.min(backoff, 1000);
        }
}
