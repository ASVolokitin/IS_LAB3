import { VenueType } from "../../types/VenueType";

export interface VenueFormData {
  name: string;
  capacity: string;
  type: VenueType | null;
}