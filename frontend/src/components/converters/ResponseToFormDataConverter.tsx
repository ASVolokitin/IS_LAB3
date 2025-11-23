import { CoordinatesFormData } from "../../interfaces/formData/CoordinatesFormData";
import { EventFormData } from "../../interfaces/formData/EventFormData";
import { LocationFormData } from "../../interfaces/formData/LocationFormData";
import { PersonFormData } from "../../interfaces/formData/PersonFormData";
import { TicketFormData } from "../../interfaces/formData/TicketFormData";
import { VenueFormData } from "../../interfaces/formData/VenueFormData";
import { Location } from "../../interfaces/Location";
import { Person } from "../../interfaces/Person";
import { Ticket } from "../../interfaces/Ticket";
import { TicketEvent } from "../../interfaces/TicketEvent";
import { Venue } from "../../interfaces/Venue";
import { Coordinates } from "../../interfaces/Сoordinates";
import { devLog } from "../../services/logger";
import { EntityType } from "../../types/ConnectedObject";

function convertTicketToFormData(response: Ticket): TicketFormData {
    return {
        name: response.name,
        coordinatesId: String(response.coordinates.id),
        personId: response.person ? String(response.person.id) : null,
        eventId: response.event ? String(response.event.id) : null,
        price: String(response.price),
        type: response.type,
        discount: String(response.discount ?? ""),
        number: String(response.number),
        refundable: response.refundable,
        venueId: String(response.venue.id)
    }
}

function convertCoordinatesToFormData(response: Coordinates): CoordinatesFormData {
    return {
        x: String(response.x),
        y: String(response.y)
    }
}

function convertPersonToFormData(response: Person): PersonFormData {
    return {
        eyeColor: response.eyeColor,
        hairColor: response.hairColor,
        locationId: response.location ? String(response.location.id) : null,
        passportID: response.passportID ?? "",
        nationality: response.nationality ?? ""
    }
}

function convertEventToFormData(response: TicketEvent): EventFormData {
    return {
        name: response.name,
        date: response.date ? String(response.date) : null,
        minAge: response.minAge ? String(response.minAge) : null,
        description: response.description
    };
}

function convertVenueToFormData(response: Venue): VenueFormData {
    return {
        name: response.name,
        capacity: String(response.capacity),
        type: response.type ?? ""
    }
}

function convertLocationToFormData(response: Location): LocationFormData {
    return {
        x: String(response.x),
        y: response.y ? String(response.y) : "",
        z: String(response.z),
        name: response.name ?? ""

    }
}

export function convertResponseToFormData(type: EntityType,response: any) {
    devLog.log("data to convert: ", response);
    switch (type) {
        case "tickets":
            return convertTicketToFormData(response);
        case "coordinates":
            return convertCoordinatesToFormData(response);
        case "persons":
            return convertPersonToFormData(response);
        case "events":
            return convertEventToFormData(response);
        case "venues":
            return convertVenueToFormData(response);
        case "locations":
            return convertLocationToFormData(response);

    }
}