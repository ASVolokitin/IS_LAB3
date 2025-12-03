package com.ticketis.app.service.fileImport;

import com.ticketis.app.exception.notfoundexception.FileImportRecordNotFoundException;
import com.ticketis.app.model.ImportHistoryItem;
import com.ticketis.app.model.enums.ImportStatus;
import com.ticketis.app.repository.ImportHistoryRepository;
import com.ticketis.app.service.MinioService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class ImportHistoryService {

    private final ImportHistoryRepository importHistoryRepository;
    private final FileOutboxService outboxService;

    public Page<ImportHistoryItem> getImportsPage(Pageable pageable) {
        return importHistoryRepository.findAll(pageable);
    }

    public ImportHistoryItem getImportItemById(Long id) {
        return importHistoryRepository.findById(id)
                .orElseThrow(() -> new FileImportRecordNotFoundException(id));
    }

    public ImportHistoryItem getImportItemNyFilename(String filename) {
        return importHistoryRepository.findByFilename(filename)
                .orElseThrow(() -> new FileImportRecordNotFoundException(filename));
    }

    public ImportHistoryItem createPendingImport(String filename, String entityType) {
        ImportHistoryItem importItem = new ImportHistoryItem();
        importItem.setFilename(UUID.randomUUID() + "_" + filename);
        importItem.setImportStatus(ImportStatus.PENDING);
        importItem.setEntityType(entityType);
        importItem.setResultDescription("Import initiated");

        return importHistoryRepository.save(importItem);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public ImportHistoryItem updateStatus(Long importId, ImportStatus status, String description) {
        log.info("Updating import status to {}", status);
        ImportHistoryItem item = getImportItemById(importId);
        item.setImportStatus(status);
        item.setResultDescription(description != null ? description : status.toString());
        if (status == ImportStatus.FAILED) {
            outboxService.createDeleteEvent(importId, item.getFilename());
            log.info("Compensation: File {} deleted from MinIO due to import failure", item.getFilename());
        }
        return importHistoryRepository.save(item);
    }

    @Transactional
    public void markIncompleteImportsAsFailed() {
        List<ImportStatus> completedStatuses = Arrays.asList(ImportStatus.SUCCESS, ImportStatus.PARTIAL_SUCCESS);
        List<ImportHistoryItem> incompleteItems = importHistoryRepository.findByImportStatusNotIn(completedStatuses);

        if (incompleteItems.isEmpty()) {
            log.info("No incomplete import history items found to mark as failed");
            return;
        }

        log.info("Marking {} incomplete import history items as failed", incompleteItems.size());

        for (ImportHistoryItem item : incompleteItems) {
            ImportStatus previousStatus = item.getImportStatus();
            item.setImportStatus(ImportStatus.FAILED);
            importHistoryRepository.save(item);
            log.debug("Marked import history item {} as failed (previous status: {})", item.getId(), previousStatus);
        }

        log.info("Successfully marked {} import history items as failed", incompleteItems.size());
    }

}