import React, { useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { VenueDTO } from "../../../interfaces/dto/VenueDTO";
import { VENUE_TYPES, VenueType } from "../../../types/VenueType";
import { useNavigate } from "react-router-dom";
import { VenueFormData } from "../../../interfaces/formData/VenueFormData";
import { allowOnlyNumbers } from "../../../services/allowKeyDown";


interface VenueFormProps {
    initialValues?: VenueFormData;
    onSubmit: (dto: VenueDTO) => void;
    onCancel?: () => void;
}

export const venueValidationSchema = Yup.object({
    name: Yup.string()
        .trim()
        .required("Name is required")
        .min(1, "Name cannot be empty")
        .max(255, "Name must not exceed 255 characters"),

    capacity: Yup.number()
        .transform((_value, originalValue) =>
            originalValue === "" ? undefined : Number(originalValue.trim())
        )
        .typeError("Enter a number")
        .required("Capacity is required")
        .moreThan(0, "Capacity must be greater than 0")
        .integer()
        .test(
            "int32-range",
            "Capacity must be in range -2147483648 … 2147483647",
            (v) => v === null || v === undefined || (v >= -2147483648 && v <= 2147483647)
        ),

    type: Yup.mixed<VenueType>()
        .oneOf(Object.values(VENUE_TYPES))
        .nullable(),
});

export const VenueForm = ({ initialValues, onSubmit, onCancel }: VenueFormProps) => {

    const marker = "custom: render-venue-form";
    const end_marker = "custom: end-render-venue-form";

    useNavigate();

    const formik = useFormik<VenueFormData>({
        initialValues:
            initialValues ?? {
                name: "",
                capacity: "",
                type: "",
            },
        enableReinitialize: true,
        initialErrors: {},
        initialTouched: {},
        validationSchema: venueValidationSchema,
        onSubmit: (values) => {
            const dto: VenueDTO = {
                name: values.name.trim(),
                capacity: Number(values.capacity),
                type: values.type === "" ? null : values.type,
            };
            onSubmit(dto);
        },
    });

    if (!onSubmit) return null;

    performance.mark(marker);
    performance.mark(end_marker);
    performance.measure('custom: ticket venue measure', marker, end_marker);

    return (
        <form onSubmit={formik.handleSubmit} className="venue-form">
            <div className="form-section">
                <div className="form-group">
                    <label>Name *</label>
                    <div className="input-container">
                        <input
                            autoComplete="off"
                            name="name"
                            type="text"
                            value={formik.values.name}
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
                    <label>Capacity *</label>
                    <div className="input-container">
                        <input
                            autoComplete="off"
                            name="capacity"
                            type="text"
                            value={formik.values.capacity}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            onKeyDown={allowOnlyNumbers}
                            className="glass-input"
                        />
                        {formik.touched.capacity && formik.errors.capacity && (
                            <div className="error-message">{formik.errors.capacity}</div>
                        )}
                    </div>

                </div>

                <div className="form-group">
                    <label>Type</label>
                    <select
                        name="type"
                        value={formik.values.type ?? ""}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="glass-select"
                    >
                        <option value="">Not stated</option>
                        {Object.values(VENUE_TYPES).map((t) => (
                            <option key={t} value={t}>
                                {t}
                            </option>
                        ))}
                    </select>
                    {formik.touched.type && formik.errors.type && (
                        <div className="error-message">{formik.errors.type}</div>
                    )}
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
