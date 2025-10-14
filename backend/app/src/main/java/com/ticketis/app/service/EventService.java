package com.ticketis.app.service;

import com.ticketis.app.controller.WebSocketEventController;
import com.ticketis.app.dto.WebSocketEvent;
import com.ticketis.app.dto.request.EventRequest;
import com.ticketis.app.exception.notfoundexception.EventNotFoundException;
import com.ticketis.app.model.Event;
import com.ticketis.app.model.enums.WebSocketEventType;
import com.ticketis.app.repository.EventRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;

    private final WebSocketEventController webSocketController;


    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    public Event getEventById(Integer id) {
        return eventRepository.findById(id)
        .orElseThrow(() -> new EventNotFoundException(id));
    }

    public Integer deleteEventById(Integer id) {
        Event event = getEventById(id);
        eventRepository.delete(event);

        WebSocketEvent wsEvent = new WebSocketEvent(WebSocketEventType.DELETED, id);
        webSocketController.sendEventEvent(wsEvent);

        return event.getId();
    }

    public Integer createEvent(EventRequest request) {
        Event event = new Event(request.name(),
                                request.date(),
                                request.minAge(),
                                request.description());
        event = eventRepository.save(event);

        WebSocketEvent wsEvent = new WebSocketEvent(WebSocketEventType.CREATED, event.getId());
        webSocketController.sendEventEvent(wsEvent);

        return event.getId();
    }

    public void updateEvent(Integer id, EventRequest request) {
        Event event = getEventById(id);
        event.setName(request.name());
        event.setDate(request.date());
        event.setMinAge(request.minAge());
        event.setDescription(request.description());
        event = eventRepository.save(event);

        WebSocketEvent wsEvent = new WebSocketEvent(WebSocketEventType.UPDATED, id);
        webSocketController.sendEventEvent(wsEvent);
    }
    
}