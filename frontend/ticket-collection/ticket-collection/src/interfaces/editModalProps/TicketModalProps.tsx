import { TicketFormData } from "../formData/TicketFormData";

export interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: number;
  ticketData?: TicketFormData;
  onSave: (data: any) => Promise<void>;
}