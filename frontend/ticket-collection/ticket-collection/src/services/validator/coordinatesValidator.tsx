import { CoordinatesFormData } from "../../interfaces/formData/CoordinatesFormData";

export const validateCoordinatesField = (name: keyof CoordinatesFormData, value: string): string => {
    const numValue = Number(value);

    switch (name) {
      case "x": 
        if (value === "" || isNaN(numValue))
          return "X coordinate should not be null";
        if (numValue <= -201) return "X coordinate should be greater than -201";
        if (!Number.isInteger(numValue)) return "X coordinate be integer";
        return "";

      case "y":
        if (value === "" || isNaN(numValue))
          return "Y coordinate should not be null";
        if (numValue <= -5) return "Y coordinate should not be greater than -5";
        return "";

      default:
        return "";
    }
  };