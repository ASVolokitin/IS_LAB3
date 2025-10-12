import { EventFormData } from "../../interfaces/formData/EventFormData";
import { EventResponse } from "../../interfaces/response/EventResponse";

export function convertEventResponseToFormData(response: EventResponse): EventFormData {
    return {
        name: response.name,
        date: response.date,
        minAge: String(response.minAge),
        description: response.description
    };
}