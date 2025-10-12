export interface Filter {
    ticketNameFilter: string,
    personPassportIDFilter: string,
    eventDescriptionFilter: string,
    venueNameDescription: string,
    personLocationName: string,
}

export type FilterField = keyof Filter;