import React from "react";
import "../Dialog.css";
import { useEventForm } from "../../../../hooks/useEventForm";
import { EventModalProps } from "../../../../interfaces/editModalProps/EventModalProps";
import { useModalCloseEffect } from "../../../../hooks/useModalCloseEffect";

export const EditEventModal = (
  {isOpen,
  onClose,
  eventData,
  onSave}: EventModalProps
) => {
  const {
    formData,
    errors,
    handleChange,
    validateForm,
    getSubmitData,
    isFormValid,
  } = useEventForm(eventData);

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
      console.error("Error saving event:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h3>Edit event</h3>
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
              <label htmlFor="edit-event-name">Event name *</label>
              <input
                id="edit-event-name"
                type="text"
                className={`glass-input ${errors.name ? "input-error" : ""}`}
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter event name"
              />
              {errors.name && (
                <span className="error-message">{errors.name}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="edit-event-description">Description</label>
              <textarea
                id="edit-event-description"
                className="glass-input"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Enter event description"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-event-minAge">Minimum age</label>
              <input
                id="edit-event-minAge"
                type="number"
                step="1"
                min="0"
                className={`glass-input ${errors.minAge ? "input-error" : ""}`}
                value={formData.minAge}
                onChange={(e) => handleChange("minAge", e.target.value)}
                placeholder="Enter minimum age"
              />
              {errors.minAge && (
                <span className="error-message">{errors.minAge}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="edit-event-date">Event date</label>
              <input
                id="edit-event-date"
                type="datetime-local"
                className={`glass-input ${errors.date ? "input-error" : ""}`}
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
              />
              {errors.date && (
                <span className="error-message">{errors.date}</span>
              )}
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
