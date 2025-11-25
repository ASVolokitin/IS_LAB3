package com.ticketis.app.service;

import com.ticketis.app.controller.WebSocketEventController;
import com.ticketis.app.dto.WebSocketEvent;
import com.ticketis.app.dto.request.LocationRequest;
import com.ticketis.app.exception.notfoundexception.LocationNotFoundException;
import com.ticketis.app.model.Coordinates;
import com.ticketis.app.model.Location;
import com.ticketis.app.model.enums.WebSocketEventType;
import com.ticketis.app.repository.LocationRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LocationService {
    
    private final LocationRepository locationRepository;

    private final WebSocketEventController webSocketController;

    public List<Location> getAllLocations() {
        return locationRepository.findAll(Sort.by(Sort.Direction.ASC, "id"));
    }

    public Page<Location> getLocationsPage(Pageable pageable) {
        return locationRepository.findAll(pageable);
    }

    public Location getLocationById(Long id) {
        return locationRepository.findById(id)
        .orElseThrow(() -> new LocationNotFoundException(id));
    }

    public void deleteLocationById(Long id) {
        Location location = getLocationById(id);
        locationRepository.delete(location);

        WebSocketEvent event = new WebSocketEvent(WebSocketEventType.DELETED, id);
        webSocketController.sendLocationEvent(event);
    }

    public Long createLocation(LocationRequest request) {
        Location location = new Location(request.x(), request.y(), request.z(), request.name());
        location = locationRepository.save(location);

        WebSocketEvent event = new WebSocketEvent(WebSocketEventType.CREATED, location.getId());
        webSocketController.sendLocationEvent(event);

        return location.getId();
    }

    public void updateLocation(Long id, LocationRequest request) {
        Location location = getLocationById(id);
        location.setX(request.x());
        location.setY(request.y());
        location.setZ(request.z());
        location.setName(request.name());
        locationRepository.save(location);

        WebSocketEvent event = new WebSocketEvent(WebSocketEventType.UPDATED, id);
        webSocketController.sendLocationEvent(event);
    }
}
