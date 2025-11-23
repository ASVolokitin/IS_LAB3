// DEPRECATED

import { useState, useEffect } from 'react';
import { Venue } from '../interfaces/Venue';
import { VenueFormData } from '../interfaces/formData/VenueFormData';
import { validateVenueField } from '../services/validator/venueValidator';

export const useVenueForm = (initialData?: Venue) => {
  const [formData, setFormData] = useState<VenueFormData>({
    name: '',
    capacity: '',
    type: null
  });

  const [errors, setErrors] = useState<Record<keyof VenueFormData, string>>({
    name: '',
    capacity: '',
    type: ''
  });

  useEffect(() => {
    if (initialData) {


      setFormData({
        name: String(initialData.name || ''),
        capacity: String(initialData.capacity || ''),
        type: initialData.type || null
      });
    } else {
      setFormData({
        name: '',
        capacity: '',
        type: null
      });
    }
  }, [initialData]);

  const handleChange = (field: keyof VenueFormData, value: any) => {
    const safeValue = value === undefined ? '' : value;

    setFormData(prev => ({
      ...prev,
      [field]: safeValue
    }));

    const error = validateVenueField(field, safeValue);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const validateForm = (): boolean => {
    const newErrors = {
      name: validateVenueField('name', formData.name),
      capacity: validateVenueField('capacity', formData.capacity),
      type: ''
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const getSubmitData = () => ({
    name: formData.name.trim(),
    capacity: parseInt(formData.capacity),
    type: formData.type
  });

  return {
    formData,
    errors,
    handleChange,
    validateForm,
    getSubmitData,
    isFormValid: !formData.name || !formData.capacity ||
      Object.values(errors).some(error => error !== '')
  };
};