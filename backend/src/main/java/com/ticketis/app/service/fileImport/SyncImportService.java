package com.ticketis.app.service.fileImport;

import com.fasterxml.jackson.databind.JsonNode;
import com.ticketis.app.controller.WebSocketEventController;
import com.ticketis.app.dto.ImportWebSocketEvent;
import com.ticketis.app.importProcessor.ImportProcessor;
import com.ticketis.app.model.enums.ImportStatus;
import com.ticketis.app.model.enums.WebSocketEventType;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class SyncImportService {

    private final ImportProcessorDispatcher processorDispatcher;
    private final ImportHistoryService historyService;
    private final ImportProgressTrackingService trackingService;
    private final WebSocketEventController webSocketController;

    @Transactional
    public List<String> startSyncImport(List<JsonNode> nodes, String entityType, String filename,
            Long importHistoryId) {

        String taskId = "sync_" + System.currentTimeMillis() + "_" + importHistoryId;
        log.info("Starting synchronous import task: {} for {} entities", taskId, nodes.size());
        ImportProcessor processor = processorDispatcher.findProcessor(entityType);
        
        List<String> errors = new ArrayList();
        historyService.updateStatus(importHistoryId, ImportStatus.PENDING,
                String.format("Synchronous import started. Processing %d records", nodes.size()));

        trackingService.initializeProgress(importHistoryId, 1, nodes.size());

        for (int i = 0; i < nodes.size(); i++) {
            errors.addAll(processor.importEntity(nodes.get(i), i));

            if (i % (nodes.size() / 10) == 0) {
                historyService.updateStatus(importHistoryId, ImportStatus.PROCESSING,
                        String.format("Processed %d records", i));
                ImportWebSocketEvent event = new ImportWebSocketEvent(WebSocketEventType.SYNC_IMPORT_PROGRESS_PROCESSING,
                        importHistoryId);
                webSocketController.sendImportEvent(event);
            }

        }
        if (errors.size() == 0) {
            historyService.updateStatus(importHistoryId, ImportStatus.SUCCESS,
                    String.format("Sucessfully imported %d ticket(s)", nodes.size()));
            ImportWebSocketEvent event = new ImportWebSocketEvent(WebSocketEventType.SYNC_IMPORT_PROGRESS_SUCCESS, importHistoryId);
            webSocketController.sendImportEvent(event);
        } else {
            historyService.updateStatus(importHistoryId, ImportStatus.FAILED, errors.get(0));
            ImportWebSocketEvent event = new ImportWebSocketEvent(WebSocketEventType.SYNC_IMPORT_PROGRESS_FAILED, importHistoryId);
            webSocketController.sendImportEvent(event);
        }

        return errors;
    }

}
