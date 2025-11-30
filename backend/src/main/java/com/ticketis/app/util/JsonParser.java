package com.ticketis.app.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Slf4j
public class JsonParser {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static List<JsonNode> parseJsonFile(InputStream inputStream) throws IOException {
        log.info("Parsing JSON file from InputStream");

        JsonNode rootNode = objectMapper.readTree(inputStream);

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
