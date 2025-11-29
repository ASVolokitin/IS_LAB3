package com.ticketis.app.exception.notfoundexception;

public class ImportBatchNotFoundException extends ResourceNotFoundException {

    public ImportBatchNotFoundException(String message) {
        super(message);
    }

    public ImportBatchNotFoundException(Long id) {
        super(String.format("Import batch was not found with id %d", id));
    }
}
