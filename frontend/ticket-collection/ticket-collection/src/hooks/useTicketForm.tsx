import { useEffect, useState } from "react";
import { TicketFormData } from "../interfaces/formData/TicketFormData";
import { validateTicketField } from "../services/validator/ticketValidator";

export const useTicketForm = (initialData?: TicketFormData) => {
  const [formData, setFormData] = useState<TicketFormData>({
    name: "",
    coordinatesId: "",
    personId: null,
    eventId: null,
    price: "",
    type: null,
    discount: null,
    number: "",
    refundable: "No",
    venueId: "",
  });

  const [errors, setErrors] = useState<Record<keyof TicketFormData, string>>({
    name: "",
    coordinatesId: "",
    personId: "",
    eventId: "",
    price: "",
    type: "",
    discount: "",
    number: "",
    refundable: "",
    venueId: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: String(initialData.name || ""),
        coordinatesId: initialData.coordinatesId || "",
        personId: initialData.personId === "Not stated" ? null : initialData.personId,
        eventId: initialData.eventId === "Not stated" ? null : initialData.eventId,
        price: String(initialData.price || ""),
        type: initialData.type === "Not stated" ? null : initialData.type,
        discount: String(initialData.discount),
        number: String(initialData.number || ""),
        refundable: initialData.refundable,
        venueId: initialData.venueId,
      });

    } else {
      setFormData({
        name: "",
        coordinatesId: "",
        personId: null,
        eventId: null,
        price: "",
        type: null,
        discount: "",
        number: "",
        refundable: "No",
        venueId: "",
      });
    }
  }, [initialData]);

  const handleChange = (field: keyof TicketFormData, value: any) => {
    const safeValue = value === undefined ? "" : value;

    setFormData((prev) => ({
      ...prev,
      [field]: safeValue,
    }));

    const error = validateTicketField(field, safeValue);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const validateForm = (): boolean => {
    const newErrors = {
      name: validateTicketField("name", formData.name),
      coordinatesId: validateTicketField(
        "coordinatesId",
        formData.coordinatesId
      ),
      personId: validateTicketField("personId", formData.personId),
      eventId: validateTicketField("eventId", formData.eventId),
      price: validateTicketField("price", formData.price),
      type: validateTicketField("type", formData.type),
      discount: validateTicketField("discount", formData.discount),
      number: validateTicketField("number", formData.number),
      refundable: validateTicketField("refundable", formData.refundable),
      venueId: validateTicketField("venueId", formData.venueId),
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const getSubmitData = () => {
    return {
      name: formData.name.trim(),
      coordinatesId: parseInt(formData.coordinatesId),
      personId: formData.personId ? formData.personId : null,
      eventId: formData.eventId ? formData.eventId : null,
      price: parseInt(formData.price),
      type: formData.type !== "-" ? formData.type : null,
      discount: Number(formData.discount),
      number: Number(formData.number),
      refundable: formData.refundable === "Yes",
      venueId: formData.venueId,
    };
  };

  return {
    formData,
    errors,
    handleChange,
    validateForm,
    getSubmitData,
    isFormValid:
      !formData.name || Object.values(errors).some((error) => error !== ""),
  };
};
