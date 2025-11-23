import { useEffect, useState } from "react";
import SpotlightCard from "../../elements/Card/SpotlightCard";
import "./SqlQueriesPage.css";
import '../../elements/Button/Button.css'
import {
  cancelBookingsByPersonId,
  getPersons,
  getTicketsAmountByNumberEquals,
  getTicketsAmountByNumberLess,
} from "../../../services/api";
import { NavBar } from "../../elements/NavBar/NavBar";
import { Link } from "react-router-dom";
import * as Yup from 'yup';

import '../../elements/Input/Input.css'
import { SqlFormData } from "../../../interfaces/formData/SqlFormData";
import { validateSqlField } from "../../../services/validator/sqlValidator";
import { Person } from "../../../interfaces/Person";
import { Notification } from "../../elements/Notification/Notification";
import { useFormik } from "formik";
import { FieldType, normalize } from "../../../services/normalize";

const validationSchema = Yup.object({
  number: Yup.number()
    .transform((_value, originalValue) =>
      originalValue === "" ? undefined : Number(originalValue)
    )
    .typeError("Enter a number")
    .integer("Number should be integer")
    .moreThan(0, "number > 0")
    .required("Number is required")
    .test(
      "int32-range",
      "X must be in range -2147483648 … 2147483647",
      (v) => v === undefined || (v >= -2147483648 && v <= 2147483647)
    ),
})



