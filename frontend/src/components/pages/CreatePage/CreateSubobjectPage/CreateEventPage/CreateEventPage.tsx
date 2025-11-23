import { Profiler, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../../../elements/NavBar/NavBar";

import "../../CreateSubobjectPage/CreateSubobjectPage.css";
import "../../../../elements/Input/Input.css";
import { createEvent } from "../../../../../services/api";
import { EventForm } from "../../../../elements/Form/EventForm";
import { TicketEventDTO } from "../../../../../interfaces/dto/TicketEventDTO";
import { Notification } from "../../../../elements/Notification/Notification";
import { onRenderCallback } from "../../../../../services/profiler";

export const CreateEventPage = () => {

  const navigate = useNavigate();

  const [serverError, setServerError] = useState<string | null>("");
  const [serverStatus, setServerStatus] = useState<string | null>("");

  const handleSubmit = (dto: TicketEventDTO) => {
    createEvent(dto)
      .then(() => { setServerStatus(`Successfully created coordinates`); navigate(-1); })
      .catch((err) => {
        if (err.response) {
          setServerError(
            `ERROR: ${err.response.data.message}` || "Server error"
          );
        }
        else if (err.request) setServerStatus("No response from server");
        else setServerStatus("Unable to send request");
      });

  }

  return (
    <>
      <NavBar />
      <div className="create-object-page">
        <div className="form-container">
          <h1>Create new event</h1>
          <Profiler id="LocationFormProfiler" onRender={onRenderCallback}>
            <EventForm onSubmit={handleSubmit} onCancel={() => navigate(-1)} />
          </Profiler>
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
