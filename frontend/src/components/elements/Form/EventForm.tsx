import { useFormik } from "formik";
import * as Yup from "yup";
import { TicketEventDTO } from "../../../interfaces/dto/TicketEventDTO";
import { devLog } from "../../../services/logger";
import { isoToLocalDateTime } from "../../../services/format";
import { allowOnlyNumbers } from "../../../services/allowKeyDown";

interface EventFormProps {
    initialValues?: TicketEventDTO;
    onSubmit: (dto: TicketEventDTO) => void;
    onCancel?: () => void;
}



export const eventValidationSchema = Yup.object({
    name: Yup.string()
        .trim()
        .required("Event name is required")
        .max(255, "Name must not exceed 255 characters"),

    date: Yup.date()
        .nullable()
        .typeError("Invalid date format"),

    minAge: Yup.number()
        .typeError("Input a number")
        .nullable()
        .test(
            "is-number",
            "Min age must be a number",
            (value) => !value || !isNaN(Number(value))
        )
        .integer("X coordinate should be integer")
        .moreThan(-1, "Mininum age should not be negative")
        .test(
            "is-positive",
            "Min age must be positive",
            (value) =>
                !value ||
                (Number(value) > 0 && Number.isInteger(Number(value)))
        )
        .test(
            "int32-range",
            "X must be in range -2147483648 … 2147483647",
            (v) => v === null || v === undefined || (v >= -2147483648 && v <= 2147483647)
        )
    ,

    description: Yup.string()
        .trim()
        .required("Description is required"),
});


export const EventForm = ({ initialValues, onSubmit, onCancel }: EventFormProps) => {

    const marker = "custom: render-event-form";
    const end_marker = "custom: end-render-event-form";
    performance.mark(marker);

    const formik = useFormik<TicketEventDTO>({
        initialValues: initialValues
            ? {
                ...initialValues,
                date: initialValues.date ? isoToLocalDateTime(initialValues.date) : "",
            }
            : {
                name: "",
                date: "",
                minAge: null,
                description: "",
            },
        enableReinitialize: true,
        initialErrors: {},
        initialTouched: {},
        validationSchema: eventValidationSchema,
        onSubmit: (values) => {
            const dto: TicketEventDTO = {
                name: values.name?.trim() ?? null,
                date: values.date
                    ? new Date(values.date).toISOString()
                    : null,
                minAge: values.minAge ? Number(values.minAge) : null,
                description: values.description?.trim() ?? null,
            };
            onSubmit(dto);
        },
    });

    performance.mark(marker);
    performance.mark(end_marker);
    performance.measure('custom: event form measure', marker, end_marker);

    return (
        <form onSubmit={formik.handleSubmit} className="event-form">
            <div className="form-section">
                <div className="form-group">
                    <label>Name *</label>
                    <div className="input-container">
                        <input
                            autoComplete="off"
                            name="name"
                            type="text"
                            value={formik.values.name ?? ""}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="glass-input"
                        />
                        {formik.touched.name && formik.errors.name && (
                            <div className="error-message">{formik.errors.name}</div>
                        )}
                    </div>

                </div>

                <div className="form-group">
                    <label>Date</label>
                    <div className="input-container">
                        <input
                            autoComplete="off"
                            name="date"
                            type="datetime-local"
                            value={formik.values.date ?? ""}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="glass-input"
                        />
                        {formik.touched.date && formik.errors.date && (
                            <div className="error-message">{formik.errors.date}</div>
                        )}
                    </div>

                </div>

                <div className="form-group">
                    <label>Minimum Age</label>
                    <div className="input-container">
                        <input
                            autoComplete="off"
                            name="minAge"
                            type="text"
                            value={formik.values.minAge ?? ""}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            onKeyDown={allowOnlyNumbers}
                            className="glass-input"
                        />
                        {formik.touched.minAge && formik.errors.minAge && (
                            <div className="error-message">{formik.errors.minAge}</div>
                        )}
                    </div>

                </div>

                <div className="form-group">
                    <label>Description *</label>
                    <div className="input-container">
                        <textarea
                            name="description"
                            value={formik.values.description ?? ""}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="glass-input"
                        />
                        {formik.touched.description && formik.errors.description && (
                            <div className="error-message">{formik.errors.description}</div>
                        )}
                    </div>

                </div>

                <div className="form-actions">
                    <button type="button" className="outline-button" onClick={onCancel}>
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
            </div>
        </form>
    );
};
