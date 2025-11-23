import { useState } from "react";
import { useCoordinatesForm } from "../../../../hooks/useCoordinatesForm";
import { useModalCloseEffect } from "../../../../hooks/useModalCloseEffect";
import { CoordinatesDTO } from "../../../../interfaces/dto/CoordinatesDTO";
import { CoordinatesModalProps } from "../../../../interfaces/editModalProps/CoordinatesModalProps";
import { updateCoordinates } from "../../../../services/api";
import { CoordinatesForm } from "../../Form/CoordinatesForm";
import { Notification } from "../../Notification/Notification";

export const EditCoordinatesModal = (
  { isOpen,
    onClose,
    coordinatesData,
    coordinatesId,
    onSave }: CoordinatesModalProps
) => {

  useModalCloseEffect(isOpen, onClose);
  const [serverError, setServerError] = useState<string | null>("");

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = (dto: CoordinatesDTO) => {
    updateCoordinates(coordinatesId, dto)
      .then(() => onClose())
      .catch((err) => setServerError(err.response.data.message));
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
        <CoordinatesForm onSubmit={handleSubmit} initialValues={coordinatesData} onCancel={() => onClose()} />

      </div>
      {serverError && (
        <Notification
          message={serverError}
          type="error"
          isVisible={true}
          onClose={() => setServerError(null)}
        />
      )}
    </div>
  );
};
