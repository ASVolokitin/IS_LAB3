import { useEffect, useState } from "react";
import SpotlightCard from "../../elements/Card/SpotlightCard";
import "./SqlQueriesPage.css";
import '../../elements/Button/Button.css'
import {
  cancelBookingsByPersonId,
  getTicketsAmountByNumberEquals,
  getTicketsAmountByNumberLess,
  getTicketsGroupedByCoordinates,
} from "../../../services/api";
import { NavBar } from "../../elements/NavBar/NavBar";
import { Link } from "react-router-dom";

import '../../elements/Input/Input.css'

export const SqlQueriesPage = () => {

  const [countByNumberEqualsField, setCountByNumberEqualsField] =
    useState<number>(0);
  const [countByNumberEqualsResult, setCountByNumberEqualsResult] =
    useState<number>(0);

  const [countByNumberLessField, setCountByNumberLessField] =
    useState<number>(0);
  const [countByNumberLessResult, setCountByNumberLessResult] =
    useState<number>(0);

  const [cancelBookingPersonIdField, setCancelBookingPersonIdField] =
    useState<number>(0);
  const [cancelBookingPersonIdResult, setCancelBookingPersonIdResult] =
    useState<String>("");

  useEffect(() => {
    getTicketsGroupedByCoordinates()
      .then((res) => console.log(res.data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    getTicketsAmountByNumberEquals(countByNumberEqualsField)
      .then((res) => setCountByNumberEqualsResult(res.data))
      .catch((err) => console.error(err));
  }, [countByNumberEqualsField]);

  useEffect(() => {
    getTicketsAmountByNumberLess(countByNumberLessField)
      .then((res) => setCountByNumberLessResult(res.data))
      .catch((err) => console.error(err));
  }, [countByNumberLessField]);

  const cancelBookings = async () => {
    if (!cancelBookingPersonIdField) {
      console.error("personId is not specified");
      return;
    }
    cancelBookingsByPersonId(cancelBookingPersonIdField)
      .then((res) =>
        setCancelBookingPersonIdResult(
          "Successfully cancelled bookings: " + String(res.data)
        )
      )
      .catch((err) => console.error(err));
  };

  return (
    <>
      <NavBar />
      <div className="cards-container">
        <SpotlightCard>
          <h1>Group by Coordinates</h1>
          <p>
            Group objects by the coordinates field value and return the number
            of items in each group.
          </p>
          <Link to="/sql/calculate_groups">
            <input type="button" value="Calculate" className="glass-button"></input>
          </Link>
        </SpotlightCard>

        <SpotlightCard>
          <h1>Equals by number</h1>
          <p>
            Return the number of tickets with the value of the "number" field
            equal to the specified one.
          </p>
          <div className="input-container">
                <div className="input-value-row">
            <input
              className="glass-input"
              type="number"
              onChange={(e) =>
                setCountByNumberEqualsField(Number(e.target.value))
              }
            ></input>
            <h2>{countByNumberEqualsResult}</h2>
          </div>
          </div>
          
        </SpotlightCard>

        <SpotlightCard>
          <h1>Less by number</h1>
          <p>
            Return the number of tickets with the value of the "number" field
            less than the specified one.
          </p>
          <div className="input-container">
            <div className="input-value-row">
            <input
              className="glass-input"
              type="number"
              onChange={(e) =>
                setCountByNumberLessField(Number(e.target.value))
              }
            ></input>
            <h2>{countByNumberLessResult}</h2>
          </div>
          </div>
          
        </SpotlightCard>

        <SpotlightCard>
          <h1>Sell ticket</h1>
          <p>Sell a ticket for a specified amount to a specified person.</p>
          <div className="input-container">
              <Link to="/sql/sell">
            <input type="button" value="Sell" className="glass-button"></input>
          </Link>
          </div>
          
        </SpotlightCard>

        <SpotlightCard>
          <h1>Cancel all bookings</h1>
          <p>
            Cancel all bookings of the specified person by deleting his person ID from
            all tickets.
          </p>
          <div className="input-container">
                <div className="input-value-row">
            <input
              className="glass-input"
              type="number"
              onChange={(e) =>
                setCancelBookingPersonIdField(Number(e.target.value))
              }
            ></input>
            <input type="button" value="Send" className="glass-button" onClick={() => cancelBookings()}></input>
          </div>
          <p>{cancelBookingPersonIdResult}</p>
          </div>
          
        </SpotlightCard>
      </div>
    </>
  );
};
