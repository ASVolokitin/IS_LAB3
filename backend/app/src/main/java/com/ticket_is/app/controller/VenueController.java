package com.ticket_is.app.controller;

import java.util.List;

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

import com.ticket_is.app.dto.request.VenueRequest;
import com.ticket_is.app.model.Venue;
import com.ticket_is.app.service.VenueService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/venues")
@RequiredArgsConstructor
public class VenueController {
    
    private final VenueService venueService;

    @GetMapping
    public List<Venue> getAllCoordinates() {
        return venueService.getAllVenues();
    }

    @GetMapping("/{id}")
    public Venue getCoordinatesById(@PathVariable int id) {
        return venueService.getVenueById(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCoordinatesById(@PathVariable int id) {
        venueService.deleteVenueById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    public ResponseEntity<?> createCoordinates(@Valid @RequestBody VenueRequest request) {
        venueService.createVenue(request);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCoordinates(@PathVariable int id, @Valid @RequestBody VenueRequest request) {
        venueService.updateVenue(id, request);
        return ResponseEntity.noContent().build();
    }
}
