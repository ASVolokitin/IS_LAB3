import { useEffect, useState } from "react";
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
  updateTicket,
} from "../../../../services/api";

import { Notification } from "../../Notification/Notification";
import { TicketForm } from "../../Form/TicketForm";
import { TicketDTO } from "../../../../interfaces/dto/TicketDTO";

export const EditTicketModal = ({
  isOpen,
  onClose,
  ticketId,
  ticketData,
  onSave
}: TicketModalProps) => {

  const [isLoading, setIsLoading] = useState(true);
  const [coordinates, setCoordinates] = useState<{ id: number; name: string }[]>([]);
  const [persons, setPersons] = useState<{ id: number; name: string }[]>([]);
  const [events, setEvents] = useState<{ id: number; name: string }[]>([]);
  const [venues, setVenues] = useState<{ id: number; name: string }[]>([]);

  const [serverError, setServerError] = useState<string | null>("");
  const [serverStatus, setServerStatus] = useState<string | null>("");

  useModalCloseEffect(isOpen, onClose);

  useEffect(() => {
    loadExistingObjects();
  }, [isOpen]);

  const loadExistingObjects = async () => {

    getCoordinates()
      .then((res) => {
        const list = res.data.map((c: Coordinates) => ({
          id: c.id,
          name: `(${c.x}; ${c.y})`,
        }));
        setCoordinates(list);
      })

      .catch((err) => setServerError(err.message));

    getPersons()
      .then((res) => {
        const list = res.data.map((c: Person) => ({
          id: c.id,
          name: c.passportID,
        }));
        setPersons(list);
      })
      .catch((err) => setServerError(err.message));

    getEvents()
      .then((res) => {
        const list = res.data.map((c: TicketEvent) => ({
          id: c.id,
          name: c.name,
        }));
        setEvents(list);
      })
      .catch((err) => setServerError(err.message));

    getVenues()
      .then((res) => {
        const list = res.data.map((c: Venue) => ({
          id: c.id,
          name: c.name,
        }));
        setVenues(list);
        setIsLoading(false);
      })
      .catch((err) => {setServerError(err.message); setIsLoading(false);});


  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = (dto: TicketDTO) => {
      updateTicket(ticketId, dto)
            .then(() => onClose())
            .catch((err) => setServerError(err.response.data.message));
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
        {isLoading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            Loading data... 
        </div>
    ) : (
        <TicketForm 
            onSubmit={handleSubmit} 
            initialValues={ticketData} 
            coordinatesList={coordinates} 
            personList={persons} 
            eventList={events} 
            venueList={venues} 
            onCancel={() => onClose()} 
        />
    )}
        
      </div>
      {serverError && (
        <Notification
          message={serverError}
          type="error"
          isVisible={true}
          onClose={() => setServerError(null)}
        />
      )}
      {serverStatus && (
        <Notification
          message={serverStatus}
          type="success"
          isVisible={true}
          onClose={() => setServerStatus(null)}
        />
      )}
    </div>
  );
};
