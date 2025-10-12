import { useEffect, useState } from "react";
import { LocationFormData } from "../interfaces/formData/LocationFormData";
import { Location } from "../interfaces/Location";
import { validateLocationField } from "../services/validator/locationValidator";

export const useLocationForm = (initialData?: Location) => {
  const [formData, setFormData] = useState<LocationFormData>({
    x: "",
    y: "",
    z: "",
    name: "",
  });

  const [errors, setErrors] = useState<Record<keyof LocationFormData, string>>({
    x: "",
    y: "",
    z: "",
    name: "",
  });

  useEffect(() => {
    console.log(initialData);
    if (initialData) {
      setFormData({
        x: String(initialData.x),
        y: String(initialData.y) || "",
        z: String(initialData.z),
        name: initialData.name || "",
      });
    } else {
      setFormData({
        x: "",
        y: "",
        z: "",
        name: "",
      });
    }
  }, [initialData]);

  const handleChange = (field: keyof LocationFormData, value: any) => {
    const safeValue = value === undefined ? "" : value;

    setFormData((prev) => ({
      ...prev,
      [field]: safeValue,
    }));

    const error = validateLocationField(field, safeValue);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const validateForm = (): boolean => {
    const newErrors = {

        x: validateLocationField("x", formData.x),
        y: validateLocationField("y", formData.y),
        z: validateLocationField("z", formData.z),
        name: validateLocationField("name", formData.name)
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const getSubmitData = () => {

    return {

        x: isNaN(Number(formData.x)) ? null : Number(formData.x),
        y: isNaN(Number(formData.y)) ? null : Number(formData.y),
        z: isNaN(Number(formData.z)) ? null : Number(formData.z),
        name: formData.name.trim()
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
