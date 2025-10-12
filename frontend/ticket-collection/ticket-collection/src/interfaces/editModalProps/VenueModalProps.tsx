import { Venue } from "../Venue";

export interface VenueModalProps {
  isOpen: boolean;
  onClose: () => void;
  venueId: number;
  venueData?: Venue;
  onSave: (data: any) => Promise<void>;
}