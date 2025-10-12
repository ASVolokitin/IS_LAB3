import { EventCardData } from "../../interfaces/cardData/EventCardData";
import { EventResponse } from "../../interfaces/response/EventResponse";
import { EntityType } from "../../types/ConnectedObject";

export function convertEventResponseToCardData(response: EventResponse): EventCardData {
    return {
        id: String(response.id),
        name: response.name,
        date: response.date, // TODO: format date
        minAge: response.minAge ? String(response.minAge) + "+" : "No restrictions",
        description: response.description ? response.description : "No description"
    }
}

export function convertResponseToCardData(response: any[], type: EntityType) {
    
}