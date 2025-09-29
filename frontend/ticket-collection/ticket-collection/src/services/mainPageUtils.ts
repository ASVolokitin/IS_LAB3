import { Ticket } from "../interfaces/Ticket";
import { formattedDate } from "./format";

export function getNestedValue(obj: any, path: string) {
  return path
    .split(".")
    .reduce(
      (acc, key) => (acc && acc[key] != null ? acc[key] : undefined),
      obj
    );
}


export function renderCell(row: Ticket, field: string) {
  const value = getNestedValue(row, field);
  
  if (field.toLowerCase().endsWith("date") && value) return formattedDate(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  
  return value ?? "";
}