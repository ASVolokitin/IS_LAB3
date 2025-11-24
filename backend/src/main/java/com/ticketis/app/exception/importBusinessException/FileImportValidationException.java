package com.ticketis.app.exception;

import java.util.List;

public class FileImportValidationException extends RuntimeException {

    public FileImportValidationException(String error) {
        super("Validation error found: " + error);
    }

    public FileImportValidationException(List<String> errors) {
        super("Validation errors found: " + errors);
    }
    
}
