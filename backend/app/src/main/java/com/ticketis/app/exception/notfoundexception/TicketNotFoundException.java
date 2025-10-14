package com.ticketis.app.exception.notfoundexception;

public class TicketNotFoundException extends ResourceNotFoundException {

    public TicketNotFoundException(String message) {
        super(message);
    }

    public TicketNotFoundException(Long id) {
        super(String.format("Ticket was not found with id %d", id));
    }
    
}