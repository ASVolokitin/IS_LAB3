import axios from "axios"

const BASE_URL = "http://localhost:8081"

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json"
    },
});

export const getTickets = () => api.get("/tickets");

export const getCoordinates = () => api.get("/coordinates");

export const gerPersons = () => api.get("/persons");

export const getEvents = () => api.get("/events");

export const getVenues = () => api.get("/venues");

export const getLocations = () => api.get("/locations");



export const getTicketsGroupedByCoordinates = () => api.get("/tickets/count_grouped_by_coordinates");

export const getTicketsAmountByNumberEquals = (number: number) => api.get("/tickets/count_by_number_equals/" + number);

export const getTicketsAmountByNumberLess = (number: number) => api.get("/tickets/count_by_number_less/" + number);

export const cancelBookingsByPersonId = (personId: number) => api.post("/tickets/unbook?personId=" + personId);