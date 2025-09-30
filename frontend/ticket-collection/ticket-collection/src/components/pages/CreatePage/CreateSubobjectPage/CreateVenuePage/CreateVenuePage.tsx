import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { VENUE_TYPES, VenueType } from "../../../../../types/VenueType";
import { createEvent, createVenue } from "../../../../../services/api";
import { VenueFormData } from "../../../../../formData/VenueFormData";

export const CreateVenuePage = () => {
  const navigate = useNavigate();
  const [serverStatus, setServerStatus] = useState("");
  const [formData, setFormData] = useState<VenueFormData>({
    name: "",
    capacity: "",
    type: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (name: keyof VenueFormData, value: any): string => {
    switch (name) {
      case "name":
        if (!value || value.trim() === "") return "Name should not be blank";
        return "";

      case "capacity":
        if (!value) return "Capacity should be specified";
        if (isNaN(Number(value))) return "Capacity should be a number";
        if (Number(value) <= 0) return "Capacity should be greater than 0";
        if (!Number.isInteger(Number(value)))
          return "Capacity should be integer";
        if (value > 1e7) return "Capacity value is too big";
        return "";

      default:
        return "";
    }
  };

  const handleChange = (field: keyof VenueFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    Object.keys(formData).forEach((key) => {
      const error = validateField(
        key as keyof VenueFormData,
        formData[key as keyof VenueFormData]
      );
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const venueData = {
      name: formData.name.trim(),
      capacity: parseInt(formData.capacity),
      type: formData.type,
    };

    createVenue(venueData)
      .then(() => {
        setServerStatus(`Successfully created venue`);
        navigate(-1);
      })
      .catch((err) => {
        if (err.response) {
          const serverErrorMessage = err.response.data.message;
          console.log(serverErrorMessage);
          if (serverErrorMessage.includes("value too long"))
              setServerStatus("Chosen venue name is too long");
            else
              setServerStatus(
                `ERROR: ${err.response.data.message}` || "Server error"
              );
          setServerStatus(`${serverErrorMessage}` || "Server error");
        } else if (err.request) setServerStatus("No response from server");
        else setServerStatus("Unable to send request");
      });
  };

  const isFormValid = () => {
    return (
      !formData.name ||
      !formData.capacity ||
      Object.values(errors).some((error) => error !== "")
    );
  };

  return (
    <div className="form-page">
      <div className="full-form-container">
        <h1>Create venue</h1>

        <form onSubmit={handleSubmit} className="ticket-form">
          <div className="form-section">
            <h2>General info</h2>

            <div className="form-group">
              <label htmlFor="name">Name *</label>
              <input
                id="name"
                type="text"
                maxLength={255}
                className={`glass-input ${errors.name ? "input-error" : ""}`}
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter venue name"
              />
              {errors.name && (
                <span className="error-message">{errors.name}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="capacity">Capacity *</label>
              <input
                id="capacity"
                type="number"
                step="1"
                className={`glass-input ${
                  errors.capacity ? "input-error" : ""
                }`}
                value={formData.capacity}
                onChange={(e) => handleChange("capacity", e.target.value)}
                placeholder="Enter capacity (e.g. 30)"
                min="1"
              />
              {errors.capacity && (
                <span className="error-message">{errors.capacity}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="type">Venue type</label>
              <select
                id="type"
                className="glass-select"
                value={formData.type || ""}
                onChange={(e) => handleChange("type", e.target.value || null)}
              >
                <option value="">Choose venue type</option>
                {Object.entries(VENUE_TYPES).map(([key, value]) => (
                  <option key={value} value={value}>
                    {key}
                  </option>
                ))}
              </select>
            </div>
            <div className="server-status-container">
              <p>{serverStatus}</p>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="outline-button"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="primary-button"
              disabled={isFormValid()}
            >
              Create venue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
