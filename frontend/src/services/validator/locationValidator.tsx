import { LocationFormData } from "../../interfaces/formData/LocationFormData";

export const validateLocationField = (name: keyof LocationFormData, value: any): string => {
    const numValue = Number(value);

    switch (name) {
      case "x":
        if (value === "") return "X coordinate should be specified";
        if (isNaN(numValue)) return "X coordinate should be a number";
        return "";

      case "y":
        if (isNaN(numValue)) return "Y coordinate should be a number";
        if (!Number.isInteger(numValue))
          return "Y coordinate should be integer";
        return "";

      case "z":
        if (value === "") return "Z coordinate should be specified";
        if (isNaN(numValue)) return "Z coordinate should be a number";
        return "";

      default:
        return "";
    }
  };