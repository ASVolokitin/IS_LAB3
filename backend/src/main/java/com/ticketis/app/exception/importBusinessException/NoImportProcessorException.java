package com.ticketis.app.exception;

public class NoImportProcessorException extends RuntimeException {

    public NoImportProcessorException(String entityType) {
        super(String.format("No import processor found for entities of type %s", entityType));
    }
    
}
