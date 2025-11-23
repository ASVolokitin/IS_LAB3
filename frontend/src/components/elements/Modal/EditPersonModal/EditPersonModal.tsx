import { useCallback, useEffect, useMemo, useState } from "react";
import { useModalCloseEffect } from "../../../../hooks/useModalCloseEffect";
import { PersonModalProps } from "../../../../interfaces/editModalProps/PersonModalProps";
import { getLocations, updatePerson } from "../../../../services/api";
import { PersonForm } from "../../Form/PersonForm";
import { PersonDTO } from "../../../../interfaces/dto/PersonDTO";
import { Notification } from "../../Notification/Notification";

export const EditPersonModal = ({
  isOpen,
  onClose,
  personId,
  personData,
  onSave,
}: PersonModalProps) => {

  const [isLoading, setIsLoading] = useState(true);
  const [locations, setLocations] = useState<{ id: number; name: string }[]>([]);
  const [serverStatus, setServerStatus] = useState<string | null>("");
  const [serverError, setServerError] = useState<string | null>("");

  useModalCloseEffect(isOpen, onClose);

  useEffect(() => {
    if (isOpen) {
      loadExistingObjects();
    }
  }, [isOpen]);

  const loadExistingObjects = async () => {
    getLocations()
      .then((res) => { setLocations(res.data); setIsLoading(false) })
      .catch((err) => { setServerError(err.response.data.message);; setIsLoading(false) });
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = (dto: PersonDTO) => {
    updatePerson(personId, dto)
      .then(() => onClose())
      .catch((err) => setServerError(err.response.data.message));
  };

  if (!isOpen) return null;


  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h3>Edit person</h3>
          <button className="modal-close" onClick={() => onClose()} aria-label="Close">
            ×
          </button>
        </div>
        {isLoading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            Loading data...
          </div>
        ) : (
          <PersonForm onSubmit={handleSubmit} initialValues={personData} locationList={locations} onCancel={() => onClose()} />

        )}
      </div>
      {serverStatus && (
        <Notification
          message={serverStatus}
          type="success"
          isVisible={true}
          onClose={() => setServerStatus(null)}
        />
      )}
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
