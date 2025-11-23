package com.ticketis.app.exception;

public class PersonAlreadyOwnsThisTicketException extends RuntimeException {
    public PersonAlreadyOwnsThisTicketException(String message) {
        super(message);
    }
}
