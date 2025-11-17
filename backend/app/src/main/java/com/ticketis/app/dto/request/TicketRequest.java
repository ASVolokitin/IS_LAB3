package com.ticketis.app.dto.request;

import com.ticketis.app.model.enums.TicketType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record  TicketRequest(

    @NotBlank
    String name,

    @NotNull   
    Long coordinatesId,

    Long personId,

    Integer eventId,

    @NotNull
    @Positive
    Long price,

    TicketType type,

    @Positive
    @Max(value = 100)
    Float discount,

    @Positive
    double number,

    @NotNull
    Boolean refundable,

    @NotNull
    Integer venueId
    
) {}
