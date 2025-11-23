import * as Yup from "yup";
import { useFormik } from "formik";
import { TicketDTO } from "../../../interfaces/dto/TicketDTO";
import { allowOnlyNumbers } from "../../../services/allowKeyDown";
import "../Checkbox/Checkbox.css"
import "../Modal/Dialog.css"

import { Link } from "react-router-dom";
import { TICKET_TYPES } from "../../../types/TicketType";
import { FieldType, normalize } from "../../../services/normalize";
import { memo, useEffect, useMemo, useRef } from "react";

interface TicketFormProps {
    initialValues?: TicketDTO;
    onSubmit: (dto: any) => void;
    onCancel?: () => void;
    coordinatesList: { id: number; name: string }[];
    personList: { id: number; name: string }[];
    eventList: { id: number; name: string }[];
    venueList: { id: number; name: string }[];
}

export const ticketValidationSchema = Yup.object({
    name: Yup.string().required("Name is required").trim().min(1, "Name cannot be empty").max(255, "Name must not exceed 255 characters"),
    coordinatesId: Yup.number().required("Coordinates required").moreThan(0, "Select coordinates"),
    personId: Yup.number().nullable(),
    eventId: Yup.number().nullable(),
    price:
        Yup.number()
            .typeError("Enter a number")
            .transform((_value, originalValue) =>
                originalValue === "" ? undefined : Number(originalValue)
            )
            .required("Price is required")
            .moreThan(0, "Price must be > 0")
            .test(
                "int32-range",
                "X must be in range -2147483648 … 2147483647",
                (v) => v === undefined || (v >= -2147483648 && v <= 2147483647)
            ),
    type: Yup.string().nullable(),
    discount:
        Yup.number()
            .typeError("Enter a number")
            .nullable()
            .moreThan(0, "Discount must be > 0")
            .max(100, "Max discount is 100")
            .test(
                "int32-range",
                "X must be in range -2147483648 … 2147483647",
                (v) => v === undefined || v === null || (v >= -2147483648 && v <= 2147483647)
            ),
    number: Yup.number()
        .required()
        .typeError("Enter a number")
        .moreThan(0, "Number must be > 0")
        .test(
            "int32-range",
            "X must be in range -2147483648 … 2147483647",
            (v) => v === undefined || v === null || (v >= -2147483648 && v <= 2147483647)
        )
    ,
    refundable: Yup.boolean().required(),
    venueId: Yup.number().required("Venue is required").moreThan(0, "Select venue"),
});


