package com.ticketis.app.model.enums;

public enum ImportStatus {
    PENDING,
    FILE_UPLOADED,
    VALIDATION_FAILED,
    PROCESSING,         // for sync
    PARTIAL_SUCCESS,    // for async
    SUCCESS,
    FAILED
}