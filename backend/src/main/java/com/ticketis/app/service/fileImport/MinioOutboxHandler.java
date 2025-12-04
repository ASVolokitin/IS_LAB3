package com.ticketis.app.service.fileImport;

import com.ticketis.app.exception.minio.MinioDeleteFileException;
import com.ticketis.app.exception.minio.MinioException;
import com.ticketis.app.exception.minio.MinioUploadFileException;
import com.ticketis.app.repository.FileOutboxRepository;
import com.ticketis.app.service.MinioService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jms.annotation.JmsListener;
import org.springframework.stereotype.Component;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.io.InputStream;
import java.io.ByteArrayInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.Map;

@Component
@Slf4j
@RequiredArgsConstructor
public class MinioOutboxHandler {

    private final MinioService minioService;
    private final FileOutboxRepository fileOutboxRepository;

    @JmsListener(destination = "minio.operations.queue")
    @Transactional
    public void handleOutboxEvent(Map<String, Object> message) {
        Long id = ((Number) message.get("id")).longValue();
        String operation = (String) message.get("operation");
        String fileName = (String) message.get("fileName");
        String filePath = (String) message.get("filePath");

        log.info("JMS received: id={}, operation={}, file={}",
                id, operation, fileName);

        try {
            if ("UPLOAD".equals(operation)) {
                handleUpload(id, fileName, filePath);
            } else if ("DELETE".equals(operation)) {
                handleDelete(id, fileName);
            } else {
                log.warn("Unknown operation: {}", operation);
                return;
            }

            fileOutboxRepository.markAsProcessed(id, Instant.now());

            log.info("Successfully processed outbox event: {}", id);

        } catch (IOException e) {
            log.error("Failed to process event {} (could not find import file)");

        } catch (MinioException e) {
            log.error("Failed to process event {} (service unavailable)", id);
        }
    }

    private void handleUpload(Long eventId, String fileName, String filePath) throws IOException {
        log.info("Uploading to MinIO: {}", fileName);

        Path path = Paths.get(filePath);
        if (!Files.exists(path)) {
            throw new FileNotFoundException("File not found: " + filePath);
        }

        byte[] content = Files.readAllBytes(path);

        try (InputStream stream = new ByteArrayInputStream(content)) {
            minioService.uploadFile(
                    fileName,
                    stream,
                    "application/octet-stream",
                    Map.of("eventId", eventId.toString()));
        } catch (MinioUploadFileException e) {
            log.error("Failed to upload file to MinIO (service unavailable)");
            throw e;
        }

        log.info("Uploaded to MinIO: {}", fileName);

        Files.deleteIfExists(path);
        log.debug("Deleted temp file: {}", filePath);
    }

    private void handleDelete(Long eventId, String fileName) {
        log.info("Deleting from MinIO: {}", fileName);

        try {
            minioService.deleteFile(fileName);
            log.info("Deleted from MinIO: {}", fileName);
        } catch (MinioDeleteFileException e) {
            log.error("Failed to detele file from MinIO (service unavailable)");
            throw e;
        } catch (Exception e) {
            if (e.getMessage() != null &&
                    (e.getMessage().contains("NoSuchKey") ||
                            e.getMessage().contains("not found"))) {
                log.info("File already deleted: {}", fileName);
                return;
            }
        }
    }
}