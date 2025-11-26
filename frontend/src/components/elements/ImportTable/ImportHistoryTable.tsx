import { importTableColumns } from "../../../interfaces/dataRepresentation/importTableColumns";
import { ImportHistoryItem } from "../../../interfaces/ImportHistoryItem";
import { renderCell } from "../../../services/tableUtils";
import "../../../sharedStyles/Table.css";

interface ImportTableProps {
    imports: ImportHistoryItem[];
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

export const ImportHistoryTable = ({ imports }: ImportTableProps) => {

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
                </tr>
            </thead>
            {imports && (
                <tbody>
                    {imports.map((row) => (
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

                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            )}
        </table>

        )
    }
