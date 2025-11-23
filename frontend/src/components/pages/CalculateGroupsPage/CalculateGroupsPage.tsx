import { useEffect, useState } from "react";
import "../../../sharedStyles/Table.css";
import NavBar from "../../elements/NavBar/NavBar";
import { getTicketsGroupedByCoordinates } from "../../../services/api";
import { useNavigate } from "react-router-dom";
import { Notification } from "../../elements/Notification/Notification";

interface TicketGroup {
  ticketCount: number;
  coordinatesId: number;
}

export const CalculateGroupsPage = () => {
  const [groups, setGroups] = useState<TicketGroup[]>();
  const [error, setError] = useState<string | null>();
  const navigate = useNavigate();

  useEffect(() => {
    getTicketsGroupedByCoordinates()
      .then((res) => setGroups(res.data))
      .catch((err) => setError(err.message || "An error occurred"));
  });

  return (
    <>
      <NavBar />
      <div>
        <table>
          <thead>
            <tr>
              <th>coordinates ID</th>
              <th>ticket count</th>
            </tr>
          </thead>
          <tbody>
            {groups?.map((row, index) => (
              <tr key={index}>
                <td>{row.coordinatesId}</td>
                <td>{row.ticketCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="button-centered-container">
          <button className="glass-button" onClick={() => navigate(-1)}>
          Back
        </button>
        </div>
        
      </div>

      {error && (
        <Notification
          message={error}
          type="error"
          isVisible={true}
          onClose={() => setError(null)}
        />
      )}
    </>
  );
};
