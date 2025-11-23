package com.ticketis.app.controller;

import com.ticketis.app.dto.response.ImportResponse;
import com.ticketis.app.service.ImportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/import")
public class ImportController {

    private final ImportService importService;

    @PostMapping
    public ResponseEntity<?> importFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "entityType", required = false) String entityType) {
        
        ImportResponse response = importService.uploadFile(file, entityType);
        return new ResponseEntity<>(response, HttpStatus.ACCEPTED);
    }
}

