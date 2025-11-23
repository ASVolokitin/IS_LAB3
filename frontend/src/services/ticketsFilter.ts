import { Filter } from "../interfaces/FilterInterface";
import { Ticket } from "../interfaces/Ticket";

export const filterTickets = (tickets: Ticket[], filters: Filter) => {

    if (!tickets || !Array.isArray(tickets) || tickets.length === 0) return [];

    const filtered = tickets.filter((ticket) => {
      const ticketNameMatch =
        filters.ticketName === "" ||
        ticket.name === filters.ticketName;
      const personPassportIDMatch =
        filters.personPassportID === "" ||
        ticket.person?.passportID === filters.personPassportID;
      const eventDescriptionMatch =
        filters.eventDescription === "" ||
        ticket.event?.description === filters.eventDescription;
      const venueNameDescriptionMatch =
        filters.venueName === "" ||
        ticket.venue.name === filters.venueName;
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