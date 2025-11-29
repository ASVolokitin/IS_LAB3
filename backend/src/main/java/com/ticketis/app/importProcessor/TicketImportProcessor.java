package com.ticketis.app.importProcessor;

import com.fasterxml.jackson.databind.JsonNode;
import com.ticketis.app.exception.FileImportValidationException;
import com.ticketis.app.exception.importBusinessException.UnableToGetNecessaryFieldException;
import com.ticketis.app.model.Coordinates;
import com.ticketis.app.model.Event;
import com.ticketis.app.model.Location;
import com.ticketis.app.model.Person;
import com.ticketis.app.model.Ticket;
import com.ticketis.app.model.Venue;
import com.ticketis.app.model.enums.Color;
import com.ticketis.app.model.enums.Country;
import com.ticketis.app.model.enums.TicketType;
import com.ticketis.app.model.enums.VenueType;
import com.ticketis.app.repository.CoordinatesRepository;
import com.ticketis.app.repository.EventRepository;
import com.ticketis.app.repository.LocationRepository;
import com.ticketis.app.repository.PersonRepository;
import com.ticketis.app.repository.VenueRepository;
import com.ticketis.app.service.ImportValidator;
import com.ticketis.app.service.TicketService;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class TicketImportProcessor implements ImportProcessor {

    private final ImportValidator validator;
    private final CoordinatesRepository coordinatesRepository;
    private final VenueRepository venueRepository;
    private final EventRepository eventRepository;
    private final PersonRepository personRepository;
    private final LocationRepository locationRepository;

    private final TicketService ticketService;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public List<String> processImport(List<JsonNode> entities) {
        List<String> errors = new ArrayList<>();
        List<Ticket> ticketsToSave = new ArrayList<>();

        for (int i = 0; i < entities.size(); i++) {
            JsonNode ticketNode = entities.get(i);
            String entityPrefix = String.format("Entity[%d]: ", i + 1);

            try {
                List<String> validationErrors = validator.validateTicket(ticketNode);
                if (!validationErrors.isEmpty()) {
                    for (String error : validationErrors) {
                        errors.add(entityPrefix + error);
                    }
                    continue;
                }

                Ticket ticket = buildTicketFromJson(ticketNode, errors, entityPrefix);
                if (ticket != null) {
                    ticketsToSave.add(ticket);
                }
            } catch (UnableToGetNecessaryFieldException e) {
                log.error("Unable to get necessary field at index {}: {}", i,  e.getMessage());
                throw e;
            }
        }

        if (!errors.isEmpty()) {
            throw new FileImportValidationException(errors);
        }

        for (Ticket ticket : ticketsToSave) {
            ticketService.saveTicket(ticket);
        }

        return errors;
    }

    public List<String> importEntity(JsonNode node, int nodeIndex) {
        List<String> errors = new ArrayList<>();
        String entityPrefix = String.format("Entity[%d]: ", nodeIndex + 1);

        try {
            List<String> validationErrors = validator.validateTicket(node);
            if (!validationErrors.isEmpty()) {
                for (String error : validationErrors) {
                    errors.add(error);
                    return errors;
                }
            }

            Ticket ticket = buildTicketFromJson(node, errors, entityPrefix);
            if (ticket != null) {
                ticketService.saveTicket(ticket);
            }
        } catch (UnableToGetNecessaryFieldException e) {
            log.error("Unable to get necessary field at index {}: {}", nodeIndex, e.getMessage());
            throw e;
        }
        return errors;
    }

    private Ticket buildTicketFromJson(JsonNode ticketNode, List<String> errors, String prefix) {
        try {
            String name = ticketNode.get("name").asText();

            Coordinates coordinates = resolveCoordinates(ticketNode, errors, prefix);
            if (coordinates == null) {
                throw new UnableToGetNecessaryFieldException("coordinates", "ticket");
            }

            Person person = resolvePerson(ticketNode, errors, prefix);
            Event event = resolveEvent(ticketNode, errors, prefix);
            
            long price = ticketNode.get("price").asLong();
            
            TicketType type = null;
            if (ticketNode.has("type") && !ticketNode.get("type").isNull()) {
                try {
                    type = TicketType.valueOf(ticketNode.get("type").asText().toUpperCase());
                } catch (IllegalArgumentException e) {
                    errors.add(prefix + "Invalid ticket type");
                    return null;
                }
            }

            Float discount = null;
            if (ticketNode.has("discount") && !ticketNode.get("discount").isNull()) {
                discount = (float) ticketNode.get("discount").asDouble();
            }

            double number = ticketNode.get("number").asDouble();
            boolean refundable = ticketNode.get("refundable").asBoolean();

            Venue venue = resolveVenue(ticketNode, errors, prefix);
            if (venue == null) {
                return null;
            }

            return new Ticket(name, coordinates, person, event, price, type, discount, number, refundable, venue);
        } catch (UnableToGetNecessaryFieldException e) {
            throw e;
        } catch (IllegalArgumentException | NullPointerException e) {
            log.error("Error building ticket: {}", e.getMessage());
            errors.add(prefix + "Error building ticket: " + e.getMessage());
            return null;
        }
    }

    private Coordinates resolveCoordinates(JsonNode ticketNode, List<String> errors, String prefix) {
        if (ticketNode.has("coordinatesId") && !ticketNode.get("coordinatesId").isNull()) {
            long coordinatesId = ticketNode.get("coordinatesId").asLong();
            return coordinatesRepository.findById(coordinatesId)
                    .orElse(null);
        }

        if (ticketNode.has("coordinates") && !ticketNode.get("coordinates").isNull()) {
            JsonNode coordsNode = ticketNode.get("coordinates");
            int x = coordsNode.get("x").asInt();
            double y = coordsNode.get("y").asDouble();
            Coordinates coordinates = new Coordinates(x, y);
            coordinates = coordinatesRepository.save(coordinates);
            log.debug("Created new coordinates: x={}, y={}", x, y);
            return coordinates;
        }

        errors.add(prefix + "Coordinates are required");
        return null;
    }

    private Venue resolveVenue(JsonNode ticketNode, List<String> errors, String prefix) {
        if (ticketNode.has("venueId") && !ticketNode.get("venueId").isNull()) {
            int venueId = ticketNode.get("venueId").asInt();
            return venueRepository.findById(venueId)
                    .orElse(null);
        }

        if (ticketNode.has("venue") && !ticketNode.get("venue").isNull()) {
            JsonNode venueNode = ticketNode.get("venue");
            String name = venueNode.get("name").asText();
            int capacity = venueNode.get("capacity").asInt();
            
            VenueType type = null;
            if (venueNode.has("type") && !venueNode.get("type").isNull()) {
                try {
                    type = VenueType.valueOf(venueNode.get("type").asText().toUpperCase());
                } catch (IllegalArgumentException e) {
                    errors.add(prefix + "Invalid venue type");
                    return null;
                }
            }

            Venue venue = new Venue(name, capacity, type);
            venue = venueRepository.save(venue);
            log.debug("Created new venue: {}", name);
            return venue;
        }

        errors.add(prefix + "Venue is required");
        return null;
    }

    private Event resolveEvent(JsonNode ticketNode, List<String> errors, String prefix) {
        if (ticketNode.has("eventId") && !ticketNode.get("eventId").isNull()) {
            int eventId = ticketNode.get("eventId").asInt();
            return eventRepository.findById(eventId)
                    .orElse(null);
        }

        if (ticketNode.has("event") && !ticketNode.get("event").isNull()) {
            JsonNode eventNode = ticketNode.get("event");
            String name = eventNode.get("name").asText();
            
            Date date = null;
            if (eventNode.has("date") && !eventNode.get("date").isNull()) {
                try {
                    String dateStr = eventNode.get("date").asText();
                    SimpleDateFormat[] formats = {
                        new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss"),
                        new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS"),
                        new SimpleDateFormat("yyyy-MM-dd HH:mm:ss"),
                        new SimpleDateFormat("yyyy-MM-dd")
                    };
                    boolean parsed = false;
                    for (SimpleDateFormat sdf : formats) {
                        try {
                            date = sdf.parse(dateStr);
                            parsed = true;
                            break;
                        } catch (ParseException ignored) {
                        }
                    }
                    if (!parsed) {
                        log.warn("Could not parse event date: {}", dateStr);
                    }
                } catch (IllegalArgumentException | NullPointerException e) {
                    log.warn("Error parsing event date: {}", e.getMessage());
                }
            }

            Integer minAge = null;
            if (eventNode.has("minAge") && !eventNode.get("minAge").isNull()) {
                minAge = eventNode.get("minAge").asInt();
            }

            String description = eventNode.get("description").asText();

            Event event = new Event(name, date, minAge, description);
            event = eventRepository.save(event);
            log.debug("Created new event: {}", name);
            return event;
        }

        return null;
    }

    private Person resolvePerson(JsonNode ticketNode, List<String> errors, String prefix) {
        if (ticketNode.has("personId") && !ticketNode.get("personId").isNull()) {
            long personId = ticketNode.get("personId").asLong();
            return personRepository.findById(personId)
                    .orElse(null);
        }

        if (ticketNode.has("person") && !ticketNode.get("person").isNull()) {
            JsonNode personNode = ticketNode.get("person");
            
            Color eyeColor = Color.valueOf(personNode.get("eyeColor").asText().toUpperCase());
            Color hairColor = Color.valueOf(personNode.get("hairColor").asText().toUpperCase());
            String passportID = personNode.get("passportID").asText();
            
            Country nationality = null;
            if (personNode.has("nationality") && !personNode.get("nationality").isNull()) {
                try {
                    nationality = Country.valueOf(personNode.get("nationality").asText().toUpperCase());
                } catch (IllegalArgumentException e) {
                    errors.add(prefix + "Invalid nationality");
                    return null;
                }
            }

            Location location = null;
            if (personNode.has("location") && !personNode.get("location").isNull()) {
                JsonNode locationNode = personNode.get("location");
                float x = (float) locationNode.get("x").asDouble();
                int y = locationNode.get("y").asInt();
                double z = locationNode.get("z").asDouble();
                String name = locationNode.has("name") && !locationNode.get("name").isNull() 
                    ? locationNode.get("name").asText() : null;
                
                location = new Location(x, y, z, name);
                location = locationRepository.save(location);
                log.debug("Created new location: {}", name);
            }

            Person person = new Person(eyeColor, hairColor, location, passportID, nationality);
            person = personRepository.save(person);
            log.debug("Created new person: {}", passportID);
            return person;
        }

        return null;
    }

    @Override
    public String getEntityType() {
        return "ticket";
    }
}

