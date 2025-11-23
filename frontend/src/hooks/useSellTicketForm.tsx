import { useState } from "react";
import { SellTicketFormData } from "../interfaces/formData/SellTicketFormData";
import { SellTicketDTO } from "../interfaces/dto/SellTicketDTO";
import { validateSellTicketField } from "../services/validator/sellTicketValidator";

export const useSellTicketForm = (initialData?: SellTicketDTO) => {
  const [formData, setFormData] = useState<SellTicketFormData>({
    buyerId: 0,
    ticketId: 0,
    price: 0,
  });

  const [errors, setErrors] = useState<
    Record<keyof SellTicketFormData, string>
  >({
    buyerId: "",
    ticketId: "",
    price: "",
  });

  const handleChange = (field: keyof SellTicketFormData, value: any) => {
    const safeValue = value === undefined ? "" : value;

    setFormData((prev) => ({
      ...prev,
      [field]: safeValue,
    }));

    const error = validateSellTicketField(field, safeValue);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const validateForm = (): boolean => {
    const newErrors = {
      buyerId: validateSellTicketField("buyerId", formData.buyerId),
      ticketId: validateSellTicketField("ticketId", formData.ticketId),
      price: validateSellTicketField("price", formData.price),
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const getSubmitData = () => ({

    buyerId: formData.buyerId,
    ticketId: formData.ticketId,
    price: formData.price,
  });

  return {
    formData,
    errors,
    handleChange,
    validateForm,
    getSubmitData,
    isFormValid:
      !formData.buyerId ||
      !formData.ticketId ||
      !formData.price ||
      Object.values(errors).some((error) => error !== ""),
  };
};
