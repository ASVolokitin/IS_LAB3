package com.ticketis.app.exception.notfoundexception;

public class CoordinatesNotFoundException extends ResourceNotFoundException {

    public CoordinatesNotFoundException(String message) {
        super(message);
    }

    public CoordinatesNotFoundException(Long id) {
        super(String.format("Coordinates were not found with id %d", id));
    }
    
}
