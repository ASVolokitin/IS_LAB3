import { useState } from "react";
import { useLocationForm } from "../../../../hooks/useLocationForm";
import { useModalCloseEffect } from "../../../../hooks/useModalCloseEffect";
import { LocationModalProps } from "../../../../interfaces/editModalProps/LocationModalProps";
import { LocationForm } from "../../Form/LocationForm";
import { Notification } from "../../Notification/Notification";
import { LocationDTO } from "../../../../interfaces/dto/LocationDTO";
import { updateLocation } from "../../../../services/api";


export const EditLocationModal = (
  { isOpen,
    onClose,
    locationId,
    locationData,
    onSave }: LocationModalProps
) => {

  const [serverError, setServerError] = useState<string | null>("");

  useModalCloseEffect(isOpen, onClose);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = (dto: LocationDTO) => {
      updateLocation(locationId, dto)
        .then(() => onClose())
        .catch((err) => setServerError(err.response.data.message));
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
        <LocationForm onSubmit={handleSubmit} initialValues={locationData} onCancel={() => onClose()} />
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
