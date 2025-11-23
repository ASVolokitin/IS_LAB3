import { Profiler, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../../../elements/NavBar/NavBar";

import "../../CreateSubobjectPage/CreateSubobjectPage.css"
import "../../../../elements/Modal/Dialog.css"
import "../../../../elements/Input/Input.css";
import "../../../../elements/Select/Select.css";
import { PersonDTO } from "../../../../../interfaces/dto/PersonDTO";
import { createPerson, getLocations } from "../../../../../services/api";
import { PersonForm } from "../../../../elements/Form/PersonForm";
import { devLog } from "../../../../../services/logger";
import { Notification } from "../../../../elements/Notification/Notification";
import { onRenderCallback } from "../../../../../services/profiler";

export const CreatePersonPage = () => {

  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [locations, setLocations] = useState<{ id: number; name: string }[]>([]);
  const [serverError, setServerError] = useState<string | null>("");
  const [serverStatus, setServerStatus] = useState<string | null>("");

  useEffect(() => {
    loadExistingObjects();
  }, []);

  const loadExistingObjects = async () => {
    getLocations()
      .then((res) => { setLocations(res.data); setIsLoading(false); })
      .catch((err) => { setServerError(err.response.data.message); setIsLoading(false); });
  };

  const handleSubmit = (dto: PersonDTO) => {
    createPerson(dto)
      .then(() => { setServerStatus(`Successfully created person`); navigate(-1); })
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
          <h1>Create new person</h1>
          {isLoading ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              Loading data...
            </div>
          ) : (
            <Profiler id="CoordinatesFormProfiler" onRender={onRenderCallback}>
              <PersonForm onSubmit={handleSubmit} locationList={locations} onCancel={() => navigate(-1)} />
            </Profiler>

          )}
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
