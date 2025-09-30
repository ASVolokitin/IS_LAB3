import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavBar from "../../../../elements/NavBar/NavBar";

import "../../../../elements/Input/Input.css";
import "../../../../elements/Select/Select.css";
import { Color, COLORS } from "../../../../../types/Color";
import { PersonDTO } from "../../../../../interfaces/dto/PersonDTO";
import { COUNTRIES } from "../../../../../types/Country";
import { createPerson, getLocations } from "../../../../../services/api";
import { Location } from "../../../../../interfaces/Location";

export const CreatePersonPage = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverStatus, setServerStatus] = useState("");
  const [locations, setLocations] = useState<Location[]>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<PersonDTO>({
    eyeColor: COLORS.BLUE,
    hairColor: COLORS.WHITE,
    locationId: null,
    passportID: "",
    nationality: null,
  });

  useEffect(() => {
    loadExistingObjects();
  }, []);

  const loadExistingObjects = async () => {
    getLocations()
      .then((res) => setLocations(res.data))
      .catch((err) => setServerStatus(err));
  };

  const validateField = (name: keyof PersonDTO, value: any): string => {
    switch (name) {
      case "passportID":
        if (value && value.trim() === "")
          return "Passpord ID should not be blank";
        if (value && value.length > 29)
          return "Passport ID should not be longer than 29 symbols";
        return "";

      case "eyeColor":
        if (!value) return "Eye color should be specified";
        return "";

      case "hairColor":
        if (!value) return "Hair color should be specified";
        return "";

      default:
        return "";
    }
  };

  const handleChange = (field: keyof PersonDTO, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    Object.keys(formData).forEach((key) => {
      const error = validateField(
        key as keyof PersonDTO,
        formData[key as keyof PersonDTO]
      );
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    console.log(formData);

    createPerson(formData)
      .then(() => {
        setServerStatus(`Successfully created person`);
        navigate(-1);
      })
      .catch((err) => {
        if (err.response) {
          const serverErrorMessage = err.response.data.message;
          console.log(serverErrorMessage);
          if (serverErrorMessage.includes("already exists"))
            setServerStatus("Person with this ID already exists");
          else
            setServerStatus(`ERROR: ${serverErrorMessage}` || "Server error");
        } else if (err.request) setServerStatus("No response from server");
        else setServerStatus("Unable to send request");
      });
  };

  const isFormValid = () => {
    return (
      !formData.eyeColor ||
      !formData.hairColor ||
      Object.values(errors).some((error) => error !== "")
    );
  };

  return (
    <>
      <NavBar />
      <div className="form-page">
        <div className="full-form-container">
          <h1>Create new person</h1>

          <form onSubmit={handleSubmit} className="ticket-form">
            <div className="form-section">
              <h2>General</h2>

              <div className="form-group">
                <label htmlFor="eyeColor">Eye color *</label>
                <select
                  id="eyeColor"
                  className={`glass-select ${
                    errors.eyeColor ? "input-error" : ""
                  }`}
                  value={formData.eyeColor}
                  onChange={(e) =>
                    handleChange("eyeColor", e.target.value as Color)
                  }
                >
                  {Object.entries(COLORS).map(([key, value]) => (
                    <option key={value} value={value}>
                      {key}
                    </option>
                  ))}
                </select>
                {errors.eyeColor && (
                  <span className="error-message">{errors.eyeColor}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="hairColor">Hair color *</label>
                <select
                  id="hairColor"
                  className={`glass-select ${
                    errors.hairColor ? "input-error" : ""
                  }`}
                  value={formData.hairColor}
                  onChange={(e) =>
                    handleChange("hairColor", e.target.value as Color)
                  }
                >
                  {Object.entries(COLORS).map(([key, value]) => (
                    <option key={value} value={value}>
                      {key}
                    </option>
                  ))}
                </select>
                {errors.hairColor && (
                  <span className="error-message">{errors.hairColor}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="nationality">Nationality</label>
                <select
                  id="nationality"
                  className="glass-select"
                  value={formData.nationality || ""}
                  onChange={(e) =>
                    handleChange("nationality", e.target.value || null)
                  }
                >
                  <option value="">Choose nationality</option>
                  {Object.entries(COUNTRIES).map(([key, value]) => (
                    <option key={value} value={value}>
                      {key}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-section">
              <h2>Personal</h2>

              <div className="form-group">
                <label htmlFor="passportID">Passport ID</label>
                <input
                  id="passportID"
                  type="text"
                  className={`glass-input ${
                    errors.passportId ? "input-error" : ""
                  }`}
                  value={formData.passportID}
                  onChange={(e) => handleChange("passportID", e.target.value)}
                  placeholder="Enter passport ID"
                  maxLength={29}
                />
                {errors.passportID && (
                  <span className="error-message">{errors.passportID}</span>
                )}
              </div>

              <div className="object-field">
                <label>Location</label>
                <div className="object-field-controls">
                  <select
                    className="glass-select"
                    value={formData.locationId || ""}
                    onChange={(e) =>
                      handleChange("locationId", e.target.value || null)
                    }
                  >
                    <option value="">-</option>
                    {locations?.map((location: Location) => (
                      <option key={location.id} value={location.id}>
                        {`${location.name === "" ? `nameless (id ${location.id})` : location.name}`}
                      </option>
                    ))}
                  </select>
                  <Link to="/locations/create">
                    <button type="button" className="outline-button">
                      Create new
                    </button>
                  </Link>
                </div>
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
                Create person
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
