package com.ticketis.app.config;

import com.ticketis.app.service.fileImport.ImportHistoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ImportHistoryStartupInitializer {

    private final ImportHistoryService importHistoryService;

    @EventListener(ApplicationReadyEvent.class)
    @Order(2)
    public void markIncompleteImportsAsFailed() {
        log.info("Starting import history cleanup on server launch...");
        try {
            importHistoryService.markIncompleteImportsAsFailed();
            log.info("Import history cleanup completed successfully");
        } catch (Exception e) {
            log.error("Failed to mark incomplete imports as failed on startup", e);
        }
    }
}





