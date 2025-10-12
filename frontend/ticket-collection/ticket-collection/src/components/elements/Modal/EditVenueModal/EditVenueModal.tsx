import React from "react";
import { useVenueForm } from "../../../../hooks/useVenueForm";
import { VENUE_TYPES } from "../../../../types/VenueType";
import { VenueModalProps } from "../../../../interfaces/editModalProps/VenueModalProps";
import { useModalCloseEffect } from "../../../../hooks/useModalCloseEffect";

export const EditVenueModal = ({
  isOpen,
  onClose,
  venueId,
  venueData,
  onSave,
}: VenueModalProps) => {
  const {
    formData,
    errors,
    handleChange,
    validateForm,
    getSubmitData,
    isFormValid,
  } = useVenueForm(venueData);

  useModalCloseEffect(isOpen, onClose);

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
      console.error("Error saving venue:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h3>Edit venue</h3>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="ticket-form">
          <div className="form-section">
            <div className="form-group">
              <label htmlFor="edit-name">Name *</label>
              <input
                id="edit-name"
                type="text"
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
              <label htmlFor="edit-capacity">Capacity *</label>
              <input
                id="edit-capacity"
                type="number"
                step="1"
                className={`glass-input ${
                  errors.capacity ? "input-error" : ""
                }`}
                value={formData.capacity}
                onChange={(e) => handleChange("capacity", e.target.value)}
                placeholder="Enter capacity"
                min="1"
              />
              {errors.capacity && (
                <span className="error-message">{errors.capacity}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="edit-type">Venue type</label>
              <select
                id="edit-type"
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
