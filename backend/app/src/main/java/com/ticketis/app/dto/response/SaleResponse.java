package com.ticketis.app.dto.response;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class SaleResponse {
    Number productId;
    Number buyerId;
    String message;
    LocalDateTime timestamp;

    public SaleResponse(Number productId, Number buyerId, String message) {
        this.productId = productId;
        this.buyerId = buyerId;
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }
}
