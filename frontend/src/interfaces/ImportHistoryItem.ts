import { ImportStatus } from "../types/ImportStatus";

export interface ImportHistoryItem {
    id: number;
    filename: string;
    importedAt: string;
    importStatus: ImportStatus;
    resultDescription: string;
}