import { Filter } from "../interfaces/FilterInterface";
import { Ticket } from "../interfaces/Ticket";

export const filterTickets = (tickets: Ticket[], filters: Filter) => {

    if (!tickets || !Array.isArray(tickets) || tickets.length === 0) return [];

    const filtered = tickets.filter((ticket) => {
      const ticketNameMatch =
        filters.ticketNameFilter === "" ||
        ticket.name === filters.ticketNameFilter;
      const personPassportIDMatch =
        filters.personPassportIDFilter === "" ||
        ticket.person?.passportID === filters.personPassportIDFilter;
      const eventDescriptionMatch =
        filters.eventDescriptionFilter === "" ||
        ticket.event?.description === filters.eventDescriptionFilter;
      const venueNameDescriptionMatch =
        filters.venueNameDescription === "" ||
        ticket.venue.name === filters.venueNameDescription;
      const personLocationNameMatch =
        filters.personLocationName === "" ||
        ticket.person?.location?.name === filters.personLocationName;

      return (
        ticketNameMatch &&
        personPassportIDMatch &&
        eventDescriptionMatch &&
        venueNameDescriptionMatch &&
        personLocationNameMatch
      );
    });

    return filtered;
  };