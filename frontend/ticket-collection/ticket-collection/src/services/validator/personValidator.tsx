import { PersonFormData } from "../../interfaces/formData/PersonFormData";

export const validatePersonField = (name: keyof PersonFormData, value: any): string => {
    switch (name) {
      case "passportID":
        if (value && value.trim() === "")
          return "Passpord ID should not be blank";
        if (value && value.length > 29)
          return "Passport ID should not be longer than 29 symbols";
        return "";

      case "eyeColor":
        if (!value) return "Eye color should be specified";
        return "";

      case "hairColor":
        if (!value) return "Hair color should be specified";
        return "";

      default:
        return "";
    }
  };