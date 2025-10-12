import { useNavigate } from "react-router-dom";
import NavBar from "../../elements/NavBar/NavBar";

import "../../../sharedStyles/CenteredForm.css";
import { useSellTicketForm } from "../../../hooks/useSellTicketForm";
import { getAllTickets, getPersons, sellTicketToPerson } from "../../../services/api";
import { useEffect, useState } from "react";
import { Notification } from "../../elements/Notification/Notification";
import { Ticket } from "../../../interfaces/Ticket";
import { Person } from "../../../interfaces/Person";

export const SellTicketPage = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>("");
  const [serverStatus, setServerStatus] = useState<string | null>("");
  const [tickets, setTickets] = useState<Ticket[]>();
  const [buyers, setBuyers] = useState<Person[]>();

  const {
    formData,
    errors,
    handleChange,
    validateForm,
    getSubmitData,
    isFormValid,
  } = useSellTicketForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    sellTicketToPerson(getSubmitData())
      .then((res) => setServerStatus("Ticket sold successfully"))
      .catch((err) => setServerError(err.response.data.message));
  };

  useEffect(() => {
    getAllTickets()
    .then((res) => setTickets(res.data))
    .catch((err) => setServerError(err.response.data.message))

    getPersons()
    .then((res) => setBuyers(res.data))
    .catch((err) => setServerError(err.response.data.message))
  }, [])

  return (
    <>
      <NavBar />
      <div className="centered-form-container">
        <div className="centered-form">
          <div className=".form-header">
            <h2 className="form-header"> Sell ticket</h2>
          </div>
          <div className="form-content">
            <form onSubmit={handleSubmit} className="ticket-form">
              <div className="form-section">

                <div className="object-field">
                  <label>Ticket ID *</label>
                  <div className="object-field-controls">
                    <select
                      className={`glass-select ${
                        errors.ticketId ? "input-error" : ""
                      }`}
                      value={formData.ticketId || ""}
                      onChange={(e) =>
                        handleChange("ticketId", e.target.value)
                      }
                    >
                      <option value="">-</option>
                      {tickets?.map((tickets: Ticket) => (
                        <option key={tickets.id} value={tickets.id}>
                          {tickets.id}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.ticketId && (
                    <span className="error-message">
                      {errors.ticketId}
                    </span>
                  )}
                </div>

                <div className="object-field">
                  <label>Buyer passport *</label>
                  <div className="object-field-controls">
                    <select
                      className={`glass-select ${
                        errors.buyerId ? "input-error" : ""
                      }`}
                      value={formData.buyerId || ""}
                      onChange={(e) =>
                        handleChange("buyerId", e.target.value)
                      }
                    >
                      <option value="">-</option>
                      {buyers?.map((buyers: Person) => (
                        <option key={buyers.id} value={buyers.id}>
                          {buyers.passportID}
                        </option>
                      ))}

                    </select>
                  </div>
                  {errors.buyerId && (
                    <span className="error-message">
                      {errors.buyerId}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="sell-ticket-price">Price *</label>
                  <input
                    id="sell-ticket-price"
                    type="number"
                    min={0}
                    step={1}
                    className={`glass-input ${
                      errors.ticketId ? "input-error" : ""
                    }`}
                    onChange={(e) => handleChange("price", e.target.value)}
                    placeholder="Enter price"
                  />
                  {errors.price && (
                    <span className="error-message">{errors.price}</span>
                  )}
                </div>

        
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="outline-button"
                  onClick={() => navigate(-1)}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={isFormValid}
                >
                  Sell
                </button>
              </div>
            </form>
          </div>
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
