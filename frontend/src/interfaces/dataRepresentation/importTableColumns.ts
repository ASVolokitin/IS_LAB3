import { ImportHistoryItem } from "../ImportHistoryItem";
import { Ticket } from "../Ticket";
import { Column } from "./mainTableColumns";

export const importTableColumns: Column<ImportHistoryItem>[] = [
    { label: "ID", field: "id" },
    { label: "File", field: "filename" },
    { label: "Imported At", field: "importedAt" },
    { label: "Status", field: "importStatus" },
    { label: "Description", field: "resultDescription" },
];