import { Ticket } from "../interfaces/Ticket";
import { Person } from "../interfaces/Person";
import { Venue } from "../interfaces/Venue";
import { Coordinates } from "../interfaces/Сoordinates";
import { TicketEvent } from "../interfaces/TicketEvent";
import { EntityData, EntityType } from "../types/ConnectedObject";
import { Location } from "../interfaces/Location";
import { formattedDate } from "./format";
import { ImportHistoryItem } from "../interfaces/ImportHistoryItem";

export const mapTicketToEntity = (ticket: Ticket): EntityData => ({
  id: ticket.id,
  title: ticket.name,
  description: `Price: $${ticket.price} • Type: ${
    ticket.type || "Not defined"
  }`,
  type: "tickets",
  data: {
    name: ticket.name,
    coordinates: ticket.coordinates ? ticket.coordinates.id : "Not stated",
    person: ticket.person ? ticket.person.passportID : "Not stated",
    event: ticket.event ? ticket.event.name : "Not stated",
    price: ticket.price,
    type: ticket.type ? ticket.type : "Not stated",
    discount: ticket.discount ? `${ticket.discount}%` : "No",
    number: ticket.number,
    refundable: ticket.refundable ? "Yes" : "No",
    venue: ticket.venue ? ticket.venue.name : "Not stated"
  },
});

export const mapCoordinatesToEntity = (coord: Coordinates): EntityData => ({
  id: coord.id,
  title: `Coordinates #${coord.id}`,
  description: `X: ${coord.x}, Y: ${coord.y}`,
  type: "coordinates",
  data: {
    x: coord.x,
    y: coord.y,
  },
});

export const mapPersonToEntity = (person: Person): EntityData => ({
  id: person.id,
  title: person.passportID || `Person #${person.id}`,
  description: `Eyes: ${person.eyeColor} • Hair: ${person.hairColor}`,
  type: "persons",
  data: {
    eyeColor: person.eyeColor,
    hairColor: person.hairColor,
    location: person.location ? person.location.name : "Not stated",
    nationality: person.nationality || "Not stated",
    passportID: person.passportID || "No passport ID",
  },
});

export const mapVenueToEntity = (venue: Venue): EntityData => ({
  id: venue.id,
  title: venue.name,
  description: `Capacity: ${venue.capacity} • ${
    venue.type || "Type is not stated"
  }`,
  type: "venues",
  data: {
    capacity: venue.capacity,
    type: venue.type || "Not stated",
  },
});

export const mapEventToEntity = (event: TicketEvent): EntityData => ({
  id: event.id,
  title: event.name,
  description: event.description || "No description",
  type: "events",
  data: {
    date: event.date ? formattedDate(event.date): "Not stated",
    minAge: event.minAge > 0 ? event.minAge : "No restrictions",
  },
});

export const mapLocationToEntity = (location: Location): EntityData => ({
  id: location.id,
  title: location.name || `location #${location.id}`,
  description: location.name  || "No description",
  type: "locations",
  data: {
    x: location.x,
    y: location.y,
    z: location.z,
  },
});

export const mapImportHistoryItemToEntity = (importHistoryItem: ImportHistoryItem): EntityData => ({
  id: importHistoryItem.id,
  title: importHistoryItem.filename,
  description: importHistoryItem.resultDescription  || "No description",
  type: "import_history",
  data: {
    importedAt: importHistoryItem.importedAt,
    importStatus: importHistoryItem.importStatus,
  },
});

export const mapEntitiesByType = (
  entities: any[],
  type: EntityType
): EntityData[] => {
  const mapper: Record<EntityType, (entity: any) => EntityData> = {
    tickets: mapTicketToEntity,
    coordinates: mapCoordinatesToEntity,
    persons: mapPersonToEntity,
    venues: mapVenueToEntity,
    events: mapEventToEntity,
    locations: mapLocationToEntity,
    import_history: mapImportHistoryItemToEntity
  };

  return entities.map(mapper[type]);
};
