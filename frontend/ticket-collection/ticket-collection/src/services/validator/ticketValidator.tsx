import { TicketFormData } from "../../interfaces/formData/TicketFormData";
import { TicketDTO } from "../../interfaces/dto/TicketDTO";

export const validateTicketField = (
  name: keyof TicketDTO,
  value: any
): string => {
  switch (name) {
    case "name":
      if (!value || value.trim() === "") return "Name should not be blank";
      return "";

    case "price":
      if (!value || Number(value) <= 0) return "Price should be greater than 0";
      if (!Number.isInteger(Number(value))) return "Price should be an integer";
      return "";

    case "discount":
      if (value && (Number(value) < 0 || Number(value) > 100))
        return "Discount should be between 0 and 100";
      return "";

    case "number":
      if (!value || Number(value) <= 0)
        return "Number should be greater than 0";
      return "";

    case "coordinatesId":
      if (!value) return "You need to set coordinates";
      return "";

    case "venueId":
      if (!value) return "You need to set venue";
      return "";

    default:
      return "";
  }
};

export const newValidateTicketField = (
  name: keyof TicketFormData,
  value: any
): string => {
  switch (name) {
    case "name":
      if (!value || value.trim() === "") return "Name should not be blank";
      return "";

    case "price":
      if (!value || Number(value) <= 0) return "Price should be greater than 0";
      if (!Number.isInteger(Number(value))) return "Price should be an integer";
      return "";

    case "discount":
      if (isNaN(Number(value))) return "Discount should be a number";
      if (value && (Number(value) < 0 || Number(value) > 100))
        return "Discount should be between 0 and 100";
      return "";

    case "number":
      if (isNaN(Number(value))) return "Ticket number should be a number";
      if (!value || Number(value) <= 0)
        return "Number should be greater than 0";
      return "";

    case "coordinatesId":
      if (!value) return "You need to set coordinates";
      return "";

    case "venueId":
      if (!value) return "You need to set venue";
      return "";

    default:
      return "";
  }
};
