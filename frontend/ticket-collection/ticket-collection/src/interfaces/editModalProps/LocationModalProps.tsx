import { Location } from "../Location";

export interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  locationId: number;
  locationData?: Location;
  onSave: (data: any) => Promise<void>;
}