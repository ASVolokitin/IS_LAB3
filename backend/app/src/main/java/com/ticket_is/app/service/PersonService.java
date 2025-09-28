package com.ticket_is.app.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.ticket_is.app.dto.request.PersonRequest;
import com.ticket_is.app.exception.notFoundException.LocationNotFoundException;
import com.ticket_is.app.exception.notFoundException.PersonNotFoundException;
import com.ticket_is.app.model.Person;
import com.ticket_is.app.repository.LocationRepository;
import com.ticket_is.app.repository.PersonRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PersonService {

    private final PersonRepository personRepository;
    private final LocationRepository locationRepository;

    public List<Person> getAllPersons() {
        return personRepository.findAll();
    }

    public Person getPersonById(Long id) {
        return personRepository.findById(id)
        .orElseThrow(() -> new PersonNotFoundException(id));
    }

    public void deletePersonById(Long id) {
        Person person = getPersonById(id);
        personRepository.delete(person);
    }

    public void createPerson(PersonRequest request) {
        Person person = new Person(
            request.eyeColor(),
            request.hairColor(),
            (request.locationId() == null) ? null : locationRepository.findById(request.locationId()).orElseThrow(() -> new LocationNotFoundException(request.locationId())),
            request.passportID(),
            request.nationality());
        personRepository.save(person);
    }
    
    public void updatePerson(Long id, PersonRequest request) {
        Person person = getPersonById(id);
        person.setEyeColor(request.eyeColor());
        person.setHairColor(request.hairColor());
        person.setLocation((request.locationId() == null) ? null : locationRepository.findById(request.locationId()).orElseThrow(() -> new LocationNotFoundException(request.locationId())));
        person.setPassportID(request.passportID());
        person.setNationality(request.nationality());
        personRepository.save(person);
    }
}
