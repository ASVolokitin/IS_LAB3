import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateTicketPage.css";
import '../../../elements/Select/Select.css'
import NavBar from "../../../elements/NavBar/NavBar";
import { createTicket, getCoordinates, getEvents, getPersons, getVenues } from "../../../../services/api";
import { TicketDTO } from "../../../../interfaces/dto/TicketDTO";

import '../../../elements/Input/Input.css'
import { Notification } from "../../../elements/Notification/Notification";
import { TicketForm } from "../../../elements/Form/TicketForm";
import { devLog } from "../../../../services/logger";
import { Person } from "../../../../interfaces/Person";
import { Coordinates } from "../../../../interfaces/Сoordinates";
import { TicketEvent } from "../../../../interfaces/TicketEvent";
import { Venue } from "../../../../interfaces/Venue";


export const CreateTicketPage = () => {

  const [isLoading, setIsLoading] = useState(true);
  const [coordinates, setCoordinates] = useState<{ id: number; name: string }[]>([]);
  const [persons, setPersons] = useState<{ id: number; name: string }[]>([]);
  const [events, setEvents] = useState<{ id: number; name: string }[]>([]);
  const [venues, setVenues] = useState<{ id: number; name: string }[]>([]);

  const [serverError, setServerError] = useState<string | null>("");
  const [serverStatus, setServerStatus] = useState<string | null>("");

  const navigate = useNavigate();

  useEffect(() => {
    loadExistingObjects();
  }, []);

  const loadExistingObjects = async () => {

    getCoordinates()
      .then((res) => {
        const list = res.data.map((c: Coordinates) => ({
          id: c.id,
          name: `(${c.x}; ${c.y})`,
        }));
        setCoordinates(list);
      })

      .catch((err) => setServerStatus(err.message));

    getPersons()
      .then((res) => {
        const list = res.data.map((c: Person) => ({
          id: c.id,
          name: c.passportID,
        }));
        setPersons(list);
      })
      .catch((err) => setServerStatus(err.message));

    getEvents()
      .then((res) => {
        const list = res.data.map((c: TicketEvent) => ({
          id: c.id,
          name: c.name,
        }));
        setEvents(list);
      })
      .catch((err) => setServerStatus(err.message));

    getVenues()
      .then((res) => {
        const list = res.data.map((c: Venue) => ({
          id: c.id,
          name: c.name,
        }));
        setVenues(list);
        setIsLoading(false);
      })
      .catch((err) => { setServerStatus(err.message); setIsLoading(false); });


  };

  const formKeys: (keyof TicketDTO)[] = [
    "name",
    "coordinatesId",
    "personId",
    "eventId",
    "price",
    "type",
    "discount",
    "number",
    "refundable",
    "venueId",
  ];

  const handleSubmit = (dto: TicketDTO) => {
    createTicket(dto)
      .then((res) => { setServerStatus(res.data.message); })
      .catch((err) => {
        if (err.response) {
          setServerError(err.response.data.message)
        }
        else if (err.request) setServerStatus("No response from server");
        else setServerStatus("Unable to send request");
      });
  }

  return (
    <>
      <NavBar />
      <div className="form-page">
        <div className="full-form-container">
          <h1>Create new ticket</h1>

          {isLoading ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              Loading data...
            </div>
          ) : (
            <TicketForm
              onSubmit={handleSubmit}
              coordinatesList={coordinates}
              personList={persons}
              eventList={events}
              venueList={venues}
              onCancel={() => navigate(-1)}
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
    </>
  );
};
