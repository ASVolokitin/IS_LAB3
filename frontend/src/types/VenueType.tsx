export const VENUE_TYPES = {
    PUB: "PUB",
    LOFT: "LOFT",
    OPEN_AREA: "OPEN_AREA",
    MALL: "MALL"
}

export type VenueType = typeof VENUE_TYPES[keyof typeof VENUE_TYPES];