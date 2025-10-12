import { Coordinates } from "../Сoordinates";

export interface CoordinatesModalProps {
    isOpen: boolean;
    onClose: () => void;
    coordinatesId: number;
    coordinatesData: Coordinates;
    onSave: (data: any) => Promise<void>;
}