import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../../../elements/NavBar/NavBar";

import "../../CreateSubobjectPage/CreateSubobjectPage.css";
import "../../../../elements/Input/Input.css";
import { createEvent } from "../../../../../services/api";
import { EventFormData } from "../../../../../interfaces/formData/EventFormData";
import { validateEventField } from "../../../../../services/validator/eventValidator";

export const CreateEventPage = () => {
  const navigate = useNavigate();
  const [serverStatus, setServerStatus] = useState("");

  const [formData, setFormData] = useState<EventFormData>({
    name: "",
    date: "",
    minAge: "",
    description: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof EventFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    console.log("new value", value);

    const error = validateEventField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    Object.keys(formData).forEach((key) => {
      const error = validateEventField(
        key as keyof EventFormData,
        formData[key as keyof EventFormData]
      );
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const eventData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        date: formData.date ? new Date(formData.date) : null,
        minAge: formData.minAge ? parseInt(formData.minAge) : null,
      };

      console.log("Submitting event:", eventData);
      createEvent(eventData)
        .then(() => {
          setServerStatus(`Successfully created event`);
        })
        .catch((err) => {
          if (err.response) {
            const serverErrorMessage = err.response.data.message;
            console.log(serverErrorMessage);
            setServerStatus(`ERROR: ${serverErrorMessage}` || "Server error");
          } else if (err.request) setServerStatus("No response from server");
          else setServerStatus("Unable to send request");
        });

      navigate(-1);
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  const isFormValid = () => {
    return (
      !formData.name ||
      !formData.description ||
      Object.values(errors).some((error) => error !== "")
    );
  };

  return (
    <>
      <NavBar />
      <div className="form-page">
        <div className="full-form-container">
          <h1>Create new event</h1>

          <form onSubmit={handleSubmit} className="ticket-form">
            <div className="form-section">
              <h2>General information</h2>

              <div className="form-group">
                <label htmlFor="name">Event name *</label>
                <input
                  id="name"
                  type="text"
                  maxLength={1024}
                  className={`glass-input ${errors.name ? "input-error" : ""}`}
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
                {errors.name && (
                  <span className="error-message">{errors.name}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  className={`glass-input ${
                    errors.description ? "input-error" : ""
                  }`}
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Mood, dresscode etc."
                  rows={4}
                />
                {errors.description && (
                  <span className="error-message">{errors.description}</span>
                )}
              </div>
            </div>

            <div className="form-section">
              <h2>Additional information</h2>

              <div className="form-group">
                <label htmlFor="date">Event date</label>
                <input
                  id="date"
                  type="datetime-local"
                  className={`glass-input ${errors.date ? "input-error" : ""}`}
                  value={formData.date}
                  pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}"
                  step="300"
                  onChange={(e) => handleChange("date", e.target.value)}
                />
                {errors.date && (
                  <span className="error-message">{errors.date}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="minAge">Minimum age</label>
                <input
                  id="minAge"
                  type="number"
                  className={`glass-input ${
                    errors.minAge ? "input-error" : ""
                  }`}
                  value={formData.minAge}
                  onChange={(e) => handleChange("minAge", e.target.value)}
                  placeholder="Age restriction"
                />
                {errors.minAge && (
                  <span className="error-message">{errors.minAge}</span>
                )}
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
                Create event
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
