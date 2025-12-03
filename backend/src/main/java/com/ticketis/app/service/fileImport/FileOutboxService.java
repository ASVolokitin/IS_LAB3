package com.ticketis.app.service.fileImport;

import com.ticketis.app.model.FileOutbox;
import com.ticketis.app.repository.FileOutboxRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class FileOutboxService {

    private final FileOutboxRepository outboxRepository;

    public void createUploadEvent(Long importHistoryId, String fileName, String filePath) {
        FileOutbox event = FileOutbox.builder()
                .importHistoryId(importHistoryId)
                .operation("UPLOAD")
                .fileName(fileName)
                .filePath(filePath)
                .createdAt(Instant.now())
                .build();

        outboxRepository.save(event);
        log.info("Created UPLOAD outbox event for import {}", importHistoryId);
    }

    public void createDeleteEvent(Long importHistoryId, String fileName) {
        FileOutbox event = FileOutbox.builder()
                .importHistoryId(importHistoryId)
                .operation("DELETE")
                .fileName(fileName)
                .filePath("")
                .createdAt(Instant.now())
                .build();

        outboxRepository.save(event);
        log.info("Created DELETE outbox event for import {}", importHistoryId);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void markAsProcessed(Long outboxId) {
        outboxRepository.markAsProcessed(outboxId, Instant.now());
        log.debug("Marked outbox event {} as processed", outboxId);
    }
}