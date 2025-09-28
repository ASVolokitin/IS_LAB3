package com.ticket_is.app.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.ticket_is.app.dto.request.VenueRequest;
import com.ticket_is.app.exception.notFoundException.VenueNotFoundException;
import com.ticket_is.app.model.Venue;
import com.ticket_is.app.repository.VenueRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class VenueService {

    private final VenueRepository venueRepository;

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
    }

    public void createVenue(VenueRequest request) {
        Venue venue = new Venue(request.name(), request.capacity(), request.type());
        venueRepository.save(venue);
    }

    public void updateVenue(int id, VenueRequest request) {
        Venue venue = getVenueById(id);
        venue.setName(request.name());
        venue.setCapacity(request.capacity());
        venue.setType(request.type());
        venueRepository.save(venue);
    }
    
}