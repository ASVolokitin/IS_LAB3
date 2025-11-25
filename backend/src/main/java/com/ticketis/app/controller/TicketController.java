package com.ticketis.app.controller;

import static com.ticketis.app.util.ResponseBuilder.successfulCreationById;
import static com.ticketis.app.util.ResponseBuilder.successfulDeletionById;
import static com.ticketis.app.util.ResponseBuilder.successfulSellById;
import static com.ticketis.app.util.ResponseBuilder.successfulUpdateById;

import com.ticketis.app.dto.request.SellTicketRequest;
import com.ticketis.app.dto.request.TicketRequest;
import com.ticketis.app.dto.sql.CoordinatesTicketCount;
import com.ticketis.app.service.TicketService;
import jakarta.validation.Valid;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;

    @GetMapping("/all")
    public ResponseEntity<?> getAllTickets() {
        return new ResponseEntity<>(ticketService.getAllTickets(), HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<?> getTicketsPage(
            @RequestParam(required = false) String ticketName,
            @RequestParam(required = false) String personPassportID,
            @RequestParam(required = false) String eventDescription,
            @RequestParam(required = false) String venueName,
            @RequestParam(required = false) String personLocationName,
            Pageable pageable) {

        Map<String, String> filters = new LinkedHashMap<>();

        if (ticketName != null && !ticketName.isBlank()) {
            filters.put("name", ticketName);
        }
        if (personPassportID != null && !personPassportID.isBlank()) {
            filters.put("person.passportID", personPassportID);
        }
        if (eventDescription != null && !eventDescription.isBlank()) {
            filters.put("event.description", eventDescription);
        }
        if (venueName != null && !venueName.isBlank()) {
            filters.put("venue.name", venueName);
            
        }
        if (personLocationName != null && !personLocationName.isBlank()) {
            filters.put("person.location.name", personLocationName);
        }
        return new ResponseEntity<>(ticketService.getTicketsPage(filters, pageable), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTicketsById(@PathVariable Long id) {
        return new ResponseEntity<>(ticketService.getTicketById(id), HttpStatus.OK);
    }

    // MUTITHREAD DELETE

    // shoud delete one, than return concurrency error
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTicketsById(@PathVariable Long id) {
        ticketService.deleteTicketById(id);
        return new ResponseEntity<>(successfulDeletionById("ticket", id), HttpStatus.OK);
    }

    // should delete multiple times (same with COMMITTED)
    @DeleteMapping("/{id}/uncommitted")
    public ResponseEntity<?> deleteTicketsByIdUncommitted(@PathVariable Long id) {
        ticketService.deleteTicketsByIdUncommitted(id);
        return new ResponseEntity<>(successfulDeletionById("ticket", id), HttpStatus.OK);
    }

    // should delete once, then return not found exception
    @DeleteMapping("/{id}/native")
    public ResponseEntity<?> deleteTicketsByIdNative(@PathVariable Long id) {
        ticketService.deleteTicketsByIdNative(id);
        return new ResponseEntity<>(successfulDeletionById("ticket", id), HttpStatus.OK);
    }


    @PostMapping
    public ResponseEntity<?> createTicket(@Valid @RequestBody TicketRequest request) {
        Long id = ticketService.createTicket(request);
        return new ResponseEntity<>(successfulCreationById("ticket", id), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTickets(
            @PathVariable Long id, @Valid @RequestBody TicketRequest request) {
        ticketService.updateTicket(id, request);
        return new ResponseEntity<>(successfulUpdateById("ticket", id), HttpStatus.OK);
    }

    // MULTITHREAD UPDATE

    // should increase once-twice, then return concurrency error (same with COMMITTED)
    @PostMapping("/{id}/increase_price")
    public ResponseEntity<?> increasePrice(@PathVariable Long id, @RequestParam Long price) {
        ticketService.increasePrice(id, price);
        return new ResponseEntity<>(successfulUpdateById("ticket", id), HttpStatus.OK);
    }

    // should not return any errors, in fact only a part of the operations will be completed successfully
    @PostMapping("/{id}/increase_price/uncommitted")
    public ResponseEntity<?> increasePriceUncommitted(@PathVariable Long id, @RequestParam Long price) {
        ticketService.increasePriceUncommitted(id, price);
        return new ResponseEntity<>(successfulUpdateById("ticket", id), HttpStatus.OK);
    }
    
    // should consistently apply balance change operations
    @PostMapping("/{id}/increase_price/native")
    public ResponseEntity<?> increasePriceNative(@PathVariable Long id, @RequestParam Long price) {
        ticketService.increasePriceNative(id, price);
        return new ResponseEntity<>(successfulUpdateById("ticket", id), HttpStatus.OK);
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
        return new ResponseEntity<>(
                successfulSellById("ticket", request.ticketId(), request.buyerId()), HttpStatus.OK);
    }

    @PostMapping("/unbook")
    public ResponseEntity<?> unbookTickets(@RequestParam Long personId) {
        int modifiedRowsAmount = ticketService.unbookByPersonId(personId);
        return new ResponseEntity<>(modifiedRowsAmount, HttpStatus.OK);
    }
}
