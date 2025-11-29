package com.ticketis.app.service.fileImport;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketis.app.exception.importBusinessException.NoImportProcessorException;
import com.ticketis.app.importProcessor.ImportProcessor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
public class ImportProcessorDispatcher {

    private final ObjectMapper objectMapper;
    private final Map<String, ImportProcessor> processorMap;

    private final AsyncImportService distributedImportService;
    private final FileStorageService fileStorageService;

    @Value("${app.import.distributed-threshold}")
    private Integer distributedThreshold;

    public ImportProcessorDispatcher(ObjectMapper objectMapper,
            AsyncImportService distributedImportService,
            FileStorageService fileStorageService,
            List<ImportProcessor> processors) {

        this.objectMapper = objectMapper;
        this.distributedImportService = distributedImportService;
        this.fileStorageService = fileStorageService;
        this.processorMap = processors.stream()
                .collect(Collectors.toMap(
                        p -> p.getEntityType().toLowerCase(),
                        p -> p));
    }

    public ImportProcessor findProcessor(String entityType) {
        if (entityType == null || entityType.isBlank()) {
            throw new IllegalArgumentException("Entity type is required");
        }

        String normalizedType = entityType.toLowerCase().trim();
        ImportProcessor processor = processorMap.get(normalizedType);

        if (processor == null) {
            throw new NoImportProcessorException(entityType);
        }

        return processor;
    }
}