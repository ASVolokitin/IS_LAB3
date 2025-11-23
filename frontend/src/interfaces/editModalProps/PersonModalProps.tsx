import { PersonDTO } from "../dto/PersonDTO";
import { PersonFormData } from "../formData/PersonFormData";

export interface PersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  personId: number;
  personData?: PersonDTO;
  onSave: (data: any) => Promise<void>;
}