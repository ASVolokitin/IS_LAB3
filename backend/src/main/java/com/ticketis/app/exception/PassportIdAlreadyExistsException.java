package com.ticketis.app.exception;

public class PassportIdAlreadyExistsException extends RuntimeException {
    
    public PassportIdAlreadyExistsException(String message) {
        super(message);
    }

    public PassportIdAlreadyExistsException() {
        super("Duplicating passport ID");
    }
}
