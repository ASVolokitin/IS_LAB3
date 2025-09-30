import { VenueType } from "../types/VenueType";

export interface Venue {
    id: number;
    name: string;
    capacity: number;
    type: VenueType;
}