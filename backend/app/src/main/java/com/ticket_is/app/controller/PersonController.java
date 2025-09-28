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

import com.ticket_is.app.dto.request.PersonRequest;
import com.ticket_is.app.model.Person;
import com.ticket_is.app.service.PersonService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/persons")
@RequiredArgsConstructor
public class PersonController {

    private final PersonService personService;

    @GetMapping
    public List<Person> getAllCoordinates() {
        return personService.getAllPersons();
    }

    @GetMapping("/{id}")
    public Person getCoordinatesById(@PathVariable Long id) {
        return personService.getPersonById(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCoordinatesById(@PathVariable Long id) {
        personService.deletePersonById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    public ResponseEntity<?> createCoordinates(@Valid @RequestBody PersonRequest request) {
        personService.createPerson(request);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCoordinates(@PathVariable Long id, @Valid @RequestBody PersonRequest request) {
        personService.updatePerson(id, request);
        return ResponseEntity.noContent().build();
    }
        
}
