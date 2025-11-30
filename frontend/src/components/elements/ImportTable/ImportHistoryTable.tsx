import { useState } from "react";
import { importTableColumns } from "../../../interfaces/dataRepresentation/importTableColumns";
import { ImportHistoryItem } from "../../../interfaces/ImportHistoryItem";
import { ImportBatch } from "../../../interfaces/ImportBatch";
import { renderCell } from "../../../services/tableUtils";
import { getImportDownloadUrl } from "../../../services/api";
import "../../../sharedStyles/Table.css";
import { devLog } from "../../../services/logger";

interface ImportTableProps {
    imports: ImportHistoryItem[];
    getBatches: (importHistoryId: number) => ImportBatch[];
    isLoading: (importHistoryId: number) => boolean;
    refreshBatches: (importHistoryId: number) => void;
}

const renderStatusCell = (status: any) => {
    const statusStr = String(status || "");
    const statusUpper = statusStr.toUpperCase();
    
    if (statusUpper === "PROCESSING" || statusUpper === "FILE_UPLOADED" || 
        statusUpper === "SYNC_IMPORT_STARTED" || statusUpper === "ASYNC_IMPORT_STARTED") {
        return (
            <div className="status-cell status-processing">
                <div className="loading-spinner"></div>
                <span>{statusStr}</span>
            </div>
        );
    }
    
    let statusClass = "status-cell";
    if (statusUpper === "SUCCESS") {
        statusClass += " status-success";
    } else if (statusUpper === "FAILED" || statusUpper === "VALIDATION_FAILED") {
        statusClass += " status-failed";
    } else if (statusUpper === "PENDING") {
        statusClass += " status-pending";
    } else if (statusUpper === "PARTIAL_SUCCESS") {
        statusClass += " status-partial";
    } else {
        statusClass += " status-default";
    }
    
    return (
        <div className={statusClass}>
            <span>{statusStr}</span>
        </div>
    );
};

const renderDescriptionCell = (description: any) => {
    const descriptionStr = String(description || "");
    return (
        <div className="description-cell">
            {descriptionStr || "No description"}
        </div>
    );
};

const renderBatchStatus = (status: string) => {
    const statusUpper = String(status || "").toUpperCase();
    let statusClass = "batch-status";
    
    if (statusUpper === "COMPLETED" || statusUpper === "SUCCESS") {
        statusClass += " batch-status-success";
    } else if (statusUpper === "FAILED" || statusUpper === "ERROR") {
        statusClass += " batch-status-failed";
    } else if (statusUpper === "PROCESSING" || statusUpper === "IN_PROGRESS") {
        statusClass += " batch-status-processing";
    } else if (statusUpper === "PENDING") {
        statusClass += " batch-status-pending";
    }
    
    return (
        <span className={statusClass}>{status}</span>
    );
};

const BatchRow = ({ batch }: { batch: ImportBatch }) => {
    const progress = batch.totalRecords > 0 
        ? Math.round((batch.processedRecords / batch.totalRecords) * 100) 
        : 0;
    
    return (
        <tr className="batch-row">
            <td></td>
            <td>Batch #{batch.batchNumber}</td>
            <td>{renderBatchStatus(batch.batchStatus)}</td>
            <td>
                <div className="batch-progress">
                    <span>{batch.processedRecords} / {batch.totalRecords}</span>
                    <div className="batch-progress-bar">
                        <div 
                            className="batch-progress-fill" 
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            </td>
            <td>{batch.batchSize}</td>
            <td></td>
        </tr>
    );
};

export const ImportHistoryTable = ({ imports, getBatches, isLoading, refreshBatches }: ImportTableProps) => {
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

    const handleDownload = (importId: number) => {
        const downloadUrl = getImportDownloadUrl(importId);
        window.open(downloadUrl, "_blank");
    };

    const toggleRow = (importId: number) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(importId)) {
                newSet.delete(importId);
            } else {
                newSet.add(importId);
                if (!isLoading(importId)) {
                    refreshBatches(importId);
                }
            }
            return newSet;
        });
    };

    console.log("imports", imports);

    return (
        <table>
            <thead>
                <tr>
                    {importTableColumns.map((col) => (
                        <th
                            key={col.field}
                            style={{ cursor: "pointer" }}
                        >
                            {col.label}
                        </th>
                    ))}
                    <th>File</th>
                    <th>Batches</th>
                </tr>
            </thead>
            {imports && (
                <tbody>
                    {imports.map((row) => {
                        devLog.log(row);
                        const isExpanded = expandedRows.has(row.id);
                        const batches = getBatches(row.id);
                        
                        return (
                            <>
                                <tr key={row.id}>
                                    {importTableColumns.map((col) => {
                                        if (col.field === "importStatus") {
                                            return (
                                                <td key={col.field}>
                                                    {renderStatusCell(renderCell(row, col.field))}
                                                </td>
                                            );
                                        } else if (col.field === "resultDescription") {
                                            return (
                                                <td key={col.field} className="description-td">
                                                    {renderDescriptionCell(renderCell(row, col.field))}
                                                </td>
                                            );
                                        } else {
                                            return <td key={col.field}>{renderCell(row, col.field)}</td>;
                                        }
                                    })}
                                    <td>
                                        <div className="button-container">
                                            <button
                                                onClick={() => handleDownload(row.id)}
                                                className="download-btn"
                                            >
                                                Download
                                            </button>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="button-container">
                                            <button
                                                onClick={() => toggleRow(row.id)}
                                                className="batch-toggle-btn"
                                            >
                                                {isExpanded ? "Hide" : "Show"} Batches
                                                {batches.length > 0 && ` (${batches.length})`}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                {isExpanded && (
                                    <>
                                        { batches.length === 0 ? (
                                            <tr>
                                                <td colSpan={importTableColumns.length + 1} style={{ textAlign: "center", padding: "1rem" }}>
                                                    No batches found
                                                </td>
                                            </tr>
                                        ) : (
                                            <>
                                                <tr className="batch-header-row">
                                                    <td colSpan={importTableColumns.length + 1}>
                                                        <strong>Batches ({batches.length}):</strong>
                                                    </td>
                                                </tr>
                                                {batches.map((batch) => (
                                                    <BatchRow key={batch.id} batch={batch} />
                                                ))}
                                            </>
                                        )}
                                    </>
                                )}
                            </>
                        );
                    })}
                </tbody>
            )}
        </table>
    );
}
