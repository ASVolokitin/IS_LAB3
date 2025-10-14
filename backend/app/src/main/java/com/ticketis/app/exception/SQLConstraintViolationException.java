package com.ticketis.app.exception;

public class SQLConstraintViolationException extends RuntimeException {

    public SQLConstraintViolationException(String message) {
        super(message);
    }
    
}
