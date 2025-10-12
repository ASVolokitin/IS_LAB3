import { PersonFormData } from "../formData/PersonFormData";

export interface PersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  personId: number;
  personData?: PersonFormData;
  onSave: (data: any) => Promise<void>;
}