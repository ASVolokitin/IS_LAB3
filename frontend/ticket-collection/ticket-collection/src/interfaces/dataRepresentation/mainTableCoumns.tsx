import { Ticket } from "../Ticket";

interface Column<T> {
  label: string;
  field: keyof T | string; // string для вложенных полей типа "person.eyeColor"
}

export const columns: Column<Ticket>[] = [
    { label: "ID", field: "id" },
    { label: "Name", field: "name" },
    { label: "X Coord", field: "coordinates.x" },
    { label: "Y Coord", field: "coordinates.y" },
    { label: "Creation Date", field: "creationDate" },

    { label: "Eye Color", field: "person.eyeColor" },
    { label: "Hair Color", field: "person.hairColor" },
    { label: "Location X", field: "person.location.x" },
    { label: "Location Y", field: "person.location.y" },
    { label: "Location Z", field: "person.location.z" },
    { label: "Location Name", field: "person.location.name" },
    { label: "Passport ID", field: "person.passportID" },
    { label: "Nationality", field: "person.nationality" },

    { label: "Event Name", field: "event.name" },
    { label: "Event Date", field: "event.date" },
    { label: "Event Min Age", field: "event.minAge" },
    { label: "Event Description", field: "event.description" },

    { label: "Price", field: "price" },
    { label: "Type", field: "type" },
    { label: "Discount", field: "discount" },
    { label: "Number", field: "number" },
    { label: "Refundable", field: "refundable" },

    { label: "Venue Name", field: "venue.name" },
    { label: "Venue Capacity", field: "venue.capacity" },
    { label: "Venue Type", field: "venue.type" },
];