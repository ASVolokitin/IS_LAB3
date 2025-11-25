package com.ticketis.app.controller;

import static com.ticketis.app.util.ResponseBuilder.successfulCreationById;
import static com.ticketis.app.util.ResponseBuilder.successfulDeletionById;
import static com.ticketis.app.util.ResponseBuilder.successfulUpdateById;

import com.ticketis.app.dto.request.VenueRequest;
import com.ticketis.app.model.Venue;
import com.ticketis.app.service.VenueService;
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
@RequestMapping("/api/venues")
@RequiredArgsConstructor
public class VenueController {
    
    private final VenueService venueService;

    @GetMapping("/all")
    public List<Venue> getAllVenues() {
        return venueService.getAllVenues();
    }

    @GetMapping
    public ResponseEntity<?> getVenuesPage(Pageable pageable) {
        return new ResponseEntity<>(venueService.getVenuesPage(pageable), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public Venue getVenueById(@PathVariable int id) {
        return venueService.getVenueById(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVenueById(@PathVariable int id) {
        venueService.deleteVenueById(id);
        return new ResponseEntity<>(successfulDeletionById("venue", id), HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<?> createVenue(@Valid @RequestBody VenueRequest request) {
        Integer id = venueService.createVenue(request);
        return new ResponseEntity<>(successfulCreationById("venue", id), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateVenue(
        @PathVariable int id, @Valid @RequestBody VenueRequest request) {
        venueService.updateVenue(id, request);
        return new ResponseEntity<>(successfulUpdateById("ticket", id), HttpStatus.OK);
    }
}
