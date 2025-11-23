export interface Filter {
    ticketName: string,
    personPassportID: string,
    eventDescription: string,
    venueName: string,
    personLocationName: string,
}

export type FilterField = keyof Filter;