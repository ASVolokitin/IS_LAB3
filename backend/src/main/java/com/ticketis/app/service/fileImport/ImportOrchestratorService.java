package com.ticketis.app.service.fileImport;

import com.fasterxml.jackson.databind.JsonNode;
import com.ticketis.app.exception.importBusinessException.FileImportValidationException;
import com.ticketis.app.model.ImportResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

import static com.ticketis.app.util.JsonParser.parseJsonFile;

@Slf4j
@Service
@RequiredArgsConstructor
public class ImportOrchestratorService {

    private final FileStorageService fileStorageService;
    private final AsyncImportService asyncImportService;
    private final SyncImportService syncImportService;
    private final ImportHistoryService importHistoryService;

    @Value("${app.import.distributed-threshold}")
    private Integer asyncThreshold;

    public ImportResult startImport(String filename, String entityType)
            throws IOException {


        try (InputStream fileStream = fileStorageService.getFile(filename)) {

            List<JsonNode> nodes = parseJsonFile(fileStream);

            if (nodes.isEmpty()) {
                throw new FileImportValidationException(List.of("No entities found in JSON file"));
            }

            Long importHistoryId = importHistoryService.getImportItemNyFilename(filename).getId();
            if (nodes.size() > asyncThreshold) {
                log.info("Using asynchronous processing for {} records of type: {}", nodes.size(), entityType);
                return importAsync(nodes, entityType, filename, importHistoryId);
            } else {
                log.info("Using synchronous processing for {} records of type: {}", nodes.size(), entityType);
                return importSync(nodes, entityType, filename, importHistoryId);
            }
        }
    }

    private ImportResult importSync(List<JsonNode> entities, String entityType, String filename, Long importHistoryId) {
        List<String> errors = syncImportService.startSyncImport(entities, entityType, filename, importHistoryId);

        return ImportResult.builder()
                .processedCount(entities.size())
                .errorCount(errors.size())
                .errors(errors)
                .build();
    }

    private ImportResult importAsync(List<JsonNode> entities, String entityType, String filename,
            Long importHistoryId) {
        try {

            asyncImportService.startAsyncImport(entities, entityType, filename, importHistoryId);

            return ImportResult.builder()
                    .processedCount(0)
                    .errorCount(0)
                    .importHistoryId(importHistoryId)
                    .message(String.format(
                            "Asynchronous import started. Processing %d %s records. Use task ID '%s' to track progress.",
                            entities.size(), entityType, importHistoryId))
                    .isAsync(true)
                    .totalRecords(entities.size())
                    .build();

        } catch (Exception e) {
            log.error("Failed to start distributed import", e);
            throw new RuntimeException("Failed to start distributed import: " + e.getMessage(), e);
        }
    }
}
