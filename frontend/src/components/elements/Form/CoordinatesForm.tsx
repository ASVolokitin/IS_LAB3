import { useFormik } from "formik";
import * as Yup from 'yup';
import { CoordinatesDTO } from "../../../interfaces/dto/CoordinatesDTO";
import { FieldType, normalize } from "../../../services/normalize";
import { allowOnlyNumbers } from "../../../services/allowKeyDown";
import { useNavigate } from "react-router-dom";
import { devLog } from "../../../services/logger";


interface CoordinatesFormProps {
  initialValues?: CoordinatesDTO;
  onSubmit: (dto: CoordinatesDTO) => void;
  onCancel?: () => void;
}

const validationSchema = Yup.object({
  x: Yup.number()
    .transform((_value, originalValue) =>
      originalValue === "" ? undefined : Number(originalValue)
    )
    .typeError("Enter a number")
    .required("X coordinate is required")
    .integer("X coordinate should be integer")
    .moreThan(-201, "X > -201")
    .test(
      "int32-range",
      "X must be in range -2147483648 … 2147483647",
      (v) => v === undefined || (v >= -2147483648 && v <= 2147483647)
    ),
  y: Yup.number()
    .transform((_value, originalValue) =>
      originalValue === "" ? undefined : Number(originalValue)
    )
    .typeError("Enter a number")
    .required("Y coordinate is required")
    .moreThan(-5, "Y > -5")
    .test(
      "int32-range",
      "X must be in range -2147483648 … 2147483647",
      (v) => v === undefined || (v >= -2147483648 && v <= 2147483647)
    ),

})


export const CoordinatesForm = ({ initialValues, onSubmit, onCancel }: CoordinatesFormProps) => {

  const marker = "custom: render-coordinates-form";
  const end_marker = "custom: end-render-coordinates-form";

  const formik = useFormik({
    initialValues: initialValues ?? { x: "", y: "" },
    validationSchema,
    initialErrors: {},
    initialTouched: {},
    onSubmit: (values) => {

      const dto: CoordinatesDTO = {
        x: Number(values.x),
        y: Number(values.y),
      };

      onSubmit(dto);

    },
  });

    performance.mark(marker);
    performance.mark(end_marker);
    performance.measure('custom: coordinates form measure', marker, end_marker);

  return (
    <form onSubmit={formik.handleSubmit} className="coordinates-form">
      <div className="form-section">
        <div className="form-group">
          <label >X coordinate *</label>
          <div className="input-container">
            <input
              autoComplete="off"
              name="x"
              type="text"
              value={formik.values.x}
              onChange={formik.handleChange}
              onBlur={(e) => {
                formik.handleBlur(e);
                const { name, value } = e.target;
                formik.setFieldValue(name, normalize(value, FieldType.Number));
              }}
              onKeyDown={allowOnlyNumbers}
              className={"glass-input"}
            />
            {formik.touched.x && formik.errors.x && (
              <div className="error-message">{formik.errors.x}</div>
            )}
          </div>


        </div>
        <div className="form-group">
          <label> Y Coordinate *: </label>
          <div className="input-container">
            <input
              autoComplete="off"
              name="y"
              type="text"
              value={formik.values.y}
              onChange={formik.handleChange}
              onBlur={(e) => {
                formik.handleBlur(e);
                const { name, value } = e.target;
                formik.setFieldValue(name, normalize(value, FieldType.Number));
              }}
              onKeyDown={allowOnlyNumbers}
              className={"glass-input"}
            />

            {formik.touched.y && formik.errors.y && (
              <div className="error-message">{formik.errors.y}</div>
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
  )
}