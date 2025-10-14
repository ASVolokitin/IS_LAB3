import { SqlFormData } from "../../interfaces/formData/SqlFormData";

export const validateSqlField = (name: keyof SqlFormData, value: string) => {

    const trimmedValue = value.trim();

    if (trimmedValue === "") return "";


    const numValue = Number(value);
    console.log(numValue);

    switch (name) {
        case "equalInNumber":
        case "lessInNumber":
            if (isNaN(numValue)) return "Number should be a number";
            if (numValue <= 0) return "Number should be positive";
            if (!Number.isInteger(numValue)) return "Number be integer";
            return "";

        default:
            return "";
    }
}