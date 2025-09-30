export const TICKET_TYPES = {
    VIP: "VIP",
    USUAL: "USUAL",
    BUDGETARY: "BUDGETARY",
    CHEAP: "CHEAP"
}

export type TicketType = typeof TICKET_TYPES[keyof typeof TICKET_TYPES];