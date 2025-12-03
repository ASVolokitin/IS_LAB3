package com.ticketis.app.repository;

import com.ticketis.app.model.FileOutbox;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface FileOutboxRepository extends JpaRepository<FileOutbox, Long> {
    
    @Query("SELECT f FROM FileOutbox f WHERE f.processedAt IS NULL ORDER BY f.createdAt ASC")
    List<FileOutbox> findUnprocessedEvents();
    
    @Modifying
    @Query("UPDATE FileOutbox f SET f.processedAt = :processedAt WHERE f.id = :id")
    void markAsProcessed(@Param("id") Long id, @Param("processedAt") Instant processedAt);
    
    List<FileOutbox> findByImportHistoryId(Long importHistoryId);
    
    @Query("SELECT f FROM FileOutbox f WHERE f.processedAt < :before AND f.operation = 'UPLOAD'")
    List<FileOutbox> findProcessedUploadsBefore(@Param("before") Instant before);
}