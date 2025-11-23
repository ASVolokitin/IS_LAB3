import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { LocationDTO } from "../../../interfaces/dto/LocationDTO";
import { LocationFormData } from "../../../interfaces/formData/LocationFormData";
import { allowOnlyNumbers } from "../../../services/allowKeyDown";

interface LocationFormProps {
    initialValues?: LocationDTO;
    onSubmit: (dto: LocationDTO) => void;
    onCancel?: () => void;
}

export const locationValidationSchema = Yup.object({
    x: Yup.number()
        .transform((_val, originalValue) => {
            const trimmed = String(originalValue).trim();
            return trimmed === "" ? NaN : Number(trimmed);
        })
        .typeError("Enter a number")
        .required("X coordinate is required")
        .test(
            "int32-range",
            "X must be in range -2147483648 … 2147483647",
            (v) => v === null || v === undefined || (v >= -2147483648 && v <= 2147483647)),


    y: Yup.number()
        .transform((_val, originalValue) => {
            const trimmed = String(originalValue).trim();
            return trimmed === "" ? NaN : Number(trimmed);
        })
        .typeError("Enter a number")
        .required("Y coordinate is required")
        .integer("Y must be an integer")
        .test(
            "int32-range",
            "X must be in range -2147483648 … 2147483647",
            (v) => v === null || v === undefined || (v >= -2147483648 && v <= 2147483647)),

    z: Yup.number()
        .transform((_val, originalValue) => {
            const trimmed = String(originalValue).trim();
            return trimmed === "" ? NaN : Number(trimmed);
        })
        .typeError("Enter a number")
        .required("Z coordinate is required")
        .test(
            "int32-range",
            "X must be in range -2147483648 … 2147483647",
            (v) => v === null || v === undefined || (v >= -2147483648 && v <= 2147483647)),

    name: Yup.string().trim().nullable().max(255, "Name must not exceed 255 characters"),
});


export const LocationForm = ({ initialValues, onSubmit, onCancel }: LocationFormProps) => {

    const marker = "custom: render-location-form";
    const end_marker = "custom: end-render-location-form";

    const navigate = useNavigate();

    const formik = useFormik<LocationDTO>({
        initialValues:
            initialValues ?? {
                x: null,
                y: null,
                z: null,
                name: "",
            },
        enableReinitialize: true,
        initialErrors: {},
        initialTouched: {},
        validationSchema: locationValidationSchema,
        onSubmit: (values) => {
            const dto: LocationDTO = {
                x: Number(values.x),
                y: Number(values.y),
                z: Number(values.z),
                name: values.name?.trim() || null,
            };
            onSubmit(dto);
        },
    });

    performance.mark(marker);
    performance.mark(end_marker);
    performance.measure('custom: location form measure', marker, end_marker);

    return (
        <form onSubmit={formik.handleSubmit} className="location-form">
            <div className="form-section">
                <div className="form-group">
                    <label>X coordinate *</label>
                    <div className="input-container">
                        <input
                            autoComplete="off"
                            name="x"
                            type="text"
                            value={formik.values.x ?? ""}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            onKeyDown={allowOnlyNumbers}
                            className="glass-input"
                        />
                        {formik.touched.x && formik.errors.x && (
                            <div className="error-message">{formik.errors.x}</div>
                        )}
                    </div>

                </div>

                <div className="form-group">
                    <label>Y coordinate *</label>
                    <div className="input-container">
                        <input
                            autoComplete="off"
                            name="y"
                            type="text"
                            value={formik.values.y ?? ""}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            onKeyDown={allowOnlyNumbers}
                            className="glass-input"
                        />
                        {formik.touched.y && formik.errors.y && (
                            <div className="error-message">{formik.errors.y}</div>
                        )}
                    </div>

                </div>

                <div className="form-group">
                    <label>Z coordinate *</label>
                    <div className="input-container">
                        <input
                            autoComplete="off"
                            name="z"
                            type="text"
                            value={formik.values.z ?? ""}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            onKeyDown={allowOnlyNumbers}
                            className="glass-input"
                        />
                        {formik.touched.z && formik.errors.z && (
                            <div className="error-message">{formik.errors.z}</div>
                        )}
                    </div>

                </div>

                <div className="form-group">
                    <label>Name</label>
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
            </div>

            <div className="form-actions">
                <button
                    type="button"
                    className="outline-button"
                    onClick={onCancel ?? (() => navigate(-1))}
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
