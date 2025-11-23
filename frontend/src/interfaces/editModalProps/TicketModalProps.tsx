import { TicketDTO } from "../dto/TicketDTO";
import { TicketFormData } from "../formData/TicketFormData";

export interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: number;
  ticketData?: TicketDTO;
  onSave: (data: any) => Promise<void>;
}