package com.ticketis.app.config;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import javax.sql.DataSource;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DatabaseInitializer {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseInitializer.class);
    private static final String INIT_SCRIPT_PATH = "db/init/01-create-schema.sql";
    private static final String[] REQUIRED_TABLES = { "locations", "venues", "events", "persons", "coordinates",
            "tickets", "import_history", "import_batches", "file_outbox"};

    private final DataSource dataSource;

    @EventListener(ApplicationReadyEvent.class)
    @Order(1)
    public void initializeDatabase() {
        try (Connection connection = dataSource.getConnection()) {
            if (needsInitialization(connection)) {
                logger.info("Database appears to be empty. Running initialization script...");
                runInitScript(connection);
                logger.info("Database initialization completed successfully.");
            } else {
                logger.info("Database already initialized. Skipping initialization script.");
            }
        } catch (SQLException | IOException e) {
            logger.error("Failed to initialize database", e);
            throw new RuntimeException("Database initialization failed", e);
        }
    }

    private boolean needsInitialization(Connection connection) throws SQLException {
        DatabaseMetaData metaData = connection.getMetaData();
        String[] types = { "TABLE" };

        for (String tableName : REQUIRED_TABLES) {
            try (ResultSet tables = metaData.getTables(null, null, tableName, types)) {
                if (!tables.next())
                    return true;
            }
        }
        return false;
    }

    private void runInitScript(Connection connection) throws SQLException, IOException {
        ClassPathResource resource = new ClassPathResource(INIT_SCRIPT_PATH);

        if (!resource.exists()) {
            logger.warn("Initialization script not found at: {}. Skipping initialization.", INIT_SCRIPT_PATH);
            return;
        }

        try (InputStream inputStream = resource.getInputStream();
                Statement statement = connection.createStatement()) {

            String script = new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);

            String[] statements = script.split(";");

            for (String sql : statements) {
                sql = sql.trim();
                if (!sql.isEmpty() && !sql.startsWith("--")) {
                    try {
                        statement.execute(sql);
                        logger.debug("Executed SQL statement: {}", sql);
                    } catch (SQLException e) {
                        logger.warn("SQL statement execution warning (may be expected): {}", e.getMessage());
                    }
                }
            }
            
            connection.commit();
        }
    }
}
