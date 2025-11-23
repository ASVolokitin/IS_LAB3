import { SellTicketFormData } from "../formData/SellTicketFormData";

export interface SellTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  personId: number;
  personData?: SellTicketFormData;
  onSave: (data: any) => Promise<void>;
}