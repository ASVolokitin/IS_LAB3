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

export const getCoordinatesPage = (page: number, size: number) => api.get(`/coordinates?page=${page}&size=${size}&sort=id,asc`);

export const getPersonsPage = (page: number, size: number) => api.get(`/persons?page=${page}&size=${size}&sort=id,asc`);

export const getEventsPage = (page: number, size: number) => api.get(`/events?page=${page}&size=${size}&sort=id,asc`);

export const getVenuesPage = (page: number, size: number) => api.get(`/venues?page=${page}&size=${size}&sort=id,asc`);

export const getLocationsPage = (page: number, size: number) => api.get(`/locations?page=${page}&size=${size}&sort=id,asc`);

export const getImportsPage = (page: number, size: number) => api.get(`/import?page=${page}&size=${size}&sort=id,desc`);


export const getAllTickets = () => api.get("/tickets/all");

export const getCoordinates = () => api.get("/coordinates/all");

export const getPersons = () => api.get("/persons/all");

export const getEvents = () => api.get("/events/all");

export const getVenues = () => api.get("/venues/all");

export const getLocations = () => api.get("/locations/all");

export const getImportBatchesByHistoryItemId = (historyItemId: number) => api.get(`/import-batches/${historyItemId}`);

export const uploadImportFile = (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("entityType", "ticket");
    return axios.post("http://localhost:8081/api/import", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
};


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

export const getImportDownloadUrl = (importId: number) => `${BASE_URL}/imports/${importId}/download`;