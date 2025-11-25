package com.ticketis.app.exception.importBusinessException;

public abstract class ImportBusinessException extends RuntimeException {
    public ImportBusinessException(String message) {
        super(message);
    }
    
    public ImportBusinessException(String message, Throwable cause) {
        super(message, cause);
    }
}