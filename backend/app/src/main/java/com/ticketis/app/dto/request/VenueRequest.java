package com.ticketis.app.dto.request;

import com.ticketis.app.model.enums.VenueType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record VenueRequest(

        @NotBlank
        String name,

        @NotNull
        @Positive
        Integer capacity,

        VenueType type
    ) {

}
