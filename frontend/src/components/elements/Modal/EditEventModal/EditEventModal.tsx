import React, { useState } from "react";
import "../Dialog.css";
import { EventModalProps } from "../../../../interfaces/editModalProps/EventModalProps";
import { useModalCloseEffect } from "../../../../hooks/useModalCloseEffect";
import { EventForm } from "../../Form/EventForm";
import { updateEvent } from "../../../../services/api";
import { TicketEventDTO } from "../../../../interfaces/dto/TicketEventDTO";
import { Notification } from "../../Notification/Notification";

export const EditEventModal = (
  { isOpen,
    onClose,
    eventData,
    eventId,
    onSave }: EventModalProps
) => {


  useModalCloseEffect(isOpen, onClose);
  const [serverError, setServerError] = useState<string | null>("");


  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = (dto: TicketEventDTO) => {
    updateEvent(eventId, dto)
      .then(() => onClose())
      .catch((err) => setServerError(err.response.data.message));
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
        <EventForm onSubmit={handleSubmit} initialValues={eventData} onCancel={() => onClose()} />
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

