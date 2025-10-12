import { useLocationForm } from "../../../../hooks/useLocationForm";
import { useModalCloseEffect } from "../../../../hooks/useModalCloseEffect";
import { LocationModalProps } from "../../../../interfaces/editModalProps/LocationModalProps";


export const EditLocationModal = (
  {isOpen,
  onClose,
  locationId,
  locationData,
  onSave}: LocationModalProps
) => {
  const {
    formData,
    errors,
    handleChange,
    validateForm,
    getSubmitData,
    isFormValid,
  } = useLocationForm(locationData);

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
              <h3>Edit location</h3>
              <button 
                className="modal-close"
                onClick={onClose}
                aria-label="Close"
              >
                ×
              </button>
            </div>
    
            <form onSubmit={handleSubmit} className="ticket-form">
          

            <div className="form-group">
              <label htmlFor="edit-location-x">X coordinate</label>
              <input
                id="edit-location-x"
                type="number"
                className={`glass-input ${errors.x ? "input-error" : ""}`}
                value={formData.x}
                onChange={(e) => handleChange("x", e.target.value)}
                placeholder="Enter X coordinate"
              />
              {errors.x && (
                <span className="error-message">{errors.x}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="edit-location-y">Y coordinate</label>
              <input
                id="edit-location-y"
                type="number"
                step="1"
                className={`glass-input ${errors.y ? "input-error" : ""}`}
                value={formData.y}
                onChange={(e) => handleChange("y", e.target.value)}
                placeholder="Enter Y coordinate"
              />
              {errors.y && (
                <span className="error-message">{errors.y}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="edit-location-z">Z coordinate</label>
              <input
                id="edit-location-z"
                type="number"
                className={`glass-input ${errors.z ? "input-error" : ""}`}
                value={formData.z}
                onChange={(e) => handleChange("z", e.target.value)}
                placeholder="Enter Z coordinate"
              />
              {errors.z && (
                <span className="error-message">{errors.z}</span>
              )}
            </div>


            <div className="form-section">
            <div className="form-group">
              <label htmlFor="edit-event-name">Location name</label>
              <input
                id="edit-event-name"
                type="text"
                className={`glass-input ${errors.name ? "input-error" : ""}`}
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter location name"
              />
              {errors.name && (
                <span className="error-message">{errors.name}</span>
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
