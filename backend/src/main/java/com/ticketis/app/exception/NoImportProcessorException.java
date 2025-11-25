package com.ticketis.app.exception;

import com.ticketis.app.exception.importBusinessException.ImportBusinessException;

public class NoImportProcessorException extends ImportBusinessException {

    public NoImportProcessorException(String entityType) {
        super(String.format("No import processor found for entities of type %s", entityType));
    }
    
}
