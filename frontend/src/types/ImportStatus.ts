export const IMPORT_STATUSES = {
    PENDING: "PENDING",
    SUCCESS: "SUCCESS",
    FAILED: "FAILED",
}

export type ImportStatus = typeof IMPORT_STATUSES[keyof typeof IMPORT_STATUSES];