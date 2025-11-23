package com.ticketis.app.util;

import com.ticketis.app.dto.response.CreateResponse;
import com.ticketis.app.dto.response.DeleteByIdResponse;
import com.ticketis.app.dto.response.SaleResponse;
import com.ticketis.app.dto.response.UpdateByIdResponse;

public class ResponseBuilder {
    
    public static DeleteByIdResponse successfulDeletionById(String entity, Number id) {
        return new DeleteByIdResponse(
            id, String.format("Succesfully deleted %s with id %d.", entity, id));
    }

    public static CreateResponse successfulCreationById(String entity, Number id) {
        return new CreateResponse(
        id, String.format("Succesfully created %s with id %d.", entity, id));
    }

     public static UpdateByIdResponse successfulUpdateById(String entity, Number id) {
        return new UpdateByIdResponse(
            id, String.format("Succesfully updated %s with id %d.", entity, id));
    }

    public static SaleResponse successfulSellById(String entity, Number productId, Long buyerId) {
        return new SaleResponse(productId, buyerId, String.format(
            "Succesfully sold %s with id %d to a buyer with id %d.", entity, productId, buyerId));
    }
}
