// DEPRECATED

import { useState, useEffect } from "react";
import { TicketEvent } from "../interfaces/TicketEvent";
import { validateEventField } from "../services/validator/eventValidator";
import { EventFormData } from "../interfaces/formData/EventFormData";

export const useEventForm = (initialData?: TicketEvent) => {
  const [formData, setFormData] = useState<EventFormData>({
    name: "",
    description: "",
    minAge: "",
    date: "",
  });

  const [errors, setErrors] = useState<Record<keyof EventFormData, string>>({
    name: "",
    description: "",
    minAge: "",
    date: "",
  });
  const rawDate = initialData?.date;

  if (rawDate && rawDate !== "Not stated") {
    const date = new Date(rawDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    initialData.date = `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: String(initialData.name || ""),
        description: String(initialData.description || ""),
        minAge: String(initialData.minAge),
        date: initialData.date || "",
      });
    } else {
      setFormData({
        name: "",
        description: "",
        minAge: "",
        date: "",
      });
    }
  }, [initialData]);

  const handleChange = (field: keyof EventFormData, value: any) => {
    const safeValue = value === undefined ? "" : value;

    setFormData((prev) => ({
      ...prev,
      [field]: safeValue,
    }));

    const error = validateEventField(field, safeValue);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const validateForm = (): boolean => {
    const newErrors = {
      name: validateEventField("name", formData.name),
      description: validateEventField("description", formData.description),
      minAge: validateEventField("minAge", formData.minAge ? formData.minAge : ""),
      date: validateEventField("date", formData.date ? formData.date : ""),
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const getSubmitData = () => {
    return {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      minAge: formData.minAge ? parseInt(formData.minAge) : null,
      date: formData.date ? new Date(formData.date) : null,
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
