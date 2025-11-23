package com.ticketis.app.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CoordinatesRequest(
    @NotNull
    @Min(value = -200)
    Integer x,

    @NotNull
    @Min(value = -4)
    Double y
    ) {}