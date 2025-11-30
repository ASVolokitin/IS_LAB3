package com.ticketis.app.dto.response.minio;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FileUploadResponse {
    private String fileId;
    private String fileName;
    private Long fileSize;
    private String contentType;
    private String downloadUrl;
    private LocalDateTime uploadTime;
    private String message;
}