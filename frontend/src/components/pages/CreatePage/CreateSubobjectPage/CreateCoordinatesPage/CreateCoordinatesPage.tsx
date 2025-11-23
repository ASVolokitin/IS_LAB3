import { Profiler, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../../../elements/NavBar/NavBar";

import "../../CreateSubobjectPage/CreateSubobjectPage.css"
import "../../../../elements/Input/Input.css";
import { CoordinatesDTO } from "../../../../../interfaces/dto/CoordinatesDTO";
import { createCoordinates } from "../../../../../services/api";
import { CoordinatesForm } from '../../../../elements/Form/CoordinatesForm';
import { Notification } from "../../../../elements/Notification/Notification";
import { onRenderCallback } from "../../../../../services/profiler";



export const CreateCoordinatesPage = () => {
  const navigate = useNavigate();

  const [serverError, setServerError] = useState<string | null>("");
  const [serverStatus, setServerStatus] = useState<string | null>("");

  const handleSubmit = (dto: CoordinatesDTO) => {
    createCoordinates(dto)
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
          <h1>Create new coordinates</h1>
          <Profiler id="CoordinatesFormProfiler" onRender={onRenderCallback}>
            <CoordinatesForm onSubmit={handleSubmit} onCancel={() => navigate(-1)} />

          </Profiler>
          <p>{serverStatus}</p>

        </div >
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
      </div >
    </>
  );
};
