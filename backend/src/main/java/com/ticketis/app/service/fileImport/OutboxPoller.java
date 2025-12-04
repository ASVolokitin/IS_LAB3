package com.ticketis.app.service.fileImport;

import com.ticketis.app.model.FileOutbox;
import com.ticketis.app.repository.FileOutboxRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Slf4j
@RequiredArgsConstructor
@EnableScheduling
public class OutboxPoller {
    
    private final OutboxEventProcessor outboxEventProcessor;
    private final FileOutboxRepository fileOutboxRepository;
    
    @Scheduled(fixedDelay = 10000)
    @Transactional
    public void pollAndProcess() {
        try {
            List<FileOutbox> events = fileOutboxRepository.findUnprocessedEvents();
            
            if (events.isEmpty()) {
                log.debug("No pending outbox events");
                return;
            }
            
            log.info("Found {} outbox events to process", events.size());
            
            for (FileOutbox event : events) {
                processSingleEvent(event);
            }
            
        } catch (Exception e) {
            log.error("Outbox poller failed", e);
        }
    }
    
    private void processSingleEvent(FileOutbox event) {
        Long id = event.getId();
        String fileName = event.getFileName();
        String operation = event.getOperation();
        Long importHistoryId = event.getImportHistoryId();
        String filePath = event.getFilePath();
        
        boolean success = outboxEventProcessor.processEvent(
            id, 
            importHistoryId, 
            operation, 
            fileName, 
            filePath, 
            "outbox-poller"
        );
        
        if (!success) log.warn("Failed to process event {}", id);
    }
}