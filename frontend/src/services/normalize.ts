import { devLog } from "./logger";

export enum FieldType {
    String = "string",
    Number = "number",
}

export function normalize(value: string, type: FieldType = FieldType.String) {
    devLog.log("Value to trim: ", value);
    const trimmed = value.trim();

    switch (type) {
        case FieldType.String:
            return trimmed;
        case FieldType.Number:
            if (trimmed === "") return "";
            const num = Number(trimmed.replace(/^0+(?=\d)/, ""));
            return isNaN(num) ? trimmed : num;
    }
}