import { VenueFormData } from "../../interfaces/formData/VenueFormData";

export const validateVenueField = (name: keyof VenueFormData, value: any): string => {
    switch (name) {
      case "name":
        if (!value || value.trim() === "") return "Name should not be blank";
        return "";

      case "capacity":
        if (!value) return "Capacity should be specified";
        if (isNaN(Number(value))) return "Capacity should be a number";
        if (Number(value) <= 0) return "Capacity should be greater than 0";
        if (!Number.isInteger(Number(value)))
          return "Capacity should be integer";
        if (value > 1e7) return "Capacity value is too big";
        return "";

      default:
        return "";
    }
  };