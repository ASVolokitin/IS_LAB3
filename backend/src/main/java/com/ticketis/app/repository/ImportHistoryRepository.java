package com.ticketis.app.repository;

import com.ticketis.app.model.ImportHistoryItem;
import com.ticketis.app.model.enums.ImportStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ImportHistoryRepository extends JpaRepository<ImportHistoryItem, Long> {
    Optional<ImportHistoryItem> findByFilename(String filename);
    
    List<ImportHistoryItem> findByImportStatusNotIn(List<ImportStatus> statuses);

}
