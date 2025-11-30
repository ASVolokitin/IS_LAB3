package com.ticketis.app.service.fileImport;

import com.ticketis.app.dto.response.minio.FileUploadResponse;
import com.ticketis.app.exception.FailedToProcessImportException;
import com.ticketis.app.service.MinioService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileStorageService {

    private final MinioService minioService;

    public FileUploadResponse storeFile(MultipartFile file, String uniqueFilename) throws IOException {
        try {
            Map<String, String> metadata = new HashMap<>();
            metadata.put("original-filename", file.getOriginalFilename());
            metadata.put("uploaded-by", "spring-app");
            metadata.put("upload-timestamp", Instant.now().toString());
            metadata.put("content-type", file.getContentType());
            metadata.put("size", String.valueOf(file.getSize()));

            minioService.uploadFile(
                    uniqueFilename,
                    file.getInputStream(),
                    file.getContentType(),
                    metadata);

            String downloadUrl = minioService.getPresignedUrl(uniqueFilename);

            return FileUploadResponse.builder()
                    .fileId(uniqueFilename)
                    .fileName(file.getOriginalFilename())
                    .fileSize(file.getSize())
                    .contentType(file.getContentType())
                    .downloadUrl(downloadUrl)
                    .uploadTime(LocalDateTime.now())
                    .build();

        } catch (IOException e) {
            log.error("Error reading file stream: ", e.getMessage());
            throw new FailedToProcessImportException("Error ocurred while trying to save file");
        }
    }

    public InputStream getFile(String filename) {
        try {
            return minioService.downloadFile(filename);
        } catch (Exception e) {
            log.error("Failed to get file from MinIO: {}", filename, e);
            throw new FailedToProcessImportException("Error occurred while trying to read file from storage");
        }
    }

    public void deleteFile(String filename) {
        try {
            minioService.deleteFile(filename);
            log.debug("File deleted from MinIO: {}", filename);
        } catch (Exception e) {
            log.error("Failed to delete file from MinIO: {}", filename, e);
            throw new FailedToProcessImportException("Error occurred while trying to delete file");
        }
    }
}