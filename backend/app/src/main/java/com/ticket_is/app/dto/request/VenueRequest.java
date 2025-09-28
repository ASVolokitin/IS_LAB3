package com.ticket_is.app.dto.request;

import com.ticket_is.app.model.enums.VenueType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record VenueRequest(

        @NotNull
        @NotBlank
        String name,

        @NotNull
        @Positive
        Integer capacity,

        VenueType type
    ) {

}
