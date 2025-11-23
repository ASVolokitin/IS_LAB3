package com.ticketis.app.service;

import com.ticketis.app.controller.WebSocketEventController;
import com.ticketis.app.dto.WebSocketEvent;
import com.ticketis.app.dto.request.CoordinatesRequest;
import com.ticketis.app.exception.notfoundexception.CoordinatesNotFoundException;
import com.ticketis.app.model.Coordinates;
import com.ticketis.app.model.enums.WebSocketEventType;
import com.ticketis.app.repository.CoordinatesRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CoordinatesService {

    private final CoordinatesRepository coordinatesRepository;
    
    private final WebSocketEventController webSocketController;
    
    public List<Coordinates> getALlCoordinates() {
        return coordinatesRepository.findAll(Sort.by(Sort.Direction.ASC, "id"));
    }

    public Coordinates getCoordinatesById(Long id) {
        return coordinatesRepository.findById(id)
        .orElseThrow(() -> new CoordinatesNotFoundException(id));
    }

    public void deleteCoordinatesById(Long id) {
        Coordinates coordinates = getCoordinatesById(id);
        coordinatesRepository.delete(coordinates);  
        
        WebSocketEvent event = new WebSocketEvent(WebSocketEventType.DELETED, id);
        webSocketController.sendCoordinatesEvent(event);
    }

    public Long createCoordinates(CoordinatesRequest request) {
        Coordinates coordinates = new Coordinates(request.x(), request.y());
        coordinates = coordinatesRepository.save(coordinates);

        WebSocketEvent event = new WebSocketEvent(WebSocketEventType.CREATED, coordinates.getId());
        webSocketController.sendCoordinatesEvent(event);

        return coordinates.getId();
    }

    public void updateCoordinates(Long id, CoordinatesRequest request) {
        Coordinates coordinates = getCoordinatesById(id);
        coordinates.setX(request.x());
        coordinates.setY(request.y());
        coordinatesRepository.save(coordinates);

        WebSocketEvent event = new WebSocketEvent(WebSocketEventType.UPDATED, id);
        webSocketController.sendCoordinatesEvent(event);
    }
}
