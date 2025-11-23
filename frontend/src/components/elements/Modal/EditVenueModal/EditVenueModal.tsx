import React, { useState } from "react";
import { VenueModalProps } from "../../../../interfaces/editModalProps/VenueModalProps";
import { useModalCloseEffect } from "../../../../hooks/useModalCloseEffect";
import { Notification } from "../../Notification/Notification";
import { VenueForm } from "../../Form/VenueForm";
import { VenueDTO } from "../../../../interfaces/dto/VenueDTO";
import { updateVenue } from "../../../../services/api";

export const EditVenueModal = ({
  isOpen,
  onClose,
  venueId,
  venueData,
  onSave,
}: VenueModalProps) => {

  const [serverError, setServerError] = useState<string | null>("");


  useModalCloseEffect(isOpen, onClose);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = (dto: VenueDTO) => {
    updateVenue(venueId, dto)
      .then(() => onClose())
      .catch((err) => setServerError(err.response.data.message));
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

        <VenueForm onSubmit={handleSubmit} initialValues={venueData} onCancel={() => onClose()} />

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
