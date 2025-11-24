package com.ticketis.app.exception;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UnableToGetNecessaryFieldException extends RuntimeException {

    private String fieldType;
    private String objectType;

    public UnableToGetNecessaryFieldException(String fieldType, String objectType) {
        super(String.format("Unable to get necessary field %s of an object %s", fieldType, objectType));
    }
    
}