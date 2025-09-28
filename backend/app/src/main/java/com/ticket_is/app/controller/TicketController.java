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

import com.ticket_is.app.dto.request.TicketRequest;
import com.ticket_is.app.model.Ticket;
import com.ticket_is.app.service.TicketService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RestController
@RequestMapping("/tickets")
public class TicketController {

    private final TicketService ticketService;

    @GetMapping
    public List<Ticket> getAllCoordinates() {
        return ticketService.getAllTickets();
    }

    @GetMapping("/{id}")
    public Ticket getCoordinatesById(@PathVariable Long id) {
        return ticketService.getTicketById(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCoordinatesById(@PathVariable Long id) {
        ticketService.deleteTicketById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    public ResponseEntity<?> createCoordinates(@Valid @RequestBody TicketRequest request) {
        ticketService.createTicket(request);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCoordinates(@PathVariable Long id, @Valid @RequestBody TicketRequest request) {
        ticketService.updateTicket(id, request);
        return ResponseEntity.noContent().build();
    }
     
}
