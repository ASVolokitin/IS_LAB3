import { useEffect, useState } from "react";
import { Coordinates } from "../interfaces/Сoordinates";
import { CoordinatesFormData } from "../interfaces/formData/CoordinatesFormData";
import { validateCoordinatesField } from "../services/validator/coordinatesValidator";

export const useCoordinatesForm = (initialData?: Coordinates) => {
    const [formData, setFormData] = useState<CoordinatesFormData>({
        x: "",
        y: ""
    });

    const [errors, setErrors] = useState<Record<keyof CoordinatesFormData, string>>({
        x: "",
        y: ""
    })

    useEffect(() => {
        if (initialData) {
            setFormData({
                x: String(initialData.x),
                y: String(initialData.y)
            })
        }
        else {
            setFormData({
                x: "",
                y: ""
            })
        }
    }, [initialData])

    const handleChange = (field: keyof CoordinatesFormData, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value
        }))

        const error = validateCoordinatesField(field, value);
        setErrors((prev) => ({ ...prev, [field]: error }));
    }

    const validateForm = (): boolean => {
        const newErrors = {
          x: validateCoordinatesField("x", formData.x),
          y: validateCoordinatesField("y", formData.y)
        };
    
        setErrors(newErrors);
        return !Object.values(newErrors).some((error) => error !== "");
      };
    
      const getSubmitData = () => {
    
      return {
        x: parseInt(formData.x.trim()),
        y: Number(formData.y.trim())

      };
    };
    
      return {
        formData,
        errors,
        handleChange, 
        validateForm,
        getSubmitData,
        isFormValid:
          !formData.x || !formData.y || Object.values(errors).some((error) => error !== ""),
      };



}