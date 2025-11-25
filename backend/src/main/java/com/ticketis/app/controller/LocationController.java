package com.ticketis.app.controller;

import static com.ticketis.app.util.ResponseBuilder.successfulCreationById;
import static com.ticketis.app.util.ResponseBuilder.successfulDeletionById;
import static com.ticketis.app.util.ResponseBuilder.successfulUpdateById;

import com.ticketis.app.dto.request.LocationRequest;
import com.ticketis.app.model.Location;
import com.ticketis.app.service.LocationService;
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
@RequestMapping("/api/locations")
@RequiredArgsConstructor
public class LocationController {

    private final LocationService locationService;

    @GetMapping("/all")
    public List<Location> getAllLocations() {
        return locationService.getAllLocations();
    }

    @GetMapping
    public ResponseEntity<?> getLocationsage(Pageable pageable) {
        return new ResponseEntity<>(locationService.getLocationsPage(pageable), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public Location getLocationById(@PathVariable Long id) {
        return locationService.getLocationById(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteLocationById(@PathVariable Long id) {
        locationService.deleteLocationById(id);
        return new ResponseEntity<>(successfulDeletionById("location", id), HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<?> createLocation(@Valid @RequestBody LocationRequest request) {
        Long id = locationService.createLocation(request);
        return new ResponseEntity<>(successfulCreationById("location", id), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateLocation(
        @PathVariable Long id, @Valid @RequestBody LocationRequest request) {
        locationService.updateLocation(id, request);
        return new ResponseEntity<>(successfulUpdateById("location", id), HttpStatus.OK);
    }
}
