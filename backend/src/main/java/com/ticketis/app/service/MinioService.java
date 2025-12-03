package com.ticketis.app.service;

import com.ticketis.app.dto.response.minio.FileUploadResponse;
import com.ticketis.app.exception.FailedToProcessImportException;
import com.ticketis.app.exception.minio.MinioDeleteFileException;
import com.ticketis.app.exception.minio.MinioDownloadFileException;
import com.ticketis.app.exception.minio.MinioUploadFileException;
import io.minio.*;
import io.minio.errors.ErrorResponseException;
import io.minio.errors.InsufficientDataException;
import io.minio.errors.InternalException;
import io.minio.http.Method;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.ConnectException;
import java.net.NoRouteToHostException;
import java.net.SocketTimeoutException;
import java.net.UnknownHostException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class MinioService {

    private final MinioClient minioClient;
    private final String bucketName;
    private final Integer presignedUrlExpiry;

    public MinioService(MinioClient minioClient, 
                       @Value("${minio.bucket-name}") String bucketName,
                       @Value("${minio.presigned-url-expiry}") Integer presignedUrlExpiry) {
        this.minioClient = minioClient;
        this.bucketName = bucketName;
        this.presignedUrlExpiry = presignedUrlExpiry;
    }

    @PostConstruct
    public void init() {
        try {
            boolean isExist = minioClient.bucketExists(BucketExistsArgs.builder()
                    .bucket(bucketName)
                    .build());
            
            if (!isExist) {
                minioClient.makeBucket(MakeBucketArgs.builder()
                        .bucket(bucketName)
                        .build());
                log.info("Bucket '{}' created successfully", bucketName);
            } else {
                log.info("Bucket '{}' already exists", bucketName);
            }
        } catch (Exception e) {
            log.error("Error initializing MinIO bucket: {}", e.getMessage());
            throw new RuntimeException("MinIO initialization failed", e);
        }
    }

    public boolean healthcheck() {
        try {
            minioClient.bucketExists(BucketExistsArgs.builder()
                    .bucket(bucketName)
                    .build());
            log.info("MinIO health check passed");
            return true;
        } catch (Exception e) {
            log.warn("MinIO health check failed: {}", e.getMessage());
            return false;
        }
    }

    public String uploadFile(String objectName, InputStream inputStream, 
                           String contentType, Map<String, String> metadata) {
        try {
            PutObjectArgs putObjectArgs = PutObjectArgs.builder()
                    .bucket(bucketName)
                    .object(objectName)
                    .stream(inputStream, -1, 10485760)
                    .contentType(contentType)
                    .userMetadata(metadata)
                    .build();

            minioClient.putObject(putObjectArgs);
            
            log.info("File '{}' uploaded with metadata: {}", objectName, metadata);
            return objectName;
            
        } catch (Exception e) {
            throw new MinioUploadFileException(objectName, bucketName);
        }
    }

    public String getPresignedUrl(String objectName) {
        try {
            return minioClient.getPresignedObjectUrl(GetPresignedObjectUrlArgs.builder()
                    .method(Method.GET)
                    .bucket(bucketName)
                    .object(objectName)
                    .expiry(presignedUrlExpiry)
                    .build());
        } catch (Exception e) {
            log.error("Error generating presigned URL for object '{}': {}", objectName, e.getMessage(), e);
            String errorMessage = extractMinioErrorMessage(e, "generate download URL");
            throw new RuntimeException(errorMessage, e);
        }
    }
    public FileUploadResponse storeFile(MultipartFile file, String uniqueFilename) throws IOException {
        try {
            Map<String, String> metadata = new HashMap<>();
            metadata.put("original-filename", file.getOriginalFilename());
            metadata.put("uploaded-by", "spring-app");
            metadata.put("upload-timestamp", Instant.now().toString());
            metadata.put("content-type", file.getContentType());
            metadata.put("size", String.valueOf(file.getSize()));
            metadata.put("transactional", "true");

            uploadFile(
                    uniqueFilename,
                    file.getInputStream(),
                    file.getContentType(),
                    metadata);

            String downloadUrl = getPresignedUrl(uniqueFilename);

            return FileUploadResponse.builder()
                    .fileId(uniqueFilename)
                    .fileName(file.getOriginalFilename())
                    .fileSize(file.getSize())
                    .contentType(file.getContentType())
                    .downloadUrl(downloadUrl)
                    .uploadTime(LocalDateTime.now())
                    .build();

        } catch (FailedToProcessImportException e) {
            throw e;
        } catch (IOException e) {
            log.error("Error reading file stream for file '{}': {}", file.getOriginalFilename(), e.getMessage(), e);
            throw new FailedToProcessImportException("Error occurred while reading file: " + e.getMessage());
        } catch (RuntimeException e) {
            log.error("Error storing file '{}' in MinIO: {}", file.getOriginalFilename(), e.getMessage(), e);
            String errorMessage = extractMinioErrorMessage(e, "store file");
            throw new FailedToProcessImportException(errorMessage);
        } catch (Exception e) {
            log.error("Unexpected error storing file '{}' in MinIO: {}", file.getOriginalFilename(), e.getMessage(), e);
            String errorMessage = extractMinioErrorMessage(e, "store file");
            throw new FailedToProcessImportException(errorMessage);
        }
    }

    public InputStream downloadFile(String objectName) {
        try {
            return minioClient.getObject(GetObjectArgs.builder()
                    .bucket(bucketName)
                    .object(objectName)
                    .build());
        } catch (Exception e) {
            throw new MinioDownloadFileException(objectName, bucketName);
        }
    }

    public boolean safeDeleteFile(String objectName) {
        try {
            deleteFile(objectName);
            return true;
        } catch (MinioDeleteFileException e) {
            return false;
        }
    }

    public void deleteFile(String objectName) {
        try {
            minioClient.removeObject(RemoveObjectArgs.builder()
                    .bucket(bucketName)
                    .object(objectName)
                    .build());
            log.info("File '{}' deleted from bucket '{}'", objectName, bucketName);
        } catch (Exception e) {
            throw new MinioDeleteFileException(objectName, bucketName);
        }
    }

    private String extractMinioErrorMessage(Exception e, String operation) {
        Throwable cause = e.getCause();
        String exceptionMessage = e.getMessage();
        String lowerMessage = exceptionMessage != null ? exceptionMessage.toLowerCase() : "";

        if (e instanceof ConnectException || 
            (cause instanceof ConnectException) ||
            lowerMessage.contains("connection refused") ||
            lowerMessage.contains("connection reset") ||
            lowerMessage.contains("connection timed out")) {
            return String.format(
                "MinIO storage service is currently unavailable. Cannot %s. " +
                "Please check if MinIO service is running and accessible. " +
                "Original error: %s",
                operation, exceptionMessage != null ? exceptionMessage : "Connection refused");
        }

        if (e instanceof UnknownHostException || 
            (cause instanceof UnknownHostException) ||
            lowerMessage.contains("unknown host") ||
            lowerMessage.contains("name or service not known")) {
            return String.format(
                "Cannot reach MinIO storage service: hostname cannot be resolved. " +
                "Cannot %s. Please check MinIO endpoint configuration. " +
                "Original error: %s",
                operation, exceptionMessage != null ? exceptionMessage : "Unknown host");
        }

        if (e instanceof SocketTimeoutException || 
            (cause instanceof SocketTimeoutException) ||
            lowerMessage.contains("read timed out") ||
            lowerMessage.contains("timeout")) {
            return String.format(
                "MinIO storage service did not respond in time. " +
                "Cannot %s. The service may be overloaded or unreachable. " +
                "Original error: %s",
                operation, exceptionMessage != null ? exceptionMessage : "Request timeout");
        }

        if (e instanceof NoRouteToHostException || 
            (cause instanceof NoRouteToHostException) ||
            lowerMessage.contains("no route to host")) {
            return String.format(
                "Cannot establish connection to MinIO storage service. " +
                "Cannot %s. Network routing issue detected. " +
                "Original error: %s",
                operation, exceptionMessage != null ? exceptionMessage : "No route to host");
        }

        if (e instanceof ErrorResponseException) {
            ErrorResponseException errorResponse = (ErrorResponseException) e;
            String errorCode = errorResponse.errorResponse().code();
            String errorMessage = errorResponse.errorResponse().message();
            
            if (errorCode != null && errorCode.equals("ServiceUnavailable")) {
                return String.format(
                    "MinIO storage service is temporarily unavailable. Cannot %s. " +
                    "Please try again later. Service error: %s",
                    operation, errorMessage != null ? errorMessage : "Service unavailable");
            }
            
            return String.format(
                "MinIO storage service error occurred. Cannot %s. " +
                "Error code: %s. Message: %s",
                operation, errorCode, errorMessage != null ? errorMessage : "Unknown error");
        }

        if (e instanceof InsufficientDataException) {
            return String.format(
                "File upload to MinIO was interrupted. Cannot %s. " +
                "The data stream ended prematurely. Please try again. " +
                "Original error: %s",
                operation, exceptionMessage != null ? exceptionMessage : "Insufficient data");
        }

        if (e instanceof InternalException) {
            return String.format(
                "Internal error in MinIO client library. Cannot %s. " +
                "This may indicate a configuration issue. Please check MinIO client settings. " +
                "Original error: %s",
                operation, exceptionMessage != null ? exceptionMessage : "Internal error");
        }

        if (e instanceof IOException) {
            if (lowerMessage.contains("minio") && (lowerMessage.contains("try again") || 
                lowerMessage.contains("connection") || lowerMessage.contains("unreachable"))) {
                return String.format(
                    "MinIO storage service is unavailable or unreachable. Cannot %s. " +
                    "Please verify that MinIO service is running and check network connectivity. " +
                    "Original error: %s",
                    operation, exceptionMessage != null ? exceptionMessage : "Connection error");
            }
        }

        Throwable rootCause = getRootCause(e);
        if (rootCause != null && rootCause != e) {
            String rootCauseMessage = rootCause.getMessage();
            String lowerRootCause = rootCauseMessage != null ? rootCauseMessage.toLowerCase() : "";
            
            if (lowerRootCause.contains("connection refused") ||
                lowerRootCause.contains("connection timed out") ||
                rootCause instanceof ConnectException ||
                rootCause instanceof UnknownHostException) {
                return String.format(
                    "MinIO storage service is currently unavailable. Cannot %s. " +
                    "Unable to establish connection. Please check if MinIO service is running.",
                    operation);
            }
        }

        return String.format(
            "Failed to %s in MinIO storage service. " +
            "Please check MinIO service availability and configuration. " +
            "Error: %s",
            operation, exceptionMessage != null ? exceptionMessage : "Unknown error");
    }

    private Throwable getRootCause(Throwable throwable) {
        if (throwable == null) {
            return null;
        }
        Throwable cause = throwable.getCause();
        if (cause == null || cause == throwable) {
            return throwable;
        }
        return getRootCause(cause);
    }
}