import React, { Profiler, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { VENUE_TYPES } from "../../../../../types/VenueType";
import { createVenue } from "../../../../../services/api";
import { VenueFormData } from "../../../../../interfaces/formData/VenueFormData";
import { validateVenueField } from "../../../../../services/validator/venueValidator";
import NavBar from "../../../../elements/NavBar/NavBar";
import { VenueForm } from "../../../../elements/Form/VenueForm";
import { TicketEventDTO } from "../../../../../interfaces/dto/TicketEventDTO";
import { VenueDTO } from "../../../../../interfaces/dto/VenueDTO";
import { Notification } from "../../../../elements/Notification/Notification";
import { devLog } from "../../../../../services/logger";
import { onRenderCallback } from "../../../../../services/profiler";

export const CreateVenuePage = () => {

  const navigate = useNavigate();

  const [serverError, setServerError] = useState<string | null>("");
  const [serverStatus, setServerStatus] = useState<string | null>("");

  const handleSubmit = (dto: VenueDTO) => {
    createVenue(dto)
      .then(() => { setServerStatus(`Successfully created venue`); navigate(-1); })
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
      <div className="create-object-page">
        <div className="form-container">
          <h1>Create new venue</h1>
          <Profiler id="VenueFormProfiler" onRender={onRenderCallback}>
            <VenueForm onSubmit={handleSubmit} onCancel={() => navigate(-1)} />
          </Profiler>

          <p>{serverStatus}</p>
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
