// DEPRECATED

import { useEffect, useState } from "react";
import { PersonFormData } from "../interfaces/formData/PersonFormData";
import { PersonDTO } from "../interfaces/dto/PersonDTO";
import { validatePersonField } from "../services/validator/personValidator";

export const usePersonForm = (initialData?: PersonFormData) => {
  const [formData, setFormData] = useState<PersonFormData>({
    eyeColor: "",
    hairColor: "",
    locationId: "",
    passportID: null,
    nationality: null,
  });

  const [errors, setErrors] = useState<Record<keyof PersonDTO, string>>({
    eyeColor: "",
    hairColor: "",
    locationId: "",
    passportID: "",
    nationality: "",
  });

  useEffect(() => {
    if (initialData) {

      setFormData({
        eyeColor: String(initialData.eyeColor),
        hairColor: String(initialData.hairColor),
        locationId: initialData.locationId|| null,
        passportID: String(initialData.passportID) || null,
        nationality: String(initialData.nationality) === "Not stated" ? null : initialData.nationality,
      });
      
    }
  }, [initialData]);

  const handleChange = (field: keyof PersonFormData, value: any) => {
    const safeValue = value === undefined ? "" : value;

    setFormData((prev) => ({
      ...prev,
      [field]: safeValue,
    }));

    const error = validatePersonField(field, safeValue);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const validateForm = (): boolean => {
    const newErrors = {
      eyeColor: validatePersonField("eyeColor", formData.eyeColor),
      hairColor: validatePersonField("hairColor", formData.hairColor),
      locationId: validatePersonField("locationId", formData.locationId),
      passportID: validatePersonField("passportID", formData.passportID),
      nationality: validatePersonField("nationality", formData.nationality),
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const getSubmitData = () => ({
    eyeColor: formData.eyeColor.trim(),
    hairColor: formData.hairColor.trim(),
    locationId: formData.locationId ? formData.locationId : null,
    passportID: formData.passportID ? formData.passportID : null,
    nationality: formData.nationality ? formData.nationality : null,
  });

  return {
    formData,
    errors,
    handleChange,
    validateForm,
    getSubmitData,
    isFormValid:
      !formData.eyeColor ||
      !formData.hairColor ||
      Object.values(errors).some((error) => error !== ""),
  };
};
