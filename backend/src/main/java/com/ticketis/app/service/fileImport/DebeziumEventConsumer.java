package com.ticketis.app.service.fileImport;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.debezium.engine.ChangeEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class DebeziumEventConsumer {

    private final OutboxEventProcessor outboxEventProcessor;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public void handleEvent(ChangeEvent<String, String> changeEvent) {
        try {
            String key = changeEvent.key();
            String value = changeEvent.value();

            if (value == null) {
                log.debug("Received tombstone event, skipping");
                return;
            }

            log.debug("Received Debezium event: key={}, value={}", key, value);

            JsonNode changeEventJson = objectMapper.readTree(value);
            JsonNode payload = changeEventJson.get("payload");

            if (payload == null) {
                log.warn("No payload in change event, skipping");
                return;
            }

            String op = payload.get("op").asText();

            if (!"c".equals(op))
                return;

            JsonNode after = payload.get("after");
            if (after == null) {
                log.warn("No 'after' data in change event, skipping");
                return;
            }

            Long id = after.get("id").asLong();
            Long importHistoryId = after.has("import_history_id") && !after.get("import_history_id").isNull()
                    ? after.get("import_history_id").asLong()
                    : null;
            String operation = after.get("operation").asText();
            String fileName = after.get("file_name").asText();
            String filePath = after.get("file_path").asText();

            outboxEventProcessor.processEvent(
                    id,
                    importHistoryId,
                    operation,
                    fileName,
                    filePath,
                    "debezium-cdc");

        } catch (Exception e) {
            log.error("Failed to process Debezium change event", e);
        }
    }
}
