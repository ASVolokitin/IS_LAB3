package com.ticketis.app.exception.notfoundexception;

public class LocationNotFoundException extends ResourceNotFoundException {

    public LocationNotFoundException(String message) {
        super(message);
    }

    public LocationNotFoundException(Long id) {
        super(String.format("Location was not found with id %d", id));
    }
}
