import React, { Profiler, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../../../elements/NavBar/NavBar";

import "../CreateSubobjectPage.css";
import "../../../../elements/Input/Input.css";
import { createLocation } from "../../../../../services/api";
import { LocationDTO } from "../../../../../interfaces/dto/LocationDTO";
import { Notification } from "../../../../elements/Notification/Notification";
import { LocationForm } from "../../../../elements/Form/LocationForm";
import { onRenderCallback } from "../../../../../services/profiler";

export const CreateLocationPage = () => {

  const navigate = useNavigate();

  const [serverError, setServerError] = useState<string | null>("");
  const [serverStatus, setServerStatus] = useState<string | null>("");

  const handleSubmit = (dto: LocationDTO) => {
    createLocation(dto)
      .then(() => { setServerStatus(`Successfully created coordinates`); navigate(-1); })
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
          <h1>Create new location</h1>
          <Profiler id="LocationFormProfiler" onRender={onRenderCallback}>
            <LocationForm onSubmit={handleSubmit} onCancel={() => navigate(-1)} />
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
