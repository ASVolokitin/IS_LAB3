package com.ticketis.app.controller;

import static com.ticketis.app.util.ResponseBuilder.successfulCreationById;
import static com.ticketis.app.util.ResponseBuilder.successfulDeletionById;
import static com.ticketis.app.util.ResponseBuilder.successfulUpdateById;

import com.ticketis.app.dto.request.EventRequest;
import com.ticketis.app.model.Event;
import com.ticketis.app.service.EventService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;



@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @GetMapping("/all")
    public List<Event> getAllEvents() {
        return eventService.getAllEvents();
    }

    @GetMapping
    public ResponseEntity<?> getEventsPage(Pageable pageable) {
        return new ResponseEntity<>(eventService.getEventsPage(pageable), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public Event getEventsById(@PathVariable Integer id) {
        return eventService.getEventById(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEventById(@PathVariable Integer id) {
        eventService.deleteEventById(id);
        return new ResponseEntity<>(successfulDeletionById("event", id), HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<?> createEvent(@Valid @RequestBody EventRequest request) {
        Integer id = eventService.createEvent(request);
        return new ResponseEntity<>(successfulCreationById("event", id), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateEvent(
        @PathVariable Integer id, @Valid @RequestBody EventRequest request) {
        eventService.updateEvent(id, request);
        return new ResponseEntity<>(successfulUpdateById("event", id), HttpStatus.OK);
    }
        
}
