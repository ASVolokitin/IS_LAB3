import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./CreateTicketPage.css";
import "../../CreatePage/CreatePage.css"
import '../../../elements/Select/Select.css'
import NavBar from "../../../elements/NavBar/NavBar";
import { createTicket, getCoordinates, getEvents, getPersons, getVenues } from "../../../../services/api";
import { Coordinates } from "../../../../interfaces/Сoordinates";
import { Person } from "../../../../interfaces/Person";
import { Venue } from "../../../../interfaces/Venue";
import { TicketEvent } from "../../../../interfaces/TicketEvent";
import { TicketDTO } from "../../../../interfaces/dto/TicketDTO";

import '../../../elements/Input/Input.css'
import { TICKET_TYPES } from "../../../../types/TicketType";


export const CreateTicketPage = () => {

  const [coordinates, setCoordinates] = useState<Coordinates[]>();
  const [persons, setPersons] = useState<Person[]>();
  const [events, setEvents] = useState<TicketEvent[]>();
  const [venues, setVenues] = useState<Venue[]>();


  const [serverStatus, setServerStatus] = useState<string | null>(null);


  const [formData, setFormData] = useState<TicketDTO>({
    name: "",
    coordinatesId: null,
    personId: null,
    eventId: null,
    price: "",
    type: undefined,
    discount: "",
    number: "",
    refundable: "true",
    venueId: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadExistingObjects();
  }, []);

  const loadExistingObjects = async () => {

    getCoordinates()
      .then((res) => setCoordinates(res.data))
      .catch((err) => setServerStatus(err));

    getPersons()
      .then((res) => setPersons(res.data))
      .catch((err) => setServerStatus(err));

    getEvents()
      .then((res) => setEvents(res.data))
      .catch((err) => setServerStatus(err));

    getVenues()
      .then((res) => setVenues(res.data))
      .catch((err) => setServerStatus(err));


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

  const validateField = (name: keyof TicketDTO, value: any): string => {
    switch (name) {
      case "name":
        if (!value || value.trim() === "") return "Name should not be blank";
        return "";

      case "price":
        if (!value || Number(value) <= 0)
          return "Price should be greater than 0";
         if (!Number.isInteger(Number(value))) return 'Price should be an integer';
        return "";

      case "discount":
        if (value && (Number(value) <= 0 || Number(value) > 100))
          return "Discount should be between 0 and 100";
        return "";

      case "number":
        if (!value || Number(value) <= 0)
          return "Number should be greater than 0";
        return "";

      case "coordinatesId":
        if (!value) return "You need to set coordinates";
        return "";

      case "venueId":
        if (!value) return "You need to set venue";
        return "";

      default:
        return "";
    }
  };

  const handleChange = (field: keyof TicketDTO, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    formKeys.forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    console.log("Submit data:", formData);
    
    createTicket(formData)
      .then(() => setServerStatus(`Successfully created ticket ${formData.name}`))
      .catch((err) => {
        if (err.response) setServerStatus(`ERROR: ${err.response.data.message}` || "Server error");
        else if (err.request) setServerStatus("No response from server");
        else setServerStatus("Unable to send request");
      });
  };

  const isFormValid = () => {
    const requiredFields: (keyof TicketDTO)[] = [
      "name",
      "coordinatesId",
      "price",
      "number",
      "refundable",
      "venueId",
    ];

    return (
      requiredFields.some((field) => {
        const value = formData[field];
        return value === null || value === "" || value === undefined;
      }) || Object.values(errors).some((error) => error !== "")
    );
  };

  return (
    <>
      <NavBar />
      <div className="form-page">
        <div className="full-form-container">
          <h1>Create new ticket</h1>

          <form onSubmit={handleSubmit} className="ticket-form">
            <div className="form-section">
              <h2>General information</h2>

              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  id="name"
                  type="text"
                  maxLength={255}
                  className={`glass-select ${errors.name ? "input-error" : ""}`}
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Enter ticket name"
                />
                {errors.name && (
                  <span className="error-message">{errors.name}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="price">Price *</label>
                <input
                  id="price"
                  type="number"
                  step="1"
                  className={`glass-select ${errors.price ? "input-error" : ""}`}
                  value={formData.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                  placeholder="Enter ticket price"
                />
                {errors.price && (
                  <span className="error-message">{errors.price}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="number">Number *</label>
                <input
                  id="number"
                  type="number"
                  step="0.01"
                  className={`glass-select ${
                    errors.number ? "input-error" : ""
                  }`}
                  value={formData.number}
                  onChange={(e) => handleChange("number", e.target.value)}
                  placeholder="Enter a number"
                />
                {errors.number && (
                  <span className="error-message">{errors.number}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="discount">Discount</label>
                <input
                  id="discount"
                  type="number"
                  step="0.1"
                  max="100"
                  className={`glass-select ${
                    errors.discount ? "input-error" : ""
                  }`}
                  value={formData.discount}
                  onChange={(e) => handleChange("discount", e.target.value)}
                  placeholder="Enter discount (0-100)"
                />
                {errors.discount && (
                  <span className="error-message">{errors.discount}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="refundable">Refundable *</label>
                <select
                  id="refundable"
                  className="glass-select"
                  value={formData.refundable}
                  onChange={(e) => handleChange("refundable", e.target.value)}
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="type">Ticket type</label>
                <select
                  id="type"
                  className="glass-select"
                  value={formData.type}
                  onChange={(e) => handleChange("type", e.target.value)}
                >
                  {Object.entries(TICKET_TYPES).map(([key, value]) => (
                    <option key={key} value={value}>{key}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-section">
              <h2>Connected objects</h2>

              <div className="object-field">
                <label>Coordinates *</label>
                <div className="object-field-controls">
                  <select
                    className={`glass-select ${
                      errors.coordinates ? "input-error" : ""
                    }`}
                    value={formData.coordinatesId || ""}
                    onChange={(e) =>
                      handleChange("coordinatesId", e.target.value)
                    }
                  >
                    <option value="">-</option>
                    {coordinates?.map((coordinates: Coordinates) => (
                      <option key={coordinates.id} value={coordinates.id}>
                        {`(${coordinates.x}; ${coordinates.y})`}
                      </option>
                    ))}
                  </select>
                  <Link to="/coordinates/create">
                    <button type="button" className="outline-button">
                      Create new
                    </button>
                  </Link>
                </div>
                {errors.coordinates && (
                  <span className="error-message">{errors.coordinates}</span>
                )}
              </div>

              <div className="object-field">
                <label>Person (passport ID)</label>
                <div className="object-field-controls">
                  <select
                    className="glass-select"
                    value={formData.personId || ""}
                    onChange={(e) => handleChange("personId", e.target.value)}
                  >
                    <option value="">-</option>
                    {persons?.map((person: Person) => (
                      <option key={person.id} value={person.id}>
                        {person.passportID}
                      </option>
                    ))}
                  </select>
                  <Link to="/persons/create">
                    <button type="button" className="outline-button">
                      Create new
                    </button>
                  </Link>
                </div>
              </div>

              <div className="object-field">
                <label>Event</label>
                <div className="object-field-controls">
                  <select
                    className="glass-select"
                    value={formData.eventId || ""}
                    onChange={(e) => handleChange("eventId", e.target.value)}
                  >
                    <option value="">-</option>
                    {events?.map((ticketEvent: TicketEvent) => (
                      <option key={ticketEvent.id} value={ticketEvent.id}>
                        {`${ticketEvent.name}`}
                      </option>
                    ))}
                  </select>
                  <Link to="/events/create">
                    <button type="button" className="outline-button">
                      Create new
                    </button>
                  </Link>
                </div>
              </div>

              <div className="object-field">
                <label>Choose venue *</label>
                <div className="object-field-controls">
                  <select
                    className={`glass-select ${
                      errors.venue ? "input-error" : ""
                    }`}
                    value={formData.venueId || ""}
                    onChange={(e) => handleChange("venueId", e.target.value)}
                  >
                    <option value="">-</option>
                    {venues?.map((venue: Venue) => (
                      <option key={venue.id} value={venue.id}>
                        {`${venue.name}`}
                      </option>
                    ))}
                  </select>
                  <Link to="/venues/create">
                    <button type="button" className="outline-button">
                      Create new
                    </button>
                  </Link>
                </div>
                {errors.venue && (
                  <span className="error-message">{errors.venue}</span>
                )}
              </div>
            </div>
            <div className="server-status-container">
                <p>{serverStatus}</p>
            </div>
            <div className="form-actions">
              <Link to="/">
                <button
                  type="button"
                  className="outline-button"
                >
                  Cancel
                </button>
              </Link>

              <button
                type="submit"
                className="primary-button"
                disabled={isFormValid()}
              >
                Create ticket
              </button>
            
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
