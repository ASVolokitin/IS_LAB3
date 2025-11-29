package com.ticketis.app.controller;

import com.ticketis.app.dto.response.ImportResponse;
import com.ticketis.app.service.fileImport.FileImportService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/import")
public class ImportController {

    private final FileImportService fileImportService;

    @GetMapping
    public ResponseEntity<?> getAllImports(Pageable pageable) {
        return new ResponseEntity<>(fileImportService.getImportsPage(pageable), HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<?> importFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "entityType", required = false) String entityType) {
        
        ImportResponse response = fileImportService.importFile(file, entityType);
        return new ResponseEntity<>(response, HttpStatus.ACCEPTED);
    }
}