export const TicketForm = ({
    initialValues,
    onSubmit,
    onCancel,
    coordinatesList,
    personList,
    eventList,
    venueList,
}: TicketFormProps) => {

    const marker = "custom: render-ticket-form";
    const end_marker = "custom: end-render-ticket-form";
    performance.mark(marker);

    const formik = useFormik<TicketDTO>({
        initialValues: initialValues ?? {
            name: "",
            coordinatesId: 0,
            personId: null,
            eventId: null,
            price: 500,
            type: null,
            discount: null,
            number: 1,
            refundable: true,
            venueId: 0,
        },
        enableReinitialize: false,
        validationSchema: ticketValidationSchema,
        initialErrors: {},
        initialTouched: {},
        onSubmit: (values) => {
            const dto = {
                ...values,
                coordinates: { id: values.coordinatesId },
                person: values.personId ? { id: values.personId } : null,
                event: values.eventId ? { id: values.eventId } : null,
                venue: { id: values.venueId },
                type: values.type !== "" ? values.type : null
            };
            onSubmit(dto);
        },
    });

    const renderSelect = useMemo(() => (
        name: keyof TicketDTO,
        entityName: string,
        list: { id: number; name: string }[],
        placeholder: string
    ) => (
        <>
            <div className="object-field">
                <div className="object-field-controls">
                    <select
                        className={"glass-select"}
                        name={name}
                        value={String(formik.values[name])}
                        onChange={formik.handleChange}
                    >
                        <option value="">Not stated</option>
                        {list.map((item) => (
                            <option key={item.id} value={item.id}>{item.name}</option>
                        ))}
                    </select>
                    <Link to={`/${entityName}/create`}>
                        <button type="button" className="outline-button">
                            Create new
                        </button>
                    </Link>
                </div>
            </div>
            {formik.touched[name] && formik.errors[name] && (
                <div className="error-message">{formik.errors[name]}</div>
            )}
        </>
    ), [formik.values, formik.touched, formik.errors]);

    performance.mark(end_marker);
    performance.measure('custom: ticket form measure', marker, end_marker);

    return (
        <form onSubmit={formik.handleSubmit} className="ticket-form">

            <div className="form-section">
                <h2>General information</h2>
                <div className="form-group">
                    <label>Name *</label>
                    <div className="input-container">
                        <input
                            autoComplete="off"
                            name="name"
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="glass-input"
                        />
                        {formik.touched.name && formik.errors.name && <div className="error-message">{formik.errors.name}</div>}
                    </div>

                </div>

                <div className="form-group">
                    <label>Ticket Type</label>
                    <select
                        name="type"
                        value={formik.values.type ?? ""}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="glass-select"
                    >
                        <option value="">Not stated</option>
                        {Object.values(TICKET_TYPES).map((c) => (
                            <option key={c} value={c ? c : "df"}>{c}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Price *</label>
                    <div className="input-container">
                        <input
                            name="price"
                            type="text"
                            autoComplete="off"
                            value={formik.values.price}
                            onBlur={formik.handleBlur}

                            onChange={(e) => {
                                formik.handleChange(e);
                                const { name, value } = e.target;
                                formik.setFieldValue(name, normalize(value, FieldType.Number));
                            }}
                            onKeyDown={allowOnlyNumbers}
                            className="glass-input"
                        />
                        {formik.touched.price && formik.errors.price && <div className="error-message">{formik.errors.price}</div>}
                    </div>

                </div>

                <div className="form-group">
                    <label>Discount</label>
                    <div className="input-container">
                        <input
                            autoComplete="off"
                            name="discount"
                            type="text"
                            value={formik.values.discount ?? ""}
                            onChange={formik.handleChange}
                            onBlur={(e) => {
                                formik.handleBlur(e);
                                const { name, value } = e.target;
                                formik.setFieldValue(name, normalize(value, FieldType.Number));
                            }}
                            className="glass-input"
                            onKeyDown={allowOnlyNumbers}
                        />
                        {formik.touched.discount && formik.errors.discount && <div className="error-message">{formik.errors.discount}</div>}
                    </div>

                </div>

                <div className="form-group">
                    <label>Number * </label>
                    <div className="input-container">
                        <input
                            autoComplete="off"
                            name="number"
                            type="text"
                            value={formik.values.number ?? ""}
                            onChange={formik.handleChange}
                            onBlur={(e) => {
                                formik.handleBlur(e);
                                const { name, value } = e.target;
                                formik.setFieldValue(name, normalize(value, FieldType.Number));
                            }}
                            className="glass-input"
                            onKeyDown={allowOnlyNumbers}
                        />
                        {formik.touched.number && formik.errors.number && <div className="error-message">{formik.errors.number}</div>}
                    </div>

                </div>

                {/* <div className="form-group"> */}

                <label className="glass-checkbox-container">
                    Refundable

                    <input
                        autoComplete="off"
                        type="checkbox"
                        id="refundable"
                        name="refundable"
                        checked={formik.values.refundable}
                        onChange={formik.handleChange} />
                    <span className="glass-checkbox"></span>

                </label>
                {/* </div> */}


            </div>

            <div className="form-section">
                <h2>Connected objects</h2>
                <div className="object-field-container">
                    <label>Coordinates *</label>
                    {renderSelect("coordinatesId", "coordinates", coordinatesList, "Select coordinates")}
                </div>

                <div className="object-field-container">
                    <label>Person</label>
                    {renderSelect("personId", "persons", personList, "Select person")}
                </div>

                <div className="object-field-container">
                    <label>Event</label>
                    {renderSelect("eventId", "events", eventList, "Select event")}
                </div>

                <div className="object-field-container">
                    <label>Venue *</label>
                    {renderSelect("venueId", "venues", venueList, "Select venue")}
                </div>
            </div>



            <div className="form-actions">
                <button
                    type="button"
                    className="outline-button"
                    onClick={onCancel}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="primary-button"
                    disabled={!formik.isValid || !formik.dirty}
                >
                    Save
                </button>
            </div>
        </form>
    );
};