package com.ticketis.app.service.fileImport;

import jakarta.jms.JMSException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jms.core.JmsTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class OutboxEventProcessor {

    private final JmsTemplate jmsTemplate;
    private static final String QUEUE_NAME = "minio.operations.queue";

    public boolean processEvent(Long id, Long importHistoryId, String operation, 
                                String fileName, String filePath, String source) {
        try {
            log.info("Processing outbox event: id={}, operation={}, file={}, source={}", 
                id, operation, fileName, source);
            
            Map<String, Object> message = new HashMap<>();
            message.put("id", id);
            message.put("importHistoryId", importHistoryId);
            message.put("operation", operation);
            message.put("fileName", fileName);
            message.put("filePath", filePath);
            message.put("timestamp", Instant.now().toString());
            message.put("source", source);
            
            String correlationId = source + "-" + id;
            
            jmsTemplate.convertAndSend(QUEUE_NAME, message, 
                jmsMessage -> {
                    try {
                        jmsMessage.setStringProperty("eventId", id.toString());
                        jmsMessage.setStringProperty("operation", operation);
                        jmsMessage.setJMSCorrelationID(correlationId);
                        return jmsMessage;
                    } catch (JMSException e) {
                        throw new RuntimeException("JMS error", e);
                    }
                });
            
            log.info("Sent to JMS: eventId={}, source={}", id, source);
            return true;
            
        } catch (Exception e) {
            log.error("Failed to process event id={}, source={}", id, source, e);
            return false;
        }
    }
}




