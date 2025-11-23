package com.ticketis.app.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.ticketis.app.dto.response.ImportResponse;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
@RequiredArgsConstructor
public class ImportService {

    @Value("${app.import.upload-dir:uploads/import}")
    private String uploadDir;

    private final JsonImportParser jsonImportParser;
    private final List<ImportProcessor> importProcessors;

    public ImportResponse uploadFile(MultipartFile file, String entityType) {
        validateFile(file);
        
        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFilename = file.getOriginalFilename();
            String fileExtension = getFileExtension(originalFilename);
            
            if (!"json".equalsIgnoreCase(fileExtension)) {
                throw new IllegalArgumentException("Only JSON files are supported for import");
            }

            String uniqueFilename = UUID.randomUUID().toString() + "_" + originalFilename;
            Path filePath = uploadPath.resolve(uniqueFilename);
            
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            log.info("File uploaded successfully: {}", uniqueFilename);
            
            String message = processImportFile(filePath, entityType);
            
            return new ImportResponse(
                    uniqueFilename,
                    file.getSize(),
                    message,
                    entityType);
                    
        } catch (IOException e) {
            log.error("Error uploading file: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to upload file: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Error processing import: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to process import: " + e.getMessage(), e);
        }
    }

    @Transactional(rollbackFor = Exception.class)
    private String processImportFile(Path filePath, String entityType) throws Exception {
        log.info("Processing import file: {} for entity type: {}", filePath, entityType);
        
        List<JsonNode> entities = jsonImportParser.parseJsonFile(filePath);
        
        if (entities.isEmpty()) {
            throw new IllegalArgumentException("No entities found in JSON file");
        }
        
        ImportProcessor processor = findProcessor(entityType);
        if (processor == null) {
            throw new IllegalArgumentException("No processor found for entity type: " + entityType);
        }
        
        List<String> errors = processor.processImport(entities);
        
        if (!errors.isEmpty()) {
            String errorMessage = "Import completed with errors: " + String.join("; ", errors);
            log.warn(errorMessage);
            throw new RuntimeException(errorMessage);
        }
        
        return String.format("Successfully imported %d %s(s)", entities.size(), entityType);
    }

    private ImportProcessor findProcessor(String entityType) {
        if (entityType == null || entityType.isBlank()) {
            return null;
        }
        
        String normalizedType = entityType.toLowerCase().trim();
        
        Map<String, ImportProcessor> processorMap = importProcessors.stream()
                .collect(Collectors.toMap(
                    p -> p.getEntityType().toLowerCase(),
                    p -> p
                ));
        
        return processorMap.get(normalizedType);
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }
        
        if (file.getSize() == 0) {
            throw new IllegalArgumentException("File size cannot be zero");
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || filename.isEmpty()) {
            return "";
        }
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex == -1 || lastDotIndex == filename.length() - 1) {
            return "";
        }
        return filename.substring(lastDotIndex + 1).toLowerCase();
    }
}

