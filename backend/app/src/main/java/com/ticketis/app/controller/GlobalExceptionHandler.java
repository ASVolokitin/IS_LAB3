package com.ticketis.app.controller;

import com.ticketis.app.dto.response.ErrorResponse;
import com.ticketis.app.exception.PersonAlreadyOwnsThisTicketException;
import com.ticketis.app.exception.notfoundexception.ResourceNotFoundException;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import java.util.HashMap;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.postgresql.util.PSQLException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;



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
        ErrorResponse errorResponse =
         new ErrorResponse(exception.getMessage(), "Chosen person already owns this ticket");
        return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<?> handleDataIntegrityViolationException(
        DataIntegrityViolationException exception) {
        ErrorResponse errorResponse = 
        new ErrorResponse(exception.getMessage(),
         "Operation was denied by SQL constraint violation");
        return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<?> handleHttpMessageNotReadableException(
        HttpMessageNotReadableException exception) {
        ErrorResponse errorResponse = 
        new ErrorResponse(exception.getMessage(), "Invalid JSON data");
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(PSQLException.class)
    public ResponseEntity<?> handlePSQLException(
        PSQLException exception) {
        ErrorResponse errorResponse = new ErrorResponse(exception.getMessage(), "PSQL error");
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    // @ExceptionHandler(IllegalArgumentException.class)
    // public ResponseEntity<?> handleIllegalArgumentException(IllegalArgumentException exception) {
    //     ErrorResponse errorResponse = 
    // new ErrorResponse(exception.getMessage(), "Argument format error");
    //     return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    // }


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
    public ResponseEntity<?> handleConstraintViolationException(
        ConstraintViolationException exception) {

        Map<String, String> errors = new HashMap<>();

        for (ConstraintViolation<?> violation : exception.getConstraintViolations()) {
            String fieldName = violation.getPropertyPath().toString();
            String errorMessage = violation.getMessage();
            errors.put(fieldName, errorMessage);
        }
        ErrorResponse errorResponse = new ErrorResponse(errors.toString(), "Data validation error");
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
