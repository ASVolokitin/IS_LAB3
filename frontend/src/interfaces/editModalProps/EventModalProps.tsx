import { TicketEventDTO } from "../dto/TicketEventDTO";

export interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: number;
  eventData?: TicketEventDTO;
  onSave: (data: any) => Promise<void>;
}