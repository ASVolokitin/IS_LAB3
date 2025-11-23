import { LocationDTO } from "../dto/LocationDTO";
import { Location } from "../Location";

export interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  locationId: number;
  locationData?: LocationDTO;
  onSave: (data: any) => Promise<void>;
}