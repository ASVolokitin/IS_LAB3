package com.ticketis.app.controller;

import com.ticketis.app.model.ImportHistoryItem;
import com.ticketis.app.service.MinioService;
import com.ticketis.app.service.fileImport.ImportHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.InputStream;

@RestController
@RequestMapping("/api/imports")
@RequiredArgsConstructor
public class MinioController {

    private final MinioService minioService;
    private final ImportHistoryService importHistoryService;


    @GetMapping("/{importId}/download")
    public ResponseEntity<InputStreamResource> downloadFile(@PathVariable Long importId) {
        ImportHistoryItem importItem = importHistoryService.getImportItemById(importId);
        String filename = importItem.getFilename();
        
        InputStream inputStream = minioService.downloadFile(filename);
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(new InputStreamResource(inputStream));
    }
}
