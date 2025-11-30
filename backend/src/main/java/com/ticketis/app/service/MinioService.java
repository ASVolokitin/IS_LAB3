package com.ticketis.app.service;

import com.ticketis.app.exception.FailedToProcessImportException;
import com.ticketis.app.exception.minio.MinioDeleteFileException;
import com.ticketis.app.exception.minio.MinioDownloadFileException;
import io.minio.BucketExistsArgs;
import io.minio.GetObjectArgs;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.http.Method;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.InputStream;
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
            log.error("Error uploading file to MinIO: {}", e.getMessage());
            throw new FailedToProcessImportException("File upload failed: " + e.getMessage());
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
            log.error("Error generating presigned URL: {}", e.getMessage());
            throw new RuntimeException("URL generation failed", e);
        }
    }

    public InputStream downloadFile(String objectName) {
        try {
            return minioClient.getObject(GetObjectArgs.builder()
                    .bucket(bucketName)
                    .object(objectName)
                    .build());
        } catch (Exception e) {
            log.error("Error downloading file from MinIO: {}", objectName, e);
            throw new MinioDownloadFileException(objectName, bucketName);
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
            log.error("Error deleting file from MinIO: {}", e.getMessage());
            throw new MinioDeleteFileException(objectName, bucketName);
        }
    }
}