package com.ticket_is.app.controller;

import java.util.List;

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ticket_is.app.dto.request.SellTicketRequest;
import com.ticket_is.app.dto.request.TicketRequest;
import com.ticket_is.app.dto.sql.CoordinatesTicketCount;
import com.ticket_is.app.service.TicketService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RestController
@RequestMapping("/tickets")
public class TicketController {

    private final TicketService ticketService;

    @GetMapping("/all")
    public ResponseEntity<?> getAllCoordinates() {
        return new ResponseEntity<>(ticketService.getAllTickets(), HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<?> getTicketsPage(Pageable pageable) {
        return new ResponseEntity<>(ticketService.getTicketsPage(pageable), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCoordinatesById(@PathVariable Long id) {
        return new ResponseEntity<>(ticketService.getTicketById(id), HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCoordinatesById(@PathVariable Long id) {
        ticketService.deleteTicketById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PostMapping
    public ResponseEntity<?> createCoordinates(@Valid @RequestBody TicketRequest request) {
        ticketService.createTicket(request);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCoordinates(@PathVariable Long id, @Valid @RequestBody TicketRequest request) {
        ticketService.updateTicket(id, request);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
     
    @GetMapping("/count_grouped_by_coordinates")
    public ResponseEntity<?> countGroupedByCoordinates() {
        List<CoordinatesTicketCount> response = ticketService.countTicketsGroupedByCoordinates();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/count_by_number_equals/{number}")
    public ResponseEntity<?> countByNumber(@PathVariable double number) {
        Long response = ticketService.countTicketsByNumberEquals(number);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/count_by_number_less/{number}")
    public ResponseEntity<?> countByNumberLess(@PathVariable double number) {
        Long response = ticketService.countTicketsByNumberLess(number);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/sell")
    public ResponseEntity<?> sellTicket(@Valid @RequestBody SellTicketRequest request) {
        ticketService.sellTicketByPrice(request);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PostMapping("/unbook")
    public ResponseEntity<?> unbookTickets(@RequestParam Long personId) {
        int modifiedRowsAmount = ticketService.unbookByPersonId(personId);
        return new ResponseEntity<>(modifiedRowsAmount, HttpStatus.OK);
    }
}
