package com.ticket_is.app.dto.request;

import com.ticket_is.app.model.enums.Color;
import com.ticket_is.app.model.enums.Country;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record PersonRequest(

    @NotNull
    Color eyeColor,

    @NotNull
    Color hairColor,

    Long locationId,

    @NotBlank
    @Size(max=29)
    String passportID,

    @Valid
    Country nationality

) {}
