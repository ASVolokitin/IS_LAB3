import { useEffect, useState } from "react";
import SpotlightCard from "../../elements/Card/SpotlightCard";
import "./SqlQueriesPage.css";
import {
  cancelBookingsByPersonId,
  getTicketsAmountByNumberEquals,
  getTicketsAmountByNumberLess,
  getTicketsGroupedByCoordinates,
} from "../../../services/api";
import { NavBar } from "../../elements/NavBar/NavBar";

export const SqlQueriesPage = () => {
  const [countGroupedByCoordinatesResult, setCountGroupedByCoordinatesResult] =
    useState<number>(0);

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

  const cancelBookings = () => {
    if (!cancelBookingPersonIdField) {
      console.error("personId не задан");
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
          <p>Click me</p>
        </SpotlightCard>

        <SpotlightCard>
          <h1>Equals by number</h1>
          <p>
            Return the number of tickets with the value of the "number" field
            equal to the specified one.
          </p>
          <div className="input-value-row">
            <input
              type="number"
              onChange={(e) =>
                setCountByNumberEqualsField(Number(e.target.value))
              }
            ></input>
            <h2>{countByNumberEqualsResult}</h2>
          </div>
        </SpotlightCard>

        <SpotlightCard>
          <h1>Less by number</h1>
          <p>
            Return the number of tickets with the value of the "number" field
            less than the specified one.
          </p>
          <div className="input-value-row">
            <input
              type="number"
              onChange={(e) =>
                setCountByNumberLessField(Number(e.target.value))
              }
            ></input>
            <h2>{countByNumberLessResult}</h2>
          </div>
        </SpotlightCard>

        <SpotlightCard>
          <h1>Sell ticket</h1>
          <p>Sell a ticket for a specified amount to a specified person.</p>
          <p>Click me</p>
        </SpotlightCard>

        <SpotlightCard>
          <h1>Cancel all bookings</h1>
          <p>
            Cancel all bookings of the specified person by deleting his ID from
            all tickets.
          </p>
          <div className="input-value-row">
            <input
              type="number"
              onChange={(e) =>
                setCancelBookingPersonIdField(Number(e.target.value))
              }
            ></input>
            <input
              value="Send"
              type="button"
              onClick={() => cancelBookings()}
            ></input>
          </div>
          <div className="result-contaier">
            <p>{cancelBookingPersonIdResult}</p>
          </div>
        </SpotlightCard>
      </div>
    </>
  );
};
