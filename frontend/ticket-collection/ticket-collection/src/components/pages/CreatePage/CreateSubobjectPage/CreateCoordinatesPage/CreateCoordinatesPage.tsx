import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../../../elements/NavBar/NavBar";

import "../../CreateSubobjectPage/CreateSubobjectPage.css"
import "../../../../elements/Input/Input.css";
import { CoordinatesDTO } from "../../../../../interfaces/dto/CoordinatesDTO";
import { createCoordinates } from "../../../../../services/api";

export const CreateCoordinatesPage = () => {
  const navigate = useNavigate();

  const [serverStatus, setServerStatus] = useState("");
  const [formData, setFormData] = useState<CoordinatesDTO>({
    x: undefined,
    y: undefined,
  });

  const [errors, setErrors] = useState<Record<keyof CoordinatesDTO, string>>({
    x: "",
    y: "",
  });

  const validateField = (name: keyof CoordinatesDTO, value: string): string => {
    const numValue = Number(value);

    switch (name) {
      case "x":
        if (value === "" || isNaN(numValue))
          return "X coordinate should not be null";
        if (numValue <= -201) return "X coordinate should be greater than -201";
        if (!Number.isInteger(numValue)) return "X coordinate be integer";
        return "";

      case "y":
        if (value === "" || isNaN(numValue))
          return "Y coordinate should not be null";
        if (numValue <= -5) return "Y coordinate should be greater than -5";
        return "";

      default:
        return "";
    }
  };

  const handleChange = (field: keyof CoordinatesDTO, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<keyof CoordinatesDTO, string> = {
      x: "",
      y: "",
    };

    let hasErrors = false;

    const xError = validateField("x", String(formData.x));
    const yError = validateField("y", String(formData.y));

    if (xError) {
      newErrors.x = xError;
      hasErrors = true;
    }

    if (yError) {
      newErrors.y = yError;
      hasErrors = true;
    }

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }


    createCoordinates(formData)
      .then(() => {setServerStatus(`Successfully created coordinates`); navigate(-1);})
      .catch((err) => {
        if (err.response) {
            console.log(err.response.data.message);
          setServerStatus(
            `ERROR: ${err.response.data.message}` || "Server error"
          );
      }
        else if (err.request) setServerStatus("No response from server");
        else setServerStatus("Unable to send request");
      });
    
  };

  const isFormValid = () => {
    return (
      !formData.x ||
      !formData.y ||
      Object.values(errors).some((error) => error !== "")
    );
  };

  return (
    <>
      <NavBar />
      <div className="create-subobject-page">
        <div className="form-container">
          <h1>Create new coordinates</h1>

          <form onSubmit={handleSubmit} className="coordinates-form">
            <div className="form-section">
              <div className="form-group">
                <label htmlFor="x">X coordinate *</label>
                <input
                  id="x"
                  type="number"
                  step="1"
                  className={`glass-input ${errors.x ? "input-error" : ""}`}
                  value={formData.x}
                  onChange={(e) => handleChange("x", e.target.value)}
                  placeholder="Integer, greater than 201"
                  min="-200"
                />
                {errors.x && <span className="error-message">{errors.x}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="y">Y coordinate *</label>
                <input
                  id="y"
                  type="number"
                  step="0.1"
                  className={`glass-input ${errors.y ? "input-error" : ""}`}
                  value={formData.y}
                  onChange={(e) => handleChange("y", e.target.value)}
                  placeholder="Integer, greater than -5"
                />
                {errors.y && <span className="error-message">{errors.y}</span>}
              </div>
            </div>
            <p>{serverStatus}</p>

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
                Create coordinates
              </button>
            </div>
          </form>
          
        </div>
      </div>
    </>
  );
};
