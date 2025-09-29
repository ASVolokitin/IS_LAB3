import { Event } from "./Event";
import { Person } from "./Person";
import { Venue } from "./Venue";
import { Coordinates } from "./Сoordinates";

export interface Ticket {
    name: string;
    coordinates: Coordinates;
    creationDate: string;
    person: Person;
    event: Event;
    price: number;
    type: string;
    discount: number;
    number: number;
    refundable: boolean;
    venue: Venue;
}