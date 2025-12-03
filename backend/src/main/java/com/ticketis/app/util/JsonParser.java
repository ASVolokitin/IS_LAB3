package com.ticketis.app.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

@Slf4j
public class JsonParser {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static List<JsonNode> parseJsonFile(Path filePath) throws IOException {
        log.info("Parsing JSON file: {}", filePath);

        String content = Files.readString(filePath);

        JsonNode rootNode = objectMapper.readTree(content);

        if (rootNode.isArray()) {
            List<JsonNode> nodes = new ArrayList<>();
            for (JsonNode node : rootNode) {
                nodes.add(node);
            }
            log.info("Parsed {} entities from JSON array", nodes.size());
            return nodes;
        } else {
            List<JsonNode> nodes = new ArrayList<>();
            nodes.add(rootNode);
            log.info("Parsed single entity from JSON object");
            return nodes;
        }
    }
}
