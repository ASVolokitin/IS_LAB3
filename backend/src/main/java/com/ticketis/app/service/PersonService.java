package com.ticketis.app.service;

import com.ticketis.app.controller.WebSocketEventController;
import com.ticketis.app.dto.WebSocketEvent;
import com.ticketis.app.dto.request.PersonRequest;
import com.ticketis.app.exception.notfoundexception.LocationNotFoundException;
import com.ticketis.app.exception.notfoundexception.PersonNotFoundException;
import com.ticketis.app.model.Person;
import com.ticketis.app.model.enums.WebSocketEventType;
import com.ticketis.app.repository.LocationRepository;
import com.ticketis.app.repository.PersonRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PersonService {

    private final PersonRepository personRepository;
    private final LocationRepository locationRepository;

    private final WebSocketEventController webSocketController;

    public List<Person> getAllPersons() {
        return personRepository.findAll(Sort.by(Sort.Direction.ASC, "id"));
    }

    public Person getPersonById(Long id) {
        return personRepository.findById(id)
        .orElseThrow(() -> new PersonNotFoundException(id));
    }

    public void deletePersonById(Long id) {
        Person person = getPersonById(id);
        personRepository.delete(person);

        WebSocketEvent event = new WebSocketEvent(WebSocketEventType.DELETED, id);
        webSocketController.sendPersonEvent(event);
    }

    public Long createPerson(PersonRequest request) {
        Person person = new Person(
            request.eyeColor(),
            request.hairColor(),
            (request.locationId() == null) ? null : 
            locationRepository.findById(request.locationId())
            .orElseThrow(() -> new LocationNotFoundException(request.locationId())),
            request.passportID(),
            request.nationality());
            
        person = personRepository.save(person);

        WebSocketEvent event = new WebSocketEvent(WebSocketEventType.CREATED, person.getId());
        webSocketController.sendPersonEvent(event);
        
        return person.getId();
    }
    
    public void updatePerson(Long id, PersonRequest request) {
        Person person = getPersonById(id);
        person.setEyeColor(request.eyeColor());
        person.setHairColor(request.hairColor());
        person.setLocation((request.locationId() == null) ? null : 
        locationRepository.findById(request.locationId())
        .orElseThrow(() -> new LocationNotFoundException(request.locationId())));
        person.setPassportID(request.passportID());
        person.setNationality(request.nationality());
        personRepository.save(person);

        WebSocketEvent event = new WebSocketEvent(WebSocketEventType.UPDATED, id);
        webSocketController.sendPersonEvent(event);
    }
}
