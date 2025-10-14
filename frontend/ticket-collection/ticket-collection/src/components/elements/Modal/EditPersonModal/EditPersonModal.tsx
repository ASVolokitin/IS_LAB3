import { useEffect, useState } from "react";
import { useModalCloseEffect } from "../../../../hooks/useModalCloseEffect";
import { usePersonForm } from "../../../../hooks/usePersonForm";
import { PersonModalProps } from "../../../../interfaces/editModalProps/PersonModalProps";
import { Color, COLORS } from "../../../../types/Color";
import { getLocations } from "../../../../services/api";
import { COUNTRIES } from "../../../../types/Country";
import { Location } from "../../../../interfaces/Location";

export const EditPersonModal = ({
  isOpen,
  onClose,
  personId,
  personData,
  onSave,
}: PersonModalProps) => {
  const {
    formData,
    errors,
    handleChange,
    validateForm,
    getSubmitData,
    isFormValid,
  } = usePersonForm(personData);

  const [locations, setLocations] = useState<Location[]>();
  const [serverStatus, setServerStatus] = useState("");

  useModalCloseEffect(isOpen, onClose);

  useEffect(() => {
    loadExistingObjects();
  }, []);

  const loadExistingObjects = async () => {
    getLocations()
      .then((res) => setLocations(res.data))
      .catch((err) => setServerStatus(err));
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await onSave(getSubmitData());
      onClose();
    } catch (error) {
      console.error("Error saving person:", error);
    }
  };

  if (!isOpen) return null;


  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h3>Edit person</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

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
                  errors.passportID ? "input-error" : ""
                }`}
                value={
                  formData.passportID === "" || formData.passportID === null
                    ? ""
                    : formData.passportID
                }
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
                      {`${
                        location.name === ""
                          ? `nameless (id ${location.id})`
                          : location.name
                      }`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="server-status-container">
              <p>{serverStatus}</p>
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="outline-button" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="primary-button"
              disabled={isFormValid}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
