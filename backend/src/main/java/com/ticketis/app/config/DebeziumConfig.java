package com.ticketis.app.config;

import io.debezium.engine.ChangeEvent;
import io.debezium.engine.DebeziumEngine;
import io.debezium.engine.format.Json;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import com.ticketis.app.service.fileImport.DebeziumEventConsumer;

import java.io.IOException;
import java.util.Properties;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

@Configuration
@Slf4j
@RequiredArgsConstructor
public class DebeziumConfig {

    private final DebeziumEventConsumer debeziumEventConsumer;
    private DebeziumEngine<ChangeEvent<String, String>> engine;
    private Executor executor;

    @Value("${POSTGRES_HOST}")
    private String databaseHost;

    @Value("${POSTGRES_PORT}")
    private String databasePort;

    @Value("${POSTGRES_DB}")
    private String databaseName;

    @Value("${spring.datasource.username}")
    private String datasourceUsername;

    @Value("${spring.datasource.password}")
    private String datasourcePassword;

    @PostConstruct
    public void startDebezium() {
        log.info("Starting Debezium engine for file_outbox table monitoring");
        
        Properties props = new Properties();
        
        props.setProperty("name", "file-outbox-connector");
        props.setProperty("connector.class", "io.debezium.connector.postgresql.PostgresConnector");
        props.setProperty("offset.storage", "com.ticketis.app.config.MemoryOffsetBackingStore");
        props.setProperty("offset.flush.interval.ms", "10000");
        
        props.setProperty("database.hostname", databaseHost);
        props.setProperty("database.port", databasePort);
        props.setProperty("database.user", datasourceUsername);
        props.setProperty("database.password", datasourcePassword);
        props.setProperty("database.dbname", databaseName);
        props.setProperty("database.server.name", "ticketis-outbox");
        
        props.setProperty("table.include.list", "public.file_outbox");
        props.setProperty("publication.name", "dbz_publication");
        props.setProperty("publication.autocreate.mode", "filtered");
        
        props.setProperty("snapshot.mode", "never");
        props.setProperty("slot.name", "debezium_outbox_slot");
        props.setProperty("plugin.name", "pgoutput");
        
        props.setProperty("topic.prefix", "ticketis");
        props.setProperty("topic.naming.strategy", "io.debezium.schema.SchemaTopicNamingStrategy");
        
        props.setProperty("schema.include.list", "public");
        props.setProperty("column.include.list", "public.file_outbox.id,public.file_outbox.import_history_id,public.file_outbox.operation,public.file_outbox.file_name,public.file_outbox.file_path,public.file_outbox.created_at,public.file_outbox.processed_at");
        
        props.setProperty("errors.tolerance", "all");
        props.setProperty("errors.log.enable", "true");
        props.setProperty("errors.log.include.messages", "true");
        
        engine = DebeziumEngine.create(Json.class)
                .using(props)
                .notifying(debeziumEventConsumer::handleEvent)
                .build();
        
        executor = Executors.newSingleThreadExecutor(r -> {
            Thread t = new Thread(r, "debezium-outbox-engine");
            t.setDaemon(true);
            return t;
        });
        executor.execute(engine);
        
        log.info("Debezium engine started successfully");
    }

    @PreDestroy
    public void stopDebezium() {
        log.info("Stopping Debezium engine");
        if (engine != null) {
            try {
                engine.close();
            } catch (IOException e) {
                log.error("Error closing Debezium engine", e);
            }
        }
        if (executor != null) {
        }
        log.info("Debezium engine stopped");
    }
}
