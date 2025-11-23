import { SellTicketFormData } from "../../interfaces/formData/SellTicketFormData";

export const validateSellTicketField = (
  name: keyof SellTicketFormData,
  value: any
) => {
  switch (name) {
    case "buyerId":
      if (value) {
        if (isNaN(Number(value))) return "Buyer ID should be a number";
        if (Number(value) <= 0) return "Buyer ID should be positive";
        if (!Number.isInteger(Number(value)))
          return "Buyer ID should be integer";
      }
      return "";

    case "ticketId":
      if (value) {
        if (isNaN(Number(value))) return "Ticket ID should be a number";
        if (Number(value) < 0) return "Ticket ID should not be negative";
        if (!Number.isInteger(Number(value)))
          return "Ticket ID should be integer";
      }
      return ""

    case "price":
      if (value) {
        if (isNaN(Number(value))) return "Price should be a number";
        if (Number(value) <= 0) return "Price should be positive";
        if (!Number.isInteger(Number(value))) return "Price should be integer";
      }
      return ""

      default:
        return "";
  }
};
