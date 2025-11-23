package com.ticketis.app.service;

import com.ticketis.app.controller.WebSocketEventController;
import com.ticketis.app.dto.WebSocketEvent;
import com.ticketis.app.dto.request.SellTicketRequest;
import com.ticketis.app.dto.request.TicketRequest;
import com.ticketis.app.dto.sql.CoordinatesTicketCount;
import com.ticketis.app.exception.PersonAlreadyOwnsThisTicketException;
import com.ticketis.app.exception.notfoundexception.CoordinatesNotFoundException;
import com.ticketis.app.exception.notfoundexception.EventNotFoundException;
import com.ticketis.app.exception.notfoundexception.PersonNotFoundException;
import com.ticketis.app.exception.notfoundexception.TicketNotFoundException;
import com.ticketis.app.exception.notfoundexception.VenueNotFoundException;
import com.ticketis.app.model.Ticket;
import com.ticketis.app.model.enums.WebSocketEventType;
import com.ticketis.app.repository.CoordinatesRepository;
import com.ticketis.app.repository.EventRepository;
import com.ticketis.app.repository.PersonRepository;
import com.ticketis.app.repository.TicketRepository;
import com.ticketis.app.repository.VenueRepository;
import com.ticketis.app.specification.GenericSpecification;
import jakarta.persistence.EntityManager;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final CoordinatesRepository coordinatesRepository;
    private final PersonRepository personRepository;
    private final EventRepository eventRepository;
    private final VenueRepository venueRepository;

    private final WebSocketEventController webSocketController;

    private final EntityManager em;

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll(Sort.by(Sort.Direction.ASC, "id"));
    }

    public Page<Ticket> getTicketsPage(Map<String, String> filters, Pageable pageable) {

        Specification<Ticket> spec = null;

        for (var entry : filters.entrySet()) {
            Specification<Ticket> filterSpec =
            GenericSpecification.stringContains(entry.getKey(), entry.getValue());
            if (filterSpec != null) {
                spec = (spec == null) ? filterSpec : spec.and(filterSpec);
            }
        }

        return (spec == null)
                ? ticketRepository.findAll(pageable)
                : ticketRepository.findAll(spec, pageable);
    }

    public Ticket getTicketById(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new TicketNotFoundException(id));
    }

    public void deleteTicketById(Long id) {
        Ticket ticket = getTicketById(id);
        ticketRepository.delete(ticket);

        WebSocketEvent event = new WebSocketEvent(WebSocketEventType.DELETED, id);
        webSocketController.sendTicketEvent(event);
    }

    public Long createTicket(TicketRequest request) {
        Ticket ticket = new Ticket(
                request.name(),
                coordinatesRepository.findById(request.coordinatesId())
                        .orElseThrow(()
                         -> new CoordinatesNotFoundException(request.coordinatesId())),
                (request.personId() == null) ? null
                        : personRepository
                                .findById(request.personId())

                                .orElseThrow(() -> new PersonNotFoundException(request.personId())),
                (request.eventId() == null) ? null
                        : eventRepository
                                .findById(request.eventId())
                                .orElseThrow(() -> new EventNotFoundException(request.eventId())),
                request.price(),
                request.type(),
                request.discount(),
                request.number(),
                request.refundable(),
                venueRepository.findById(request.venueId())
                        .orElseThrow(() -> new VenueNotFoundException(request.venueId())));

        ticket = ticketRepository.save(ticket);

        WebSocketEvent event = new WebSocketEvent(WebSocketEventType.CREATED, ticket.getId());
        webSocketController.sendTicketEvent(event);

        return ticket.getId();
    }

    public void updateTicket(Long id, TicketRequest request) {

        Ticket ticket = getTicketById(id);

        ticket.setName(request.name());
        ticket.setCoordinates(coordinatesRepository.findById(request.coordinatesId())
                .orElseThrow(() -> new CoordinatesNotFoundException(request.coordinatesId())));

        ticket.setPerson((request.personId() == null) ? null
                : personRepository.findById(request.personId())
                        .orElseThrow(() -> new PersonNotFoundException(request.personId())));

        ticket.setEvent((request.eventId() == null) ? null
                : eventRepository.findById(request.eventId())
                        .orElseThrow(() -> new EventNotFoundException(request.eventId())));
        ticket.setPrice(request.price());
        ticket.setType(request.type());
        ticket.setDiscount(request.discount());
        ticket.setNumber(request.number());
        ticket.setRefundable(request.refundable());
        ticket.setVenue(venueRepository.findById(request.venueId())
                .orElseThrow(() -> new VenueNotFoundException(request.venueId())));

        ticketRepository.save(ticket);

        WebSocketEvent event = new WebSocketEvent(WebSocketEventType.UPDATED, id);
        webSocketController.sendTicketEvent(event);
    }

    public List<CoordinatesTicketCount> countTicketsGroupedByCoordinates() {
        return ticketRepository.countTicketsGroupedByCoordinates();
    }

    public Long countTicketsByNumberEquals(double number) {
        return ticketRepository.countTicketsByNumberEquals(number);
    }

    public Long countTicketsByNumberLess(double number) {
        return ticketRepository.countTicketsByNumberLess(number);
    }

    @Transactional
    public void sellTicketByPrice(SellTicketRequest request) {
        if (!ticketRepository.existsById(request.ticketId())) {
            throw new TicketNotFoundException(request.ticketId());
        }
        if (!personRepository.existsById(request.buyerId())) {
            throw new PersonNotFoundException(request.ticketId());
        }

        Ticket ticket = getTicketById(request.ticketId());
        if (ticket.getPerson() != null && Objects.equals(ticket.getPerson().getId(),
                request.buyerId())) {
            throw new PersonAlreadyOwnsThisTicketException(
                String.format("Person with passport %s already own this ticket",
                    ticket.getPerson().getPassportID()));
        }

        ticketRepository.sellTicketByPrice(request.buyerId(), request.ticketId(), request.price());

        WebSocketEvent event = new WebSocketEvent(WebSocketEventType.UPDATED, request.ticketId());
        webSocketController.sendTicketEvent(event);

        em.getEntityManagerFactory().getCache().evictAll();
    }

    @Transactional
    public int unbookByPersonId(Long personId) {
        if (!personRepository.existsById(personId)) {
            throw new PersonNotFoundException(personId);
        }
        int modifiedRowsAmount = ticketRepository.unbookByPersonId(personId);

        em.getEntityManagerFactory().getCache().evictAll();

        WebSocketEvent event = new WebSocketEvent(WebSocketEventType.UPDATED_MANY, -1);
        webSocketController.sendTicketEvent(event);

        return modifiedRowsAmount;
    }
}
