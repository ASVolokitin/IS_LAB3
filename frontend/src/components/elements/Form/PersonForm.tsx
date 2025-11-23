import { useFormik } from "formik";
import * as Yup from 'yup';
import { Color, COLORS } from "../../../types/Color";
import { COUNTRIES, Country } from "../../../types/Country";
import { PersonDTO } from "../../../interfaces/dto/PersonDTO";
import { Link } from "react-router-dom";

import "../Input/Input.css"

interface PersonFormProps {
    initialValues?: PersonDTO;
    onSubmit: (dto: PersonDTO) => void;
    onCancel?: () => void;
    locationList: { id: number; name: string }[];
}

export const personValidationSchema = Yup.object({
    eyeColor: Yup.mixed<Color>()
        .oneOf(Object.values(COLORS), "Select a valid eye color")
        .required("Eye color is required"),

    hairColor: Yup.mixed<Color>()
        .oneOf(Object.values(COLORS), "Select a valid hair color")
        .required("Hair color is required"),

    location: Yup.string().nullable(),

    passportID: Yup.string()
        .required("Passport ID is required")
        .max(29, "Passport ID must be at most 29 characters"),

    nationality: Yup.mixed<Country>()
        .oneOf(Object.values(COUNTRIES))
        .nullable(),
});

export const PersonForm = ({ initialValues, locationList, onSubmit, onCancel }: PersonFormProps) => {

    const marker = "custom: render-person-form";
    const end_marker = "custom: end-render-person-form";

    const formik = useFormik({
        initialValues: initialValues ?? {
            eyeColor: "",
            hairColor: "",
            locationId: null,
            passportID: null,
            nationality: null,
        },
        enableReinitialize: false,
        validationSchema: personValidationSchema,
        onSubmit: (values: PersonDTO) => {

            const dto: PersonDTO = {
                eyeColor: values.eyeColor,
                hairColor: values.hairColor,
                locationId: values.locationId,
                passportID: values.passportID && values.passportID.trim() !== ""
                    ? values.passportID.trim()
                    : null,
                nationality: values.nationality && values.nationality.trim() !== ""
                    ? values.nationality.trim()
                    : null,
            };


            onSubmit(dto);

        },
    });

    performance.mark(marker);
    performance.mark(end_marker);
    performance.measure('custom: person form measure', marker, end_marker);

    return (
        <form onSubmit={formik.handleSubmit}>
            <div className="form-section">
                <div className="form-group">

                    <label>Eye Color *</label>
                    <div className="input-container">
                        <select
                            name="eyeColor"
                            value={formik.values.eyeColor}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="glass-select"
                        >
                            <option value="">Not stated</option>
                            {Object.values(COLORS).map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                        {formik.touched.eyeColor && formik.errors.eyeColor && (
                            <div className="error-message">{formik.errors.eyeColor}</div>
                        )}
                    </div>

                </div>
                <div className="form-group">
                    <label>Hair Color *</label>
                    <div className="input-container">
                        <select
                            name="hairColor"
                            value={formik.values.hairColor}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="glass-select"
                        >
                            <option value="">Not stated</option>
                            {Object.values(COLORS).map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                        {formik.touched.hairColor && formik.errors.hairColor && (
                            <div className="error-message">{formik.errors.hairColor}</div>
                        )}
                    </div>

                </div>


                <div className="form-group">

                    <label>Location</label>
                    <div className="create-subobject-group" style={{ display: "flex", flexDirection: "row" }}>
                        <select
                            name="locationId"
                            value={formik.values.locationId ? formik.values.locationId : ""}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="glass-select"
                            style={{ width: "150px" }}
                        >
                            <option value={""}>Not stated</option>
                            {locationList?.map((loc) => (
                                <option key={loc.id} value={loc.id}>
                                    {loc.name}
                                </option>
                            ))}
                        </select>
                        <Link to={`/locations/create`}>
                            <button type="button" className="outline-button">
                                New
                            </button>
                        </Link>

                    </div>
                </div>


                <div className="form-group">
                    <label>Passport ID *</label>
                    <div className="input-container">
                        <input
                            autoComplete="off"
                            name="passportID"
                            value={formik.values.passportID ?? ""}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="glass-input"
                        />
                        {formik.touched.passportID && formik.errors.passportID && (
                            <div className="error-message">{formik.errors.passportID}</div>
                        )}
                    </div>

                </div>

                <div className="form-group">
                    <label>Nationality</label>
                    <div className="input-container">
                        <select
                            name="nationality"
                            value={formik.values.nationality ?? ""}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="glass-select"
                        >
                            <option value="">Not stated</option>
                            {Object.values(COUNTRIES).map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                        {formik.touched.nationality && formik.errors.nationality && (
                            <div className="error-message">{formik.errors.nationality}</div>
                        )}
                    </div>

                </div>

            </div>



            <div className="form-actions">
                <button
                    type="button"
                    className="outline-button"
                    onClick={onCancel}
                >
                    Back
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
