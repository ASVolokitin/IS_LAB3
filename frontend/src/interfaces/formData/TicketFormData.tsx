export interface TicketFormData {
    name: string,
    coordinatesId: string,
    personId: string | null,
    eventId: string | null,
    price: string,
    type: string | null,
    discount: string | null,
    number: string,
    refundable: boolean,
    venueId: string
}