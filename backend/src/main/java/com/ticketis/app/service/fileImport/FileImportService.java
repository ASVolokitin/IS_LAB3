package com.ticketis.app.service.fileImport;

import com.ticketis.app.controller.WebSocketEventController;
import com.ticketis.app.dto.ImportWebSocketEvent;
import com.ticketis.app.dto.response.ImportResponse;
import com.ticketis.app.exception.*;
import com.ticketis.app.exception.importBusinessException.FileImportValidationException;
import com.ticketis.app.exception.importBusinessException.ImportBusinessException;
import com.ticketis.app.exception.importBusinessException.UnableToGetNecessaryFieldException;
import com.ticketis.app.model.ImportHistoryItem;
import com.ticketis.app.model.ImportResult;
import com.ticketis.app.model.enums.ImportStatus;
import com.ticketis.app.model.enums.WebSocketEventType;
import com.ticketis.app.service.ImportValidator;
import jakarta.persistence.RollbackException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.exception.GenericJDBCException;
import org.postgresql.util.PSQLException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.TransactionSystemException;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileImportService {

    private final ImportHistoryService historyService;
    private final FileStorageService fileStorageService;
    private final ImportOrchestratorService orchestratorService;
    private final FileOutboxService outboxService;
    private final WebSocketEventController webSocketEventController;
    private final ImportValidator validator;

    public Page<ImportHistoryItem> getImportsPage(Pageable pageable) {
        return historyService.getImportsPage(pageable);
    }

    public ImportResponse importFile(MultipartFile file, String entityType) {
        ImportHistoryItem importItem = historyService.createPendingImport(
                file.getOriginalFilename(),
                entityType);

        try {
            validator.validateFile(file);

            Path tmpFilePath = fileStorageService.storeFile(file, importItem.getFilename(), importItem.getId());

            outboxService.createUploadEvent(importItem.getId(), importItem.getFilename(), String.valueOf(tmpFilePath));

            ImportResult result = orchestratorService.startImport(importItem.getFilename(), entityType);
            String statusMessage = result.getMessage();

            return new ImportResponse(
                    importItem.getFilename(),
                    file.getSize(),
                    statusMessage,
                    entityType,
                    result.getProcessedCount(),
                    result.getErrorCount(),
                    result.getImportHistoryId(),
                    result.isAsync(),
                    result.getTotalRecords());

        } catch (ImportBusinessException e) {
            handleBusinessError(importItem, e);
            throw e;

        } catch (Exception e) {
            handleSystemError(importItem, e);
            throw new FailedToProcessImportException("System error during import");
        }
    }

    private void handleBusinessError(ImportHistoryItem importItem, ImportBusinessException e) {
        ImportStatus status = determineStatusFromException(e);
        String errorMessage = e.getMessage();

        if (e instanceof FileImportValidationException) {
            errorMessage = "Validation errors: " + String.join("; ",
                    ((FileImportValidationException) e).getErrors());
        }

        ImportHistoryItem currentItem = historyService.getImportItemById(importItem.getId());
        if (currentItem.getImportStatus() != status) {
            historyService.updateStatus(importItem.getId(), status, errorMessage);
            ImportWebSocketEvent event = new ImportWebSocketEvent(WebSocketEventType.SYNC_IMPORT_PROGRESS_FAILED,
                    importItem.getId());
            webSocketEventController.sendImportEvent(event);
        }
        log.warn("Business error during import {}: {}", importItem.getId(), errorMessage);
    }

    private void handleSystemError(ImportHistoryItem importItem, Exception e) {
        String detailedMessage = extractDatabaseErrorMessage(e);
        String errorMessage = detailedMessage != null ? detailedMessage : "System error: " + e.getMessage();

        ImportHistoryItem currentItem = historyService.getImportItemById(importItem.getId());
        if (currentItem.getImportStatus() != ImportStatus.FAILED) {
            historyService.updateStatus(importItem.getId(), ImportStatus.FAILED, errorMessage);
            ImportWebSocketEvent event = new ImportWebSocketEvent(WebSocketEventType.SYNC_IMPORT_PROGRESS_FAILED,
                    importItem.getId());
            webSocketEventController.sendImportEvent(event);
        }

        log.error("System error during import {}: {}", importItem.getId(), errorMessage);

        if (detailedMessage != null && isDatabaseConstraintError(e)) {
            throw new DataIntegrityViolationException(errorMessage, e);
        } else {
            throw new FailedToProcessImportException(errorMessage);
        }
    }

    private String extractDatabaseErrorMessage(Throwable throwable) {
        if (throwable == null) {
            return null;
        }

        if (throwable instanceof PSQLException) {
            PSQLException psqlEx = (PSQLException) throwable;
            return extractConstraintViolationMessage(psqlEx.getMessage());
        }

        if (throwable instanceof TransactionSystemException) {
            Throwable rootCause = throwable.getCause();
            if (rootCause instanceof RollbackException) {
                return extractDatabaseErrorMessage(rootCause.getCause());
            }
        }

        if (throwable instanceof RollbackException) {
            return extractDatabaseErrorMessage(throwable.getCause());
        }

        if (throwable instanceof GenericJDBCException) {
            GenericJDBCException dbEx = (GenericJDBCException) throwable;
            Throwable cause = dbEx.getCause();
            if (cause instanceof PSQLException) {
                return extractConstraintViolationMessage(cause.getMessage());
            }
            return extractConstraintViolationMessage(dbEx.getMessage());
        }

        return extractDatabaseErrorMessage(throwable.getCause());
    }

    private String extractConstraintViolationMessage(String psqlMessage) {
        if (psqlMessage == null) {
            return "Database constraint violation";
        }

        if (psqlMessage.contains("duplicate key value violates unique constraint")) {
            String constraintName = extractConstraintName(psqlMessage);
            String keyDetails = extractKeyDetails(psqlMessage);

            if (keyDetails != null && constraintName != null) {
                return String.format("Duplicate value violates unique constraint: %s. %s",
                        constraintName, keyDetails);
            } else if (constraintName != null) {
                return String.format("Duplicate value violates unique constraint: %s", constraintName);
            } else {
                return "Duplicate value violates unique constraint";
            }
        }

        if (psqlMessage.contains("violates foreign key constraint")) {
            String constraintName = extractConstraintName(psqlMessage);
            if (constraintName != null) {
                return String.format(
                        "Foreign key constraint violation: %s - referenced entity is connected to this object",
                        constraintName);
            }
            return "Foreign key constraint violation: referenced entity is connected to this object";
        }

        if (psqlMessage.contains("violates check constraint")) {
            return "Check constraint violation: Value does not meet required conditions";
        }

        if (psqlMessage.contains("violates not-null constraint")) {
            return "Not-null constraint violation: Required field is missing";
        }

        String errorPrefix = "ERROR:";
        if (psqlMessage.contains(errorPrefix)) {
            int errorIndex = psqlMessage.indexOf(errorPrefix);
            String errorPart = psqlMessage.substring(errorIndex + errorPrefix.length()).trim();
            int newlineIndex = errorPart.indexOf('\n');
            if (newlineIndex > 0) {
                errorPart = errorPart.substring(0, newlineIndex).trim();
            }
            return errorPart;
        }

        return psqlMessage;
    }

    private String extractConstraintName(String message) {
        int start = message.indexOf('"');
        if (start >= 0) {
            int end = message.indexOf('"', start + 1);
            if (end > start) {
                return message.substring(start + 1, end);
            }
        }
        return null;
    }

    private String extractKeyDetails(String message) {
        String detailPrefix = "Detail:";
        if (message.contains(detailPrefix)) {
            int detailIndex = message.indexOf(detailPrefix);
            String detailPart = message.substring(detailIndex + detailPrefix.length()).trim();
            int newlineIndex = detailPart.indexOf('\n');
            if (newlineIndex > 0) {
                detailPart = detailPart.substring(0, newlineIndex).trim();
            }
            return detailPart;
        }
        return null;
    }

    private boolean isDatabaseConstraintError(Throwable throwable) {
        if (throwable == null) {
            return false;
        }

        if (throwable instanceof PSQLException) {
            String message = throwable.getMessage();
            return message != null && (message.contains("violates unique constraint") ||
                    message.contains("violates foreign key constraint") ||
                    message.contains("violates check constraint") ||
                    message.contains("violates not-null constraint"));
        }

        if (throwable instanceof TransactionSystemException ||
                throwable instanceof RollbackException ||
                throwable instanceof GenericJDBCException) {
            return isDatabaseConstraintError(throwable.getCause());
        }

        return false;
    }

    private ImportStatus determineStatusFromException(ImportBusinessException e) {
        if (e instanceof FileImportValidationException) {
            return ImportStatus.VALIDATION_FAILED;
        } else if (e instanceof NoImportProcessorException) {
            return ImportStatus.FAILED;
        } else if (e instanceof UnableToGetNecessaryFieldException) {
            return ImportStatus.VALIDATION_FAILED;
        }
        return ImportStatus.FAILED;
    }
}
