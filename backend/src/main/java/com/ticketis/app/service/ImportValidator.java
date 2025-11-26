package com.ticketis.app.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.ticketis.app.model.enums.Color;
import com.ticketis.app.model.enums.Country;
import com.ticketis.app.model.enums.TicketType;
import com.ticketis.app.model.enums.VenueType;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class ImportValidator {

    private final Validator validator;


    public void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }

        if (file.getSize() == 0) {
            throw new IllegalArgumentException("File size cannot be zero");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.toLowerCase().endsWith(".json")) {
            throw new IllegalArgumentException("Only JSON files are supported for import");
        }
    }


    
    public <T> List<String> validateEntity(T entity) {
        List<String> errors = new ArrayList<>();
        
        Set<ConstraintViolation<T>> violations = validator.validate(entity);
        for (ConstraintViolation<T> violation : violations) {
            String error = String.format("%s: %s", 
                violation.getPropertyPath().toString(), 
                violation.getMessage());
            errors.add(error);
            log.debug("Validation error: {}", error);
        }
        
        return errors;
    }

    private void validateRequiredField(JsonNode node, String fieldName, String entityType, List<String> errors) {
        if (node == null || node.isNull()) {
            errors.add(String.format("%s.%s is required", entityType, fieldName));
        }
    }

    private String getRequiredText(JsonNode node, String fieldName, String entityType, List<String> errors) {
        validateRequiredField(node, fieldName, entityType, errors);
        if (node != null && !node.isNull() && node.isTextual()) {
            String value = node.asText();
            if (value.isBlank()) {
                errors.add(String.format("%s.%s cannot be blank", entityType, fieldName));
            }
            return value;
        }
        return null;
    }

    private Integer getRequiredInt(JsonNode node, String fieldName, String entityType, List<String> errors) {
        validateRequiredField(node, fieldName, entityType, errors);
        if (node != null && !node.isNull() && node.isInt()) {
            return node.asInt();
        } else if (node != null && !node.isNull() && !node.isInt()) {
            errors.add(String.format("%s.%s must be an integer", entityType, fieldName));
        }
        return null;
    }

    private Long getRequiredLong(JsonNode node, String fieldName, String entityType, List<String> errors) {
        validateRequiredField(node, fieldName, entityType, errors);
        if (node != null && !node.isNull() && node.isNumber()) {
            return node.asLong();
        } else if (node != null && !node.isNull() && !node.isNumber()) {
            errors.add(String.format("%s.%s must be a number", entityType, fieldName));
        }
        return null;
    }

    private Double getRequiredDouble(JsonNode node, String fieldName, String entityType, List<String> errors) {
        validateRequiredField(node, fieldName, entityType, errors);
        if (node != null && !node.isNull() && node.isNumber()) {
            return node.asDouble();
        } else if (node != null && !node.isNull() && !node.isNumber()) {
            errors.add(String.format("%s.%s must be a number", entityType, fieldName));
        }
        return null;
    }

    public List<String> validateCoordinates(JsonNode coordinatesNode) {
        List<String> errors = new ArrayList<>();
        
        if (coordinatesNode == null || !coordinatesNode.isObject()) {
            errors.add("Coordinates must be an object");
            return errors;
        }
        
        Integer x = getRequiredInt(coordinatesNode.get("x"), "x", "coordinates", errors);
        if (x != null && x < -200) {
            errors.add("Coordinates.x must be >= -200, got: " + x);
        }
        
        Double y = getRequiredDouble(coordinatesNode.get("y"), "y", "coordinates", errors);
        if (y != null && y < -4) {
            errors.add("Coordinates.y must be >= -4, got: " + y);
        }
        
        return errors;
    }

    public List<String> validateLocation(JsonNode locationNode) {
        List<String> errors = new ArrayList<>();
        
        if (locationNode == null || locationNode.isNull()) {
            return errors;
        }
        
        if (!locationNode.isObject()) {
            errors.add("Location must be an object");
            return errors;
        }
        
        getRequiredDouble(locationNode.get("x"), "x", "location", errors);
        getRequiredInt(locationNode.get("y"), "y", "location", errors);
        getRequiredDouble(locationNode.get("z"), "z", "location", errors);
        
        return errors;
    }

    public List<String> validatePerson(JsonNode personNode) {
        List<String> errors = new ArrayList<>();
        
        if (personNode == null || personNode.isNull()) {
            return errors;
        }
        
        if (!personNode.isObject()) {
            errors.add("Person must be an object");
            return errors;
        }
        
        String eyeColorStr = getRequiredText(personNode.get("eyeColor"), "eyeColor", "person", errors);
        String hairColorStr = getRequiredText(personNode.get("hairColor"), "hairColor", "person", errors);
        String passportID = getRequiredText(personNode.get("passportID"), "passportID", "person", errors);
        
        if (eyeColorStr != null) {
            try {
                Color.valueOf(eyeColorStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                errors.add("Person.eyeColor must be one of: " + String.join(", ", Color.getNames()));
            }
        }
        
        if (hairColorStr != null) {
            try {
                Color.valueOf(hairColorStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                errors.add("Person.hairColor must be one of: " + String.join(", ", Color.getNames()));
            }
        }
        
        if (passportID != null && passportID.length() > 29) {
            errors.add("Person.passportID must be <= 29 characters, got: " + passportID.length());
        }
        
        JsonNode nationalityNode = personNode.get("nationality");
        if (nationalityNode != null && !nationalityNode.isNull() && nationalityNode.isTextual()) {
            try {
                Country.valueOf(nationalityNode.asText().toUpperCase());
            } catch (IllegalArgumentException e) {
                errors.add("Person.nationality must be one of: " + String.join(", ", Country.getNames()));
            }
        }
        
        JsonNode locationNode = personNode.get("location");
        if (locationNode != null && !locationNode.isNull()) {
            errors.addAll(validateLocation(locationNode));
        }
        
        return errors;
    }

    public List<String> validateEvent(JsonNode eventNode) {
        List<String> errors = new ArrayList<>();
        
        if (eventNode == null || eventNode.isNull()) {
            return errors;
        }
        
        if (!eventNode.isObject()) {
            errors.add("Event must be an object");
            return errors;
        }
        
        getRequiredText(eventNode.get("name"), "name", "event", errors);
        getRequiredText(eventNode.get("description"), "description", "event", errors);
        
        return errors;
    }

    public List<String> validateVenue(JsonNode venueNode) {
        List<String> errors = new ArrayList<>();
        
        if (venueNode == null || !venueNode.isObject()) {
            errors.add("Venue must be an object");
            return errors;
        }
        
        getRequiredText(venueNode.get("name"), "name", "venue", errors);
        
        Integer capacity = getRequiredInt(venueNode.get("capacity"), "capacity", "venue", errors);
        if (capacity != null && capacity <= 0) {
            errors.add("Venue.capacity must be > 0, got: " + capacity);
        }
        
        JsonNode typeNode = venueNode.get("type");
        if (typeNode != null && !typeNode.isNull() && typeNode.isTextual()) {
            try {
                VenueType.valueOf(typeNode.asText().toUpperCase());
            } catch (IllegalArgumentException e) {
                errors.add("Venue.type must be one of: " + String.join(", ", VenueType.getNames()));
            }
        }
        
        return errors;
    }

    public List<String> validateTicket(JsonNode ticketNode) {
        List<String> errors = new ArrayList<>();
        
        if (ticketNode == null || !ticketNode.isObject()) {
            errors.add("Ticket must be an object");
            return errors;
        }
        
        getRequiredText(ticketNode.get("name"), "name", "ticket", errors);
        
        JsonNode coordinatesNode = ticketNode.get("coordinates");
        JsonNode coordinatesIdNode = ticketNode.get("coordinatesId");
        
        if (coordinatesNode == null && coordinatesIdNode == null) {
            errors.add("Ticket must have either coordinates object or coordinatesId");
        } else if (coordinatesNode != null && !coordinatesNode.isNull()) {
            errors.addAll(validateCoordinates(coordinatesNode));
        }
        
        Long price = getRequiredLong(ticketNode.get("price"), "price", "ticket", errors);
        if (price != null && price <= 0) {
            errors.add("Ticket.price must be > 0, got: " + price);
        }
        
        Double number = getRequiredDouble(ticketNode.get("number"), "number", "ticket", errors);
        if (number != null && number <= 0) {
            errors.add("Ticket.number must be > 0, got: " + number);
        }
        
        JsonNode refundableNode = ticketNode.get("refundable");
        if (refundableNode == null || !refundableNode.isBoolean()) {
            errors.add("Ticket.refundable must be a boolean");
        }
        
        JsonNode venueNode = ticketNode.get("venue");
        JsonNode venueIdNode = ticketNode.get("venueId");
        
        if (venueNode == null && venueIdNode == null) {
            errors.add("Ticket must have either venue object or venueId");
        } else if (venueNode != null && !venueNode.isNull()) {
            errors.addAll(validateVenue(venueNode));
        }
        
        JsonNode discountNode = ticketNode.get("discount");
        if (discountNode != null && !discountNode.isNull() && discountNode.isNumber()) {
            double discount = discountNode.asDouble();
            if (discount <= 0 || discount > 100) {
                errors.add("Ticket.discount must be between 0 and 100, got: " + discount);
            }
        }
        
        JsonNode typeNode = ticketNode.get("type");
        if (typeNode != null && !typeNode.isNull() && typeNode.isTextual()) {
            try {
                TicketType.valueOf(typeNode.asText().toUpperCase());
            } catch (IllegalArgumentException e) {
                errors.add("Ticket.type must be one of: " + String.join(", ", TicketType.getNames()));
            }
        }
        
        JsonNode personNode = ticketNode.get("person");
        if (personNode != null && !personNode.isNull()) {
            errors.addAll(validatePerson(personNode));
        }
        
        JsonNode eventNode = ticketNode.get("event");
        if (eventNode != null && !eventNode.isNull()) {
            errors.addAll(validateEvent(eventNode));
        }
        
        return errors;
    }
}