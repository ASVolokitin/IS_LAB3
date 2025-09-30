import { TicketType } from "../../types/TicketType";

export interface TicketDTO {
  name: string;
  coordinatesId: number | null;
  personId: number | null;
  eventId: number | null;
  price: string;
  type: TicketType | undefined;
  discount: string;
  number: string;
  refundable: string;
  venueId: number | null;
}
