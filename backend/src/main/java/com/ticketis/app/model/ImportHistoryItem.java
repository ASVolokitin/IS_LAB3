package com.ticketis.app.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.ticketis.app.converter.ImportStatusConverter;
import com.ticketis.app.dto.jms.ImportBatchEntity;
import com.ticketis.app.model.enums.ImportStatus;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@Table(name = "import_history")
public class ImportHistoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "filename", nullable = false, length = 255)
    private String filename;

    @Column(name = "entity_type", nullable = false, length = 50)
    private String entityType;

    @Column(name = "imported_at", nullable = false, updatable = false)
    private LocalDateTime importedAt;

    @PrePersist
    protected void onCreate() {
        if (importedAt == null) {
            importedAt = LocalDateTime.now();
        }
    }

    @Convert(converter = ImportStatusConverter.class)
    @Column(name = "import_status", nullable = false)
    private ImportStatus importStatus;

    @Column(name = "result_description", length = 1024)
    private String resultDescription = "-";

    @Column(name = "total_records")
    private Integer totalRecords;

    @Column(name = "processed_records")
    private Integer processedRecords;

    @Column(name = "error_count")
    private Integer errorCount;

    @JsonManagedReference
    @OneToMany(mappedBy = "importHistoryItem", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ImportBatchEntity> batches;

    public void addBatch(ImportBatchEntity batch) {
        this.batches.add(batch);
        batch.setImportHistoryItem(this);
    }
}