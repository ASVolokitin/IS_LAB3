import { CoordinatesDTO } from "../dto/CoordinatesDTO";
import { Coordinates } from "../Сoordinates";
export interface CoordinatesModalProps {
    isOpen: boolean;
    onClose: () => void;
    coordinatesId: number;
    coordinatesData: CoordinatesDTO;
    onSave: (data: any) => Promise<void>;
}