export const SqlQueriesPage = () => {

  const [countByNumberEqualsField, setCountByNumberEqualField] =
    useState<string>("");
  const [_countByNumberEqualsResult, setCountByNumberEqualsResult] =
    useState<number>(0);
  const [_countByNumberEqualsOutput, setCountByNumberEqualsOutput] = useState<string>("")

  const [countByNumberLessField, setCountByNumberLessField] =
    useState<string>("");
  const [_countByNumberLessResult, setCountByNumberLessResult] =
    useState<number>(0);
  const [_countByNumberLessOutput, setCountByNumberLessOutput] = useState<string>("")

  const [cancelBookingPersonIdResult, setCancelBookingPersonIdResult] =
    useState<String>("");

  const [persons, setPersons] = useState<Person[]>();
  const [chosenPersonId, setChosenPersonId] = useState<number>();
  const [serverError, setServerError] = useState<string | null>();

  const [errors, setErrors] = useState<Record<keyof SqlFormData, string>>({
    equalInNumber: "",
    lessInNumber: "",
    cancelBookingsId: ""
  });

  useEffect(() => {
    getPersons()
      .then((res) => setPersons(res.data))
      .catch((err) => setServerError(err.response.data.message))
  }, []);

  const equalsFormik = useFormik({
    initialValues: { number: "" },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const res = await getTicketsAmountByNumberEquals(Number(values.number));
        equalsFormik.setStatus(
          `Found ${res.data} ticket${res.data === 1 ? "" : "s"} with number ${values.number}`
        );
      } catch (err: any) {
        setServerError(err.response?.data?.message || "Error fetching data");
      }
    },
  });

  const lessFormik = useFormik({
    initialValues: { number: "" },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const res = await getTicketsAmountByNumberLess(Number(values.number));
        lessFormik.setStatus(
          `Found ${res.data} ticket${res.data === 1 ? "" : "s"} with number less than ${values.number}`
        );
      } catch (err: any) {
        setServerError(err.response?.data?.message || "Error fetching data");
      }
    },
  });

  useEffect(() => {
    getTicketsAmountByNumberEquals(Number(countByNumberEqualsField))
      .then((res) => {
        setCountByNumberEqualsResult(res.data)
        setCountByNumberEqualsOutput(`Found ${res.data} ticket${res.data === 1 ? "" : "s"} with number ${countByNumberEqualsField}`)
      })
      .catch((err) => setServerError(err.response.data.message));
  }, [countByNumberEqualsField]);

  useEffect(() => {
    getTicketsAmountByNumberLess(Number(countByNumberLessField))
      .then((res) => {
        setCountByNumberLessResult(res.data);
        setCountByNumberLessOutput(`Found ${res.data} ticket${res.data === 1 ? "" : "s"} with number less than ${countByNumberLessField}`)
      })
      .catch((err) => setServerError(err.response.data.message));
  }, [countByNumberLessField]);

  const cancelBookings = async () => {
    if (!chosenPersonId) {
      setServerError("person is not specified");
      return;
    }
    cancelBookingsByPersonId(chosenPersonId)
      .then((res) =>
        setCancelBookingPersonIdResult(
          "Successfully cancelled bookings: " + String(res.data)
        )
      )
      .catch((err) => setServerError(err.response.data.message));
  };
  
  const handlePersonChange = (chosenPersonId: number) => {
    setChosenPersonId(chosenPersonId);
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
          <div className="validation-row"></div>
        </SpotlightCard>

        <SpotlightCard>
          <h1>Equals by number</h1>
          <p>Return the number of tickets with the value of the "number" field equal to the specified one.</p>

          <form onSubmit={equalsFormik.handleSubmit} className="input-container">
            <div className="input-value-row">
              <input
                autoComplete="off"
                name="number"
                type="text"
                className="glass-input"
                style={{maxWidth: "150px"}}
                value={equalsFormik.values.number}
                onChange={equalsFormik.handleChange}
                onBlur={(e) => {
                  equalsFormik.handleBlur(e);
                  const { name, value } = e.target;
                  equalsFormik.setFieldValue(name, normalize(value, FieldType.Number));
                }}
                placeholder="Enter number"
              />
              <button type="submit" className="glass-button">Run</button>
            </div>

            <div className="validation-row">
              {equalsFormik.touched.number && equalsFormik.errors.number && (
                <span className="error-message">{equalsFormik.errors.number}</span>
              )}
              {equalsFormik.status && !equalsFormik.errors.number && (
                <div className="count-output-container">{equalsFormik.status}</div>
              )}
            </div>
          </form>
        </SpotlightCard>

        <SpotlightCard>
          <h1>Less by number</h1>
          <p>Return the number of tickets with the value of the "number" field less than the specified one.</p>

          <form onSubmit={lessFormik.handleSubmit} className="input-container">
            <div className="input-value-row">
              <input
                autoComplete="off"
                name="number"
                type="text"
                style={{maxWidth: "150px"}}
                className="glass-input"
                value={lessFormik.values.number}
                onChange={lessFormik.handleChange}
                onBlur={(e) => {
                  lessFormik.handleBlur(e);
                  const { name, value } = e.target;
                  lessFormik.setFieldValue(name, normalize(value, FieldType.Number));
                }}
                placeholder="Enter number"
              />
              <button type="submit" className="glass-button">Run</button>
            </div>

            <div className="validation-row">
              {lessFormik.touched.number && lessFormik.errors.number && (
                <span className="error-message">{lessFormik.errors.number}</span>
              )}
              {lessFormik.status && !lessFormik.errors.number && (
                <div className="count-output-container">{lessFormik.status}</div>
              )}
            </div>
          </form>
        </SpotlightCard>

        <SpotlightCard>
          <h1>Sell ticket</h1>
          <p>Sell a ticket for a specified amount to a specified person.</p>
          <div className="input-container">
            <Link to="/sql/sell">
              <input type="button" value="Sell" className="glass-button"></input>
            </Link>
            <div className="validation-row"></div>
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
              <select
                className="glass-select"
                value={chosenPersonId}
                onChange={(e) =>
                  handlePersonChange(Number(e.target.value))
                }
              >
                <option value="">-</option>
                {persons?.map((person: Person) => (
                  <option key={person.passportID} value={person.id}>
                    {`${person.passportID === ""
                      ? `nameless (id ${person.id})`
                      : person.passportID
                      }`}
                  </option>
                ))}
              </select>
              <input type="button" value="Run" className="glass-button" onClick={() => cancelBookings()}></input>
            </div>
            <div className="validation-row">
              <p>{cancelBookingPersonIdResult}</p>
            </div>

          </div>
          {/* <div className="validation-row"></div> */}

        </SpotlightCard>
      </div>
      {serverError && (
        <Notification
          message={serverError}
          type="error"
          isVisible={true}
          onClose={() => setServerError(null)}
        />
      )}
    </>
  );
};
