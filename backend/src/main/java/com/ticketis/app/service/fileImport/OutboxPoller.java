package com.ticketis.app.service.fileImport;

import com.ticketis.app.model.FileOutbox;
import com.ticketis.app.repository.FileOutboxRepository;
import jakarta.jms.JMSException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jms.core.JmsTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@Slf4j
@RequiredArgsConstructor
@EnableScheduling
public class OutboxPoller {
    
    private final JmsTemplate jmsTemplate;
    private final JdbcTemplate jdbcTemplate;
    
    @Scheduled(fixedDelay = 5000)
    @Transactional
    public void pollAndProcess() {
        try {
            List<Map<String, Object>> events = jdbcTemplate.queryForList(
                "SELECT id, import_history_id, operation, file_name, file_path " +
                "FROM file_outbox " +
                "WHERE processed_at IS NULL " +
                "ORDER BY created_at ASC " +
                "LIMIT 10"
            );
            
            if (events.isEmpty()) {
                log.debug("No pending outbox events");
                return;
            }
            
            log.info("Found {} outbox events to process", events.size());
            
            for (Map<String, Object> event : events) {
                processSingleEvent(event);
            }
            
        } catch (Exception e) {
            log.error("Outbox poller failed", e);
        }
    }
    
    private void processSingleEvent(Map<String, Object> event) {
        Long id = (Long) event.get("id");
        String fileName = (String) event.get("file_name");
        String operation = (String) event.get("operation");
        
        try {
            log.info("Processing outbox event: id={}, operation={}, file={}", 
                id, operation, fileName);
            
            Map<String, Object> message = new HashMap<>();
            message.put("id", id);
            message.put("importHistoryId", event.get("import_history_id"));
            message.put("operation", operation);
            message.put("fileName", fileName);
            message.put("filePath", event.get("file_path"));
            message.put("timestamp", Instant.now().toString());
            message.put("source", "outbox-poller");
            
            jmsTemplate.convertAndSend("minio.operations.queue", message, 
                jmsMessage -> {
                    try {
                        jmsMessage.setStringProperty("eventId", id.toString());
                        jmsMessage.setStringProperty("operation", operation);
                        jmsMessage.setJMSCorrelationID("outbox-" + id);
                        return jmsMessage;
                    } catch (JMSException e) {
                        throw new RuntimeException("JMS error", e);
                    }
                });
            
            log.info("Sent to JMS: eventId={}", id);
            

            jdbcTemplate.update(
                "UPDATE file_outbox SET processed_at = NULL WHERE id = ?",
                id
            );
            
        } catch (Exception e) {
            log.error("Failed to process event {}", id, e);
            incrementAttempts(id, e.getMessage());
        }
    }
    
    private void incrementAttempts(Long id, String error) {
        jdbcTemplate.update(
            "UPDATE file_outbox SET processed_at = NULL, " +
            "attempts = COALESCE(attempts, 0) + 1, " +
            "last_error = ? " +
            "WHERE id = ?",
            error, id
        );
    }
}