package com.ticketis.app.dto.request;

import jakarta.validation.constraints.NotNull;

public record LocationRequest(
    
    @NotNull
    Float x,

    int y,

    @NotNull
    Double z,

    String name
) {}
