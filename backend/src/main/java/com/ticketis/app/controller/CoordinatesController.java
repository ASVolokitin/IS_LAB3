package com.ticketis.app.controller;

import static com.ticketis.app.util.ResponseBuilder.successfulCreationById;
import static com.ticketis.app.util.ResponseBuilder.successfulDeletionById;
import static com.ticketis.app.util.ResponseBuilder.successfulUpdateById;

import com.ticketis.app.dto.request.CoordinatesRequest;
import com.ticketis.app.model.Coordinates;
import com.ticketis.app.service.CoordinatesService;
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
@RequiredArgsConstructor
@RequestMapping("/api/coordinates")
public class CoordinatesController {

    private final CoordinatesService coordinatesService;

    @GetMapping("/all")
    public List<Coordinates> getAllCoordinates() {
        return coordinatesService.getALlCoordinates();
    }

    @GetMapping
    public ResponseEntity<?> getCoordinatesPage(Pageable pageable) {
        return new ResponseEntity<>(coordinatesService.getCoordinatesPage(pageable), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public Coordinates getCoordinatesById(@PathVariable Long id) {
        return coordinatesService.getCoordinatesById(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCoordinatesById(@PathVariable Long id) {
        coordinatesService.deleteCoordinatesById(id);
        return new ResponseEntity<>(successfulDeletionById("coordinates", id), HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<?> createCoordinates(@Valid @RequestBody CoordinatesRequest request) {
        Long id = coordinatesService.createCoordinates(request);
        return new ResponseEntity<>(successfulCreationById("coordinates", id), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCoordinates(
        @PathVariable Long id, @Valid @RequestBody CoordinatesRequest request) {
        coordinatesService.updateCoordinates(id, request);
        return new ResponseEntity<>(successfulUpdateById("coordinates", id), HttpStatus.OK);
    }
    
}
