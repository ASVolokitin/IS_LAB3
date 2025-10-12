import { EventFormData } from "../formData/EventFormData";

export interface EventFormProps {
    initialFormData: EventFormData;
    onChange: (field: keyof EventFormData, value: any) => void;
}