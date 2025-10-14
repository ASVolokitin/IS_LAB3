package com.ticketis.app.service;

import com.ticketis.app.controller.WebSocketEventController;
import com.ticketis.app.dto.WebSocketEvent;
import com.ticketis.app.dto.request.VenueRequest;
import com.ticketis.app.exception.notfoundexception.VenueNotFoundException;
import com.ticketis.app.model.Venue;
import com.ticketis.app.model.enums.WebSocketEventType;
import com.ticketis.app.repository.VenueRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class VenueService {

    private final VenueRepository venueRepository;

    private final WebSocketEventController webSocketController;

    public List<Venue> getAllVenues() {
        return venueRepository.findAll();
    }

    public Venue getVenueById(int id) {
        return venueRepository.findById(id)
        .orElseThrow(() -> new VenueNotFoundException(id));
    }

    public void deleteVenueById(int id) {
        Venue venue = getVenueById(id);
        venueRepository.delete(venue);

        WebSocketEvent event = new WebSocketEvent(WebSocketEventType.DELETED, id);
        webSocketController.sendVenueEvent(event);
    }

    public Integer createVenue(VenueRequest request) {
        Venue venue = new Venue(request.name(), request.capacity(), request.type());
        venue = venueRepository.save(venue);

        WebSocketEvent event = new WebSocketEvent(WebSocketEventType.CREATED, venue.getId());
        webSocketController.sendVenueEvent(event);

        return venue.getId();
    }

    public void updateVenue(int id, VenueRequest request) {
        Venue venue = getVenueById(id);
        venue.setName(request.name());
        venue.setCapacity(request.capacity());
        venue.setType(request.type());
        venueRepository.save(venue);

        WebSocketEvent event = new WebSocketEvent(WebSocketEventType.UPDATED, id);
        webSocketController.sendVenueEvent(event);
    }
    
}