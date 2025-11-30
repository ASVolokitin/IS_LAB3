package com.ticketis.app.controller;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.ticketis.app.dto.response.ErrorResponse;
import com.ticketis.app.dto.response.ValidationErrorResponse;
import com.ticketis.app.exception.*;
import com.ticketis.app.exception.importBusinessException.UnableToGetNecessaryFieldException;
import com.ticketis.app.exception.minio.MinioException;
import com.ticketis.app.exception.notfoundexception.ResourceNotFoundException;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.exception.GenericJDBCException;
import org.postgresql.util.PSQLException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.transaction.TransactionSystemException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import jakarta.persistence.RollbackException;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {


    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<?> handleHttpRequestMethodNotSupportedException(
            HttpRequestMethodNotSupportedException exception) {
        return new ResponseEntity<>("HTTP method not supported", HttpStatus.METHOD_NOT_ALLOWED);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<?> handleResourceNotFoundException(ResourceNotFoundException exception) {
        ErrorResponse errorResponse = new ErrorResponse(
                exception.getMessage(), "Resource not found");
        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(PersonAlreadyOwnsThisTicketException.class)
    public ResponseEntity<?> handlePersonAlreadyOwnsThisTicketException(
            PersonAlreadyOwnsThisTicketException exception) {
        ErrorResponse errorResponse = new ErrorResponse(exception.getMessage(),
                "Chosen person already owns this ticket");
        return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(TicketNameAlreadyExistsException.class)
    public ResponseEntity<?> handleTicketNameAlreadyExistsException(
            TicketNameAlreadyExistsException exception) {
        ErrorResponse errorResponse = new ErrorResponse(exception.getMessage(),
                "Ticket with this name already exists");
        return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
    }


    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<?> handleDataIntegrityViolationException(
            DataIntegrityViolationException exception) {
        log.warn("Data integrity violation: {}", exception.getMessage());

        String message = extractDetailedJpaMessage(exception);

        ErrorResponse errorResponse = new ErrorResponse(message,
                "Operation was denied by SQL constraint violation");
        return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(GenericJDBCException.class)
    public ResponseEntity<?> handleGenericJDBCException(GenericJDBCException exception) {
        log.warn("Database exception: {}", exception.getMessage());
        PSQLException psqlException = findPSQLException(exception);
        if (psqlException != null && "40001".equals(psqlException.getSQLState())) {
            String message = extractConstraintViolationMessage(psqlException.getMessage());
            ErrorResponse errorResponse = new ErrorResponse(message, "Database constraint violation");
            return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
        }

        Throwable cause = exception.getCause();
        if (cause instanceof PSQLException) {
            PSQLException internalPsql = (PSQLException) cause;
            if ("40001".equals(internalPsql.getSQLState())) {
                String message = extractConstraintViolationMessage(internalPsql.getMessage());
                ErrorResponse errorResponse = new ErrorResponse(message, "Database constraint violation");
                return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
            }
        }

        String message = extractConstraintViolationMessage(exception.getMessage());
        ErrorResponse errorResponse = new ErrorResponse(message, "Database error");
        return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(TransactionSystemException.class)
    public ResponseEntity<?> handleTransactionSystemException(TransactionSystemException exception) {
        log.error("Transaction system error: {}", exception.getMessage());

        String errorMessage = "Database transaction failed";
        String details = "Could not commit transaction";

        Throwable rootCause = exception.getRootCause();
        if (rootCause == null) {
            rootCause = exception.getCause();
        }

        PSQLException psqlException = findPSQLException(rootCause);
        if (psqlException != null && "40001".equals(psqlException.getSQLState())) {
            String message = extractConstraintViolationMessage(psqlException.getMessage());
            ErrorResponse errorResponse = new ErrorResponse(message, "Database constraint violation");
            return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
        }

        String detailedMessage = extractDetailedJpaMessage(rootCause);
        if (detailedMessage != null) {
            errorMessage = detailedMessage;
            details = "Database constraint violation";

            ErrorResponse errorResponse = new ErrorResponse(errorMessage, details);
            return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
        } else {
            if (psqlException != null) {
                String psqlMessage = psqlException.getMessage();
                errorMessage = extractConstraintViolationMessage(psqlMessage);
                details = "Database constraint violation: " + errorMessage;
            } else if (rootCause instanceof GenericJDBCException) {
                GenericJDBCException dbException = (GenericJDBCException) rootCause;
                errorMessage = extractConstraintViolationMessage(dbException.getMessage());
                details = "Database error during transaction";
            } else if (rootCause != null) {
                errorMessage = rootCause.getMessage();
                details = "Transaction error: " + rootCause.getClass().getSimpleName();
            }

            ErrorResponse errorResponse = new ErrorResponse(errorMessage, details);
            return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
        }
    }

    private String extractDetailedJpaMessage(Throwable throwable) {
        if (throwable == null) {
            return null;
        }

        log.debug("Extracting JPA message from: {}", throwable.getClass().getName());

        if (throwable instanceof RollbackException) {
            RollbackException rollbackEx = (RollbackException) throwable;
            log.debug("Found RollbackException, cause: {}", rollbackEx.getCause());
            return extractDetailedJpaMessage(rollbackEx.getCause());
        }

        if (throwable instanceof jakarta.persistence.PersistenceException) {
            jakarta.persistence.PersistenceException persistenceEx = (jakarta.persistence.PersistenceException) throwable;
            log.debug("Found PersistenceException, cause: {}", persistenceEx.getCause());
            return extractDetailedJpaMessage(persistenceEx.getCause());
        }

        if (throwable instanceof GenericJDBCException) {
            GenericJDBCException dbEx = (GenericJDBCException) throwable;
            log.debug("Found GenericJDBCException, cause: {}", dbEx.getCause());

            Throwable cause = dbEx.getCause();
            if (cause instanceof PSQLException) {
                PSQLException psqlEx = (PSQLException) cause;
                String message = extractConstraintViolationMessage(psqlEx.getMessage());
                log.debug("Extracted PSQL message: {}", message);
                return message;
            }

            String message = extractConstraintViolationMessage(dbEx.getMessage());
            log.debug("Extracted message from GenericJDBCException: {}", message);
            return message;
        }

        if (throwable instanceof PSQLException) {
            PSQLException psqlEx = (PSQLException) throwable;
            String message = extractConstraintViolationMessage(psqlEx.getMessage());
            log.debug("Found direct PSQLException, extracted: {}", message);
            return message;
        }

        PSQLException psqlException = findPSQLException(throwable);
        if (psqlException != null) {
            String message = extractConstraintViolationMessage(psqlException.getMessage());
            log.debug("Found PSQLException in chain, extracted: {}", message);
            return message;
        }

        log.debug("No detailed JPA message found");
        return null;
    }

    private PSQLException findPSQLException(Throwable throwable) {
        if (throwable == null) {
            return null;
        }
        if (throwable instanceof PSQLException) {
            return (PSQLException) throwable;
        }
        return findPSQLException(throwable.getCause());
    }

    private String extractConstraintViolationMessage(String psqlMessage) {
        if (psqlMessage == null) {
            return "Database constraint violation";
        }

        if (psqlMessage.contains("could not serialize access due to read/write dependencies among transactions")) {
            return "could not serialize access due to read/write dependencies among transactions";
        }

        if (psqlMessage.contains("duplicate key value violates unique constraint")) {
            String constraintName = extractConstraintName(psqlMessage);
            String keyDetails = extractKeyDetails(psqlMessage);

            if (keyDetails != null && constraintName != null) {
                return String.format("Duplicate value violates unique constraint: %s. %s",
                        constraintName, keyDetails);
            } else if (constraintName != null) {
                return String.format("Duplicate value violates unique constraint: %s", constraintName);
            } else {
                return "Duplicate value violates unique constraint";
            }
        }

        if (psqlMessage.contains("violates foreign key constraint")) {
            String constraintName = extractConstraintName(psqlMessage);
            if (constraintName != null) {
                return String.format(
                        "Foreign key constraint violation: %s - referenced entity is connected to this object",
                        constraintName);
            }
            return "Foreign key constraint violation: referenced entity is connected to this object";
        }

        if (psqlMessage.contains("violates check constraint")) {
            return "Check constraint violation: Value does not meet required conditions";
        }

        if (psqlMessage.contains("violates not-null constraint")) {
            return "Not-null constraint violation: Required field is missing";
        }

        String errorPrefix = "ERROR:";
        if (psqlMessage.contains(errorPrefix)) {
            int errorIndex = psqlMessage.indexOf(errorPrefix);
            String errorPart = psqlMessage.substring(errorIndex + errorPrefix.length()).trim();
            int newlineIndex = errorPart.indexOf('\n');
            if (newlineIndex > 0) {
                errorPart = errorPart.substring(0, newlineIndex).trim();
            }
            return errorPart;
        }

        return psqlMessage;
    }

    private String extractConstraintName(String message) {
        int start = message.indexOf('"');
        if (start >= 0) {
            int end = message.indexOf('"', start + 1);
            if (end > start) {
                return message.substring(start + 1, end);
            }
        }
        return null;
    }

    private String extractKeyDetails(String message) {
        String detailPrefix = "Detail:";
        if (message.contains(detailPrefix)) {
            int detailIndex = message.indexOf(detailPrefix);
            String detailPart = message.substring(detailIndex + detailPrefix.length()).trim();
            int newlineIndex = detailPart.indexOf('\n');
            if (newlineIndex > 0) {
                detailPart = detailPart.substring(0, newlineIndex).trim();
            }
            return detailPart;
        }
        return null;
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<?> handleHttpMessageNotReadableException(
            HttpMessageNotReadableException exception) {
        ErrorResponse errorResponse = new ErrorResponse(exception.getMessage(), "Invalid JSON data");
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(PSQLException.class)
    public ResponseEntity<?> handlePSQLException(
            PSQLException exception) {
        String detailedMessage = extractConstraintViolationMessage(exception.getMessage());
        ErrorResponse errorResponse = new ErrorResponse(detailedMessage, "PSQL error");
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleMethodArgumentNotValidException(
            MethodArgumentNotValidException exception) {

        Map<String, String> errors = new HashMap<>();

        exception.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        ErrorResponse errorResponse = new ErrorResponse(errors.toString(), "Data validation error");
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<?> handleConstraintViolationException(ConstraintViolationException exception) {

        Map<String, String> errors = new HashMap<>();

        for (ConstraintViolation<?> violation : exception.getConstraintViolations()) {
            String fieldName = violation.getPropertyPath().toString();
            String errorMessage = violation.getMessage();
            errors.put(fieldName, errorMessage);
        }
        ErrorResponse errorResponse = new ErrorResponse(errors.toString(), "Data validation error");
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleIllegalArgumentException(IllegalArgumentException exception) {
        ErrorResponse errorResponse = new ErrorResponse(exception.getMessage(), "Invalid argument provided");
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(JsonParseException.class)
    public ResponseEntity<?> handleJsonParseException(JsonParseException exception) {
        ErrorResponse errorResponse = new ErrorResponse(
                exception.getMessage(),
                "Unable to parse JSON: " + (exception.getLocation() != null
                        ? String.format("at line %d, column %d",
                                exception.getLocation().getLineNr(),
                                exception.getLocation().getColumnNr())
                        : "invalid JSON format"));
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(JsonProcessingException.class)
    public ResponseEntity<?> handleJsonProcessingException(JsonProcessingException exception) {
        log.error("JSON processing error: {}", exception.getMessage());
        String details = "Unable to process JSON";
        if (exception instanceof JsonParseException) {
            JsonParseException parseException = (JsonParseException) exception;
            if (parseException.getLocation() != null) {
                details = String.format("Unable to parse JSON at line %d, column %d",
                        parseException.getLocation().getLineNr(),
                        parseException.getLocation().getColumnNr());
            }
        }
        ErrorResponse errorResponse = new ErrorResponse(exception.getMessage(), details);
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(FailedToUploadFileException.class)
    public ResponseEntity<?> handleFailedToUploadFileException(FailedToUploadFileException exception) {
        ErrorResponse errorResponse = new ErrorResponse(exception.getMessage(), "Failed to upload file");
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(FileImportValidationException.class)
    public ResponseEntity<?> handleFileImportValidationException(FileImportValidationException exception) {
        ValidationErrorResponse errorResponse = ValidationErrorResponse.builder()
                .code("IMPORT_VALIDATION_FAILED")
                .message("Import file contains validation errors")
                .errors(exception.getErrors())
                .errorCount(exception.getErrors().size())
                .build();
        return new ResponseEntity<>(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    @ExceptionHandler(UnableToGetNecessaryFieldException.class)
    public ResponseEntity<?> handleUnableToGetNecessaryField(UnableToGetNecessaryFieldException exception) {
        ErrorResponse errorResponse = new ErrorResponse(exception.getMessage(), exception.getMessage());
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(FailedToProcessImportException.class)
    public ResponseEntity<?> handleFailedToProcessImportException(FailedToProcessImportException exception) {
        ErrorResponse errorResponse = new ErrorResponse(exception.getMessage(), "Failed to process import");
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(NoImportProcessorException.class)
    public ResponseEntity<?> handleNoImportProcessorException(NoImportProcessorException exception) {
        ErrorResponse errorResponse = new ErrorResponse(exception.getMessage(), exception.getMessage());
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<?> handleMaxUploadSizeExceededException(
            MaxUploadSizeExceededException exception) {
        ErrorResponse errorResponse = new ErrorResponse(
                "Uploaded file exceeds maximum allowed size",
                "File is too large");
        return new ResponseEntity<>(errorResponse, HttpStatus.PAYLOAD_TOO_LARGE);
    }

    @ExceptionHandler(MinioException.class)
    public ResponseEntity<?> handleMinioException(
            MinioException exception) {
        ErrorResponse errorResponse = new ErrorResponse(
                "Minio exception",
                exception.getMessage());
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    // @ExceptionHandler(Exception.class)
    // public ResponseEntity<?> handleException(Exception exception) {
    //     log.error("Internal server error: ", exception.getMessage());
    //     return new ResponseEntity<>(
    // "Sorry, something gone wrong on the server side, maybe try again? :( ",
    // HttpStatus.INTERNAL_SERVER_ERROR);
    // }

}
