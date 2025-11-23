import { TicketDTO } from "../../interfaces/dto/TicketDTO";
import { Ticket } from "../../interfaces/Ticket";

export const convertTicketEntityToDto = (ticket: Ticket): TicketDTO => {
    return {
      name: ticket.name,
      coordinatesId: ticket.coordinates.id,
      personId: ticket.person?.id,
      eventId: ticket.event?.id,
      price: ticket.price,
      type: ticket.type,
      discount: ticket.discount,
      number: ticket.number,
      refundable: ticket.refundable,
      venueId: ticket.venue.id,
    };
  };