import { Color } from "../types/Color";
import { Country } from "../types/Country";
import { Location } from "./Location";

export interface Person {
    id: number;
    eyeColor: Color;
    hairColor: Color;
    location: Location
    passportID: string;
    nationality: Country;
}