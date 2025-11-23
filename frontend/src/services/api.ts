import axios from "axios"
import { TicketDTO } from "../interfaces/dto/TicketDTO";
import { CoordinatesDTO } from "../interfaces/dto/CoordinatesDTO";
import { PersonDTO } from "../interfaces/dto/PersonDTO";
import { TicketEventDTO } from "../interfaces/dto/TicketEventDTO";
import { VenueDTO } from "../interfaces/dto/VenueDTO";
import { LocationDTO } from "../interfaces/dto/LocationDTO";
import { SellTicketDTO } from "../interfaces/dto/SellTicketDTO";
import { SortOrder } from "../types/SortOrder";

const BASE_URL = process.env.REACT_APP_API_URL

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json"
    },
});

export const getTicketsPage = (page: number, size: number, sortField?: string, sortOrder?: SortOrder, filters?: string) => api.get(`/tickets?page=${page}&size=${size}${sortOrder ? `&sort=${sortField},${sortOrder}` : ""}${filters ? filters : ""}`);


export const getAllTickets = () => api.get("/tickets/all");

export const getCoordinates = () => api.get("/coordinates");

export const getPersons = () => api.get("/persons");

export const getEvents = () => api.get("/events");

export const getVenues = () => api.get("/venues");

export const getLocations = () => api.get("/locations");



export const createTicket = (ticketData: TicketDTO) => api.post("/tickets", ticketData);

export const createCoordinates = (coordinatesData: CoordinatesDTO) => api.post("/coordinates", coordinatesData);

export const createPerson = (personData: PersonDTO) => api.post("/persons", personData);

export const createEvent = (eventData: TicketEventDTO) => api.post("/events", eventData);

export const createVenue = (venueData: VenueDTO) => api.post("/venues", venueData);

export const createLocation = (locationData: LocationDTO) => api.post("/locations", locationData);



export const deleteTicket = (ticketId: number) => api.delete(`/tickets/${ticketId}`);

export const deletePerson = (personId: number) => api.delete(`/persons/${personId}`);

export const deleteLocation = (locationId: number) => api.delete(`/locations/${locationId}`);

export const deleteEvent = (eventId: number) => api.delete(`/events/${eventId}`);

export const deleteCoordinates = (coordinatesId: number) => api.delete(`/coordinates/${coordinatesId}`);

export const deleteVenue = (venueId: number) => api.delete(`/venues/${venueId}`);


export const updateTicket = (ticketId: number, ticketData: TicketDTO) => api.put(`/tickets/${ticketId}`, ticketData);

export const updateCoordinates = (coordinatesId: number, coordinatesData: CoordinatesDTO) => api.put(`/coordinates/${coordinatesId}`, coordinatesData);

export const updatePerson = (personId: number, personData: PersonDTO) => api.put(`/persons/${personId}`, personData);

export const updateEvent = (eventId: number, eventData: TicketEventDTO) => api.put(`/events/${eventId}`, eventData);

export const updateVenue = (venueId: number, venueData: VenueDTO) => api.put(`/venues/${venueId}`, venueData);

export const updateLocation = (locationId: number, locationData: LocationDTO) => api.put(`/locations/${locationId}`, locationData);



export const getTicketsGroupedByCoordinates = () => api.get("/tickets/count_grouped_by_coordinates");

export const getTicketsAmountByNumberEquals = (number: number) => api.get("/tickets/count_by_number_equals/" + number);

export const getTicketsAmountByNumberLess = (number: number) => api.get("/tickets/count_by_number_less/" + number);

export const cancelBookingsByPersonId = (personId: number) => api.post("/tickets/unbook?personId=" + personId);

export const sellTicketToPerson = (sellTicketData: SellTicketDTO) => api.post("tickets/sell", sellTicketData)