import { VenueFormData } from "../formData/VenueFormData";
import { Venue } from "../Venue";

export interface VenueModalProps {
  isOpen: boolean;
  onClose: () => void;
  venueId: number;
  venueData?: VenueFormData;
  onSave: (data: any) => Promise<void>;
}