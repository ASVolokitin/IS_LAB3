package com.ticketis.app.service.fileImport;

import com.fasterxml.jackson.databind.JsonNode;
import com.ticketis.app.dto.jms.ImportBatchEntity;
import com.ticketis.app.dto.jms.ImportBatchMessage;
import com.ticketis.app.model.ImportHistoryItem;
import com.ticketis.app.model.enums.ImportStatus;
import jakarta.jms.Queue;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jms.core.JmsTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class AsyncImportService {

    private final JmsTemplate jmsTemplate;
    private final Queue importBatchQueue;
    private final ImportHistoryService historyService;
    private final ImportProgressTrackingService trackingService;
    private final ImportBatchService batchService;

    public Long startAsyncImport(List<JsonNode> entities, String entityType, String filename, Long importHistoryId) {

        log.info("Starting distributed import task: {} for {} entities", importHistoryId, entities.size());

        historyService.updateStatus(importHistoryId, ImportStatus.PROCESSING,
                String.format("Distributed import started. Processing %d records in batches", entities.size()));

        List<List<JsonNode>> batches = splitIntoBatches(entities);

        sendBatchesToQueue(batches, entityType, importHistoryId);
        trackingService.initializeProgress(importHistoryId, batches.size(), entities.size(), true);

        log.info("Sent {} batches to queue for task: {}", batches.size(), importHistoryId);
        return importHistoryId;
    }

    private List<List<JsonNode>> splitIntoBatches(List<JsonNode> entities) {
        int totalRecords = entities.size();
        int batchSize = calculateBatchSize(totalRecords);

        List<List<JsonNode>> batches = new ArrayList<>();
        for (int i = 0; i < totalRecords; i += batchSize) {
            int end = Math.min(i + batchSize, totalRecords);
            batches.add(new ArrayList<>(entities.subList(i, end)));
        }

        log.info("Split {} records into {} batches (batch size: {})",
                totalRecords, batches.size(), batchSize);
        return batches;
    }

    private int calculateBatchSize(int totalRecords) {
        double percentage = 5 + (Math.random() * 5);
        int batchSize = (int) (totalRecords * (percentage / 100));
        return Math.max(1000, Math.min(batchSize, 50000));
    }

    private void sendBatchesToQueue(List<List<JsonNode>> batches, String entityType, Long importHistoryId) {
        int totalBatches = batches.size();
        int totalRecords = batches.stream().mapToInt(List::size).sum();

        for (int i = 0; i < batches.size(); i++) {
            ImportBatchEntity batchEntity = createBatch(
                    importHistoryId,
                    i + 1,
                    batches.get(i));

            ImportBatchMessage batchMessage = new ImportBatchMessage(
                    batchEntity.getId(),
                    importHistoryId,
                    entityType,
                    batches.get(i),
                    i + 1,
                    totalBatches,
                    totalRecords);

            jmsTemplate.convertAndSend(importBatchQueue, batchMessage);

            log.debug("Sent batch {}/{} to queue. Batch size: {}", i + 1, totalBatches, batches.get(i).size());
        }
    }

    @Transactional
    private ImportBatchEntity createBatch(Long importHistoryId, int batchNumber, List<JsonNode> records) {
        ImportHistoryItem importHistoryItem = historyService.getImportItemById(importHistoryId);

        ImportBatchEntity batchEntity = new ImportBatchEntity();
        batchEntity.setImportHistoryItem(importHistoryItem);
        batchEntity.setBatchNumber(batchNumber);
        batchEntity.setBatchSize(records.size());
        batchEntity.setBatchStatus(ImportStatus.PENDING.name());
        batchEntity.setRecords(records);
        batchEntity.setTotalRecords(records.size());
        batchEntity.setProcessedRecords(0);

        ImportBatchEntity savedBatch = batchService.createBatch(batchEntity);        
        return savedBatch;
    }
}