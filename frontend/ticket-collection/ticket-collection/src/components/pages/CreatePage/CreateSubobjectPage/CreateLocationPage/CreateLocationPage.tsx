import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../../../elements/NavBar/NavBar";

import "../CreateSubobjectPage.css";
import "../../../../elements/Input/Input.css";
import { createLocation } from "../../../../../services/api";
import { LocationDTO } from "../../../../../interfaces/dto/LocationDTO";
import { validateLocationField } from "../../../../../services/validator/locationValidator";

export const CreateLocationPage = () => {
  const [serverStatus, setServerStatus] = useState("");
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LocationDTO>({
    x: null,
    y: null,
    z: null,
    name: "",
  });

  const [errors, setErrors] = useState<Record<keyof LocationDTO, string>>({
    x: "",
    y: "",
    z: "",
    name: "",
  });


  const handleChange = (field: keyof LocationDTO, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    const error = validateLocationField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const xError = validateLocationField("x", formData.x);
    const yError = validateLocationField("y", formData.y);
    const zError = validateLocationField("z", formData.z);
    const nameError = validateLocationField("name", formData.name);

    const newErrors = {
      x: xError,
      y: yError,
      z: zError,
      name: nameError,
    };

    setErrors(newErrors);

    if (xError || yError || zError) {
      return;
    }

    try {
      console.log("Submitting location:", formData);

      createLocation(formData)
        .then(() => {
          setServerStatus(`Successfully created location`);
          navigate(-1);
        })
        .catch((err) => {
          if (err.response) {
            const serverErrorMessage = err.response.data.message;
            console.log(serverErrorMessage);
            if (serverErrorMessage.includes("value too long"))
              setServerStatus("Chosen location name is too long");
            else
              setServerStatus(
                `ERROR: ${err.response.data.message}` || "Server error"
              );
          } else if (err.request) setServerStatus("No response from server");
          else setServerStatus("Unable to send request");
        });

    } catch (error) {
      console.error("Error creating location:", error);
    }
  };

  const isFormValid = () => {
    return (
      !formData.x ||
      !formData.z ||
      Object.values(errors).some((error) => error !== "")
    );
  };

  return (
    <>
      <NavBar />
      <div className="form-page">
        <div className="full-form-container">
          <h1>Create new location</h1>

          <form onSubmit={handleSubmit} className="ticket-form">
            <div className="form-section">
              <h2>Coordinates</h2>

              <div className="form-group">
                <label htmlFor="x">Coordinate X *</label>
                <input
                  id="x"
                  type="number"
                  className={`glass-input ${errors.x ? "input-error" : ""}`}
                  value={String(formData.x)}
                  onChange={(e) => handleChange("x", e.target.value)}
                  placeholder="Number"
                />
                {errors.x && <span className="error-message">{errors.x}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="y">Coordinate Y</label>
                <input
                  id="y"
                  type="number"
                  step="1"
                  className={`glass-input ${errors.y ? "input-error" : ""}`}
                  value={String(formData.y)}
                  onChange={(e) => handleChange("y", e.target.value)}
                  placeholder="Integer"
                />
                {errors.y && <span className="error-message">{errors.y}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="z">Coordinate Z *</label>
                <input
                  id="z"
                  type="number"
                  step="0.1"
                  className={`glass-input ${errors.z ? "input-error" : ""}`}
                  value={String(formData.z)}
                  onChange={(e) => handleChange("z", e.target.value)}
                  placeholder="Number"
                />
                {errors.z && <span className="error-message">{errors.z}</span>}
              </div>
            </div>

            <div className="form-section">
              <h2>Additional</h2>

              <div className="form-group">
                <label htmlFor="name">Location name</label>
                <input
                  id="name"
                  type="text"
                  className={`glass-input ${errors.name ? "input-error" : ""}`}
                  value={String(formData.name)}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
                {errors.name && (
                  <span className="error-message">{errors.name}</span>
                )}
              </div>
            </div>
            <div className="server-status-container">
              <p>{serverStatus}</p>
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
                Create location
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
