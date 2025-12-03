package com.ticketis.app.service.fileImport;

import com.fasterxml.jackson.databind.JsonNode;
import com.ticketis.app.controller.WebSocketEventController;
import com.ticketis.app.dto.ImportWebSocketEvent;
import com.ticketis.app.exception.PassportIdAlreadyExistsException;
import com.ticketis.app.exception.TicketNameAlreadyExistsException;
import com.ticketis.app.importProcessor.ImportProcessor;
import com.ticketis.app.model.enums.ImportStatus;
import com.ticketis.app.model.enums.WebSocketEventType;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
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

        trackingService.initializeProgress(importHistoryId, 1, nodes.size(), false);

        try {
            for (int i = 0; i < nodes.size(); i++) {
                List<String> entityErrors = processor.importEntity(nodes.get(i), i);
                errors.addAll(entityErrors);

                if (i % (nodes.size() / 10) == 0) {
                    historyService.updateStatus(importHistoryId, ImportStatus.PROCESSING,
                            String.format("Processed %d records", i));
                    ImportWebSocketEvent event = new ImportWebSocketEvent(
                            WebSocketEventType.SYNC_IMPORT_PROGRESS_PROCESSING,
                            importHistoryId);
                    webSocketController.sendImportEvent(event);
                }
            }

            if (!errors.isEmpty()) {
                throw new RuntimeException("Import failed with " + errors.size() + " errors");
            }

            historyService.updateStatus(importHistoryId, ImportStatus.SUCCESS,
                    String.format("Successfully imported %d ticket(s)", nodes.size()));
            ImportWebSocketEvent event = new ImportWebSocketEvent(WebSocketEventType.SYNC_IMPORT_PROGRESS_SUCCESS,
                    importHistoryId);
            webSocketController.sendImportEvent(event);

        } catch (PassportIdAlreadyExistsException e) {

            log.error("Sync import failed (duplicating passport ID)");
            String errorMessage = !errors.isEmpty() ? errors.get(0) : e.getMessage();
            historyService.updateStatus(importHistoryId, ImportStatus.FAILED, errorMessage);
            ImportWebSocketEvent event = new ImportWebSocketEvent(WebSocketEventType.SYNC_IMPORT_PROGRESS_FAILED,
                    importHistoryId);
            webSocketController.sendImportEvent(event);
            throw e;

        } catch (TicketNameAlreadyExistsException e) {

            log.error("Sync import failed (duplicating ticket name)");
            String errorMessage = !errors.isEmpty() ? errors.get(0) : e.getMessage();
            historyService.updateStatus(importHistoryId, ImportStatus.FAILED, errorMessage);
            ImportWebSocketEvent event = new ImportWebSocketEvent(WebSocketEventType.SYNC_IMPORT_PROGRESS_FAILED,
                    importHistoryId);
            webSocketController.sendImportEvent(event);
            throw e;

        }

        return errors;
    }
}
