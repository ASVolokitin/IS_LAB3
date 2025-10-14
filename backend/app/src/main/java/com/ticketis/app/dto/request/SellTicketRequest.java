package com.ticketis.app.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record SellTicketRequest(

    @NotNull
    @Positive
    Long buyerId,

    @NotNull
    @Positive
    Long ticketId,

    @NotNull
    @Positive
    Long price
) {}
