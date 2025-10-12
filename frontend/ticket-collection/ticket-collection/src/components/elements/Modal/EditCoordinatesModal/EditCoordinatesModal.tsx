import { useCoordinatesForm } from "../../../../hooks/useCoordinatesForm";
import { useModalCloseEffect } from "../../../../hooks/useModalCloseEffect";
import { CoordinatesModalProps } from "../../../../interfaces/editModalProps/CoordinatesModalProps";

export const EditCoordinatesModal = (
  {isOpen,
  onClose,
  coordinatesData,
  coordinatesId,
  onSave}: CoordinatesModalProps
) => {
  const {
    formData,
    errors,
    handleChange,
    validateForm,
    getSubmitData,
    isFormValid,
  } = useCoordinatesForm(coordinatesData);

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
      console.error("Error saving coordinates:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h3>Edit coordinates</h3>
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
              <label htmlFor="edit-coordinate-x">X coordinate *</label>
              <input
                id="edit-coordinate-x"
                type="number"
                step="1"
                min="-201"
                className={`glass-input ${errors.x ? "input-error" : ""}`}
                value={formData.x}
                onChange={(e) => handleChange("x", e.target.value)}
                placeholder="Integer"
              />
              {errors.x && (
                <span className="error-message">{errors.x}</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="edit-coordinate-y">Y coordinate *</label>
              <input
                id="edit-coordinate-y"
                type="number"
                min="-5"
                step="0.00000001"
                className={`glass-input ${errors.y ? "input-error" : ""}`}
                value={formData.y}
                onChange={(e) => handleChange("y", e.target.value)}
                placeholder="Number"
              />
              {errors.y && (
                <span className="error-message">{errors.y}</span>
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
