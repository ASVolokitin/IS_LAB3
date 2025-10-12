import { EventResponse } from "../response/EventResponse";
import { TicketEvent } from "../TicketEvent";

export interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: number;
  eventData?: EventResponse;
  onSave: (data: any) => Promise<void>;
}