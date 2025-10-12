import { useEffect, useState } from "react";
import { useTicketForm } from "../../../../hooks/useTicketForm";
import { TicketModalProps } from "../../../../interfaces/editModalProps/TicketModalProps";
import { useModalCloseEffect } from "../../../../hooks/useModalCloseEffect";
import { Coordinates } from "../../../../interfaces/Сoordinates";
import { Person } from "../../../../interfaces/Person";
import { TicketEvent } from "../../../../interfaces/TicketEvent";
import { Venue } from "../../../../interfaces/Venue";
import {
  getCoordinates,
  getEvents,
  getPersons,
  getVenues,
} from "../../../../services/api";
import { TICKET_TYPES } from "../../../../types/TicketType";

export const EditTicketModal = ({
  isOpen,
  onClose,
  ticketId,
  ticketData,
  onSave,
}: TicketModalProps) => {
  const {
    formData,
    errors,
    handleChange,
    validateForm,
    getSubmitData,
    isFormValid,
  } = useTicketForm(ticketData);

  const [coordinates, setCoordinates] = useState<Coordinates[]>();
  const [persons, setPersons] = useState<Person[]>();
  const [events, setEvents] = useState<TicketEvent[]>();
  const [venues, setVenues] = useState<Venue[]>();
  const [serverStatus, setServerStatus] = useState("");

  useModalCloseEffect(isOpen, onClose);

  useEffect(() => {
    console.log(formData);
    loadExistingObjects();
  }, []);

  const loadExistingObjects = async () => {
    getCoordinates()
      .then((res) => setCoordinates(res.data))
      .catch((err) => setServerStatus(err));

    getPersons()
      .then((res) => setPersons(res.data))
      .catch((err) => setServerStatus(err));

    getEvents()
      .then((res) => setEvents(res.data))
      .catch((err) => setServerStatus(err));

    getVenues()
      .then((res) => setVenues(res.data))
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
      console.error("Error saving ticket:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h3>Edit ticket</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        
        <form onSubmit={handleSubmit} className="ticket-form">
          <div className="form-section">
            <h2>General information</h2>

            <div className="form-group">
              <label htmlFor="name">Name *</label>
              <input
                id="name"
                type="text"
                maxLength={255}
                className={`glass-select ${errors.name ? "input-error" : ""}`}
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter ticket name"
              />
              {errors.name && (
                <span className="error-message">{errors.name}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="price">Price *</label>
              <input
                id="price"
                type="number"
                step="1"
                className={`glass-select ${errors.price ? "input-error" : ""}`}
                value={formData.price}
                onChange={(e) => handleChange("price", e.target.value)}
                placeholder="Enter ticket price"
              />
              {errors.price && (
                <span className="error-message">{errors.price}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="number">Number *</label>
              <input
                id="number"
                type="number"
                className={`glass-select ${errors.number ? "input-error" : ""}`}
                value={formData.number}
                onChange={(e) => handleChange("number", e.target.value)}
                placeholder="Enter a number"
              />
              {errors.number && (
                <span className="error-message">{errors.number}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="discount">Discount</label>
              <input
                id="discount"
                type="number"
                max="100"
                className={`glass-select ${
                  errors.discount ? "input-error" : ""
                }`}
                value={String(formData.discount)}
                onChange={(e) => handleChange("discount", e.target.value)}
                placeholder="Enter discount (0-100)"
              />
              {errors.discount && (
                <span className="error-message">{errors.discount}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="refundable">Refundable *</label>
              <select
                id="refundable"
                className="glass-select"
                value={formData.refundable ? String(formData.refundable) : "No"}
                onChange={(e) => handleChange("refundable", e.target.value)}
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="type">Ticket type</label>
              <select
                id="type"
                className="glass-select"
                value={formData.type ? formData.type : ""}
                onChange={(e) => handleChange("type", e.target.value)}
              >
                {Object.entries(TICKET_TYPES).map(([key, value]) => (
                  <option key={key} value={value ? value : "-"}>
                    {key !== "NOT_STATED" ? key : "-"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-section">
            <h2>Connected objects</h2>

            <div className="object-field">
              <label>Coordinates *</label>
              <div className="object-field-controls">
                <select
                  className={`glass-select ${
                    errors.coordinatesId ? "input-error" : ""
                  }`}
                  
                  value={formData.coordinatesId || ""}
                  onChange={(e) =>
                    handleChange("coordinatesId", e.target.value)
                  }
                >
                  <option value="">-</option>
                  {coordinates?.map((coordinates: Coordinates) => (
                    <option key={coordinates.id} value={coordinates.id}>
                      {`(${coordinates.x}; ${coordinates.y})`}
                    </option>
                  ))}
                </select>
              </div>
              {errors.coordinatesId && (
                <span className="error-message">{errors.coordinatesId}</span>
              )}
            </div>

            <div className="object-field">
              <label>Person (passport ID)</label>
              <div className="object-field-controls">
                <select
                  className="glass-select"
                  value={formData.personId || ""}
                  onChange={(e) => handleChange("personId", e.target.value)}
                >
                  <option value="">-</option>
                  {persons?.map((person: Person) => (
                    <option key={person.id} value={person.id}>
                      {person.passportID}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="object-field">
              <label>Event</label>
              <div className="object-field-controls">
                <select
                  className="glass-select"
                  value={formData.eventId || ""}
                  onChange={(e) => handleChange("eventId", e.target.value)}
                >
                  <option value="">-</option>
                  {events?.map((ticketEvent: TicketEvent) => (
                    <option key={ticketEvent.id} value={ticketEvent.id}>
                      {`${ticketEvent.name}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="object-field">
              <label>Venue *</label>
              <div className="object-field-controls">
                <select
                  className={`glass-select ${
                    errors.venueId ? "input-error" : ""
                  }`}
                  value={formData.venueId || ""}
                  onChange={(e) => handleChange("venueId", e.target.value)}
                >
                  <option value="">-</option>
                  {venues?.map((venue: Venue) => (
                    <option key={venue.id} value={venue.id}>
                      {`${venue.name}`}
                    </option>
                  ))}
                </select>
              </div>
              {errors.venueId && (
                <span className="error-message">{errors.venueId}</span>
              )}
            </div>
          </div>
          <div className="server-status-container">
            <p>{serverStatus}</p>
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
