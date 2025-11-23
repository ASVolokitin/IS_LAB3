import { EventFormData } from "../../interfaces/formData/EventFormData";

export const validateEventField = (name: keyof EventFormData, value: string | null): string => {
    switch (name) {
      case "name":
        if (!value || value.trim() === "") return "Name should not be blank";
        return "";

      case "description":
        if (!value || value.trim() === "")
          return "Description should not be blank";
        return "";

      case "minAge":
        if (value !== "") {
          if (isNaN(Number(value))) return "Minimum age should be a number";
          if (Number(value) < 0) return "Minimum age should not be negative";
          if (!Number.isInteger(Number(value))) return "Minimum age should be integer";
        }
        return "";

      default:
        return "";
    }
  };