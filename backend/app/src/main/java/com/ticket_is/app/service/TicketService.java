package com.ticket_is.app.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.ticket_is.app.dto.request.TicketRequest;
import com.ticket_is.app.exception.notFoundException.CoordinatesNotFoundException;
import com.ticket_is.app.exception.notFoundException.EventNotFoundException;
import com.ticket_is.app.exception.notFoundException.PersonNotFoundException;
import com.ticket_is.app.exception.notFoundException.TicketNotFoundException;
import com.ticket_is.app.exception.notFoundException.VenueNotFoundException;
import com.ticket_is.app.model.Ticket;
import com.ticket_is.app.repository.CoordinatesRepository;
import com.ticket_is.app.repository.EventRepository;
import com.ticket_is.app.repository.PersonRepository;
import com.ticket_is.app.repository.TicketRepository;
import com.ticket_is.app.repository.VenueRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final CoordinatesRepository coordinatesRepository;
    private final PersonRepository personRepository;
    private final EventRepository eventRepository;
    private final VenueRepository venueRepository;

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public Ticket getTicketById(Long id) {
        return ticketRepository.findById(id)
        .orElseThrow(() -> new TicketNotFoundException(id));
    }

    public void deleteTicketById(Long id) {
        Ticket ticket = getTicketById(id);
        ticketRepository.delete(ticket);
    }

    public void createTicket(TicketRequest request) {
        Ticket ticket = new Ticket(
            request.name(),
            coordinatesRepository.findById(request.coordinatesId()).orElseThrow(() -> new CoordinatesNotFoundException(request.coordinatesId())),
            (request.personId() == null) ? null : personRepository.findById(request.personId()).orElseThrow(() -> new PersonNotFoundException(request.personId())),
            (request.eventId() == null) ? null : eventRepository.findById(request.eventId()).orElseThrow(() -> new EventNotFoundException(request.eventId())),
            request.price(),
            request.type(),
            request.discount(),
            request.number(),
            request.refundable(),
            venueRepository.findById(request.venueId()).orElseThrow(() -> new VenueNotFoundException(request.venueId()))
        );

        ticketRepository.save(ticket);
    }

    public void updateTicket(Long id, TicketRequest request) {

        Ticket ticket = getTicketById(id);

        ticket.setName(request.name());
        ticket.setCoordinates(coordinatesRepository.findById(request.coordinatesId()).orElseThrow(() -> new CoordinatesNotFoundException(request.coordinatesId())));
        ticket.setPerson((request.personId() == null) ? null : personRepository.findById(request.personId()).orElseThrow(() -> new PersonNotFoundException(request.personId())));
        ticket.setEvent((request.eventId() == null) ? null : eventRepository.findById(request.eventId()).orElseThrow(() -> new EventNotFoundException(request.eventId())));
        ticket.setPrice(request.price());
        ticket.setType(request.type());
        ticket.setDiscount(request.discount());
        ticket.setNumber(request.number());
        ticket.setRefundable(request.refundable());
        ticket.setVenue(venueRepository.findById(request.venueId()).orElseThrow(() -> new VenueNotFoundException(request.venueId())));

        ticketRepository.save(ticket);
    }
}   
