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
import { SqlFormData } from "../../../interfaces/formData/SqlFormData";
import { validateSqlField } from "../../../services/validator/sqlValidator";

export const SqlQueriesPage = () => {

  const [countByNumberEqualsField, setCountByNumberEqualField] =
    useState<string>("");
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

  const [errors, setErrors] = useState<Record<keyof SqlFormData, string>>({
      equalInNumber: "",
      lessInNumber: "",
      cancelBookingsId: ""
    });

  useEffect(() => {
    getTicketsGroupedByCoordinates()
      .then((res) => console.log(res.data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    getTicketsAmountByNumberEquals(Number(countByNumberEqualsField))
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

  const handleChangeEqualInNumber = (value: string) => {
    // value = value.replace(/[^\d.-]/g, '') // Удаляем все кроме цифр, точки и минуса
    //   .replace(/(?!^)-/g, '') // Удаляем минусы не в начале
    //   .replace(/(\..*)\./g, '$1'); // Оставляем только первую точку
    setCountByNumberEqualField(value)

    setErrors((prev) => ({ ...prev, ["equalInNumber"]: validateSqlField("equalInNumber", value)}));

  }

  const handleChangeLessInNumber = (value: string) => {
    setCountByNumberLessField(Number(value))

    setErrors((prev) => ({ ...prev, ["lessInNumber"]: validateSqlField("lessInNumber", value)}));

  }

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
              type="text"
              pattern="-?\d*\.?\d*"
              min={1}
              value={countByNumberEqualsField}
              onChange={(e) =>
                handleChangeEqualInNumber(e.target.value)
              }
            ></input>
            
            <h2>{countByNumberEqualsResult}</h2>
          </div>
          {errors.equalInNumber && (
                  <span className="error-message">{errors.equalInNumber}</span>
                )}
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
              min={1}
              onChange={(e) =>
                handleChangeLessInNumber(e.target.value)
              }
              onBlur={(e) =>
                handleChangeLessInNumber(e.target.value)}
            ></input>
            <h2>{countByNumberLessResult}</h2>
          </div>
          {errors.lessInNumber && (
                  <span className="error-message">{errors.lessInNumber}</span>
                )}
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
            <input type="button" value="Cancel" className="glass-button" onClick={() => cancelBookings()}></input>
          </div>
          <p>{cancelBookingPersonIdResult}</p>
          </div>
          
        </SpotlightCard>
      </div>
    </>
  );
};
