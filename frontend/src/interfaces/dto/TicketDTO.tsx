import { TicketType } from "../../types/TicketType";

export interface TicketDTO {
  name: string;
  coordinatesId: number | null;
  personId: number | null;
  eventId: number | null;
  price: number;
  type: TicketType | null;
  discount: number | null ;
  number: number ;
  refundable: boolean;
  venueId: number | null;
}
