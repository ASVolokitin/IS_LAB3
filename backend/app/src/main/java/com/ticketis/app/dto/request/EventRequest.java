package com.ticketis.app.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.Date;

public record EventRequest(

    @NotBlank
    String name,
    
    Date date,

    Integer minAge,

    @NotNull
    String description
    
) {}