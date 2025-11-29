package com.ticketis.app.model.enums;

public enum ImportStatus {
    PENDING,
    FILE_UPLOADED,
    SYNC_IMPORT_STARTED,
    ASYNC_IMPORT_STARTED,
    VALIDATION_FAILED,
    PROCESSING,         // for sync
    PARTIAL_SUCCESS,    // for async
    SUCCESS,
    FAILED
}