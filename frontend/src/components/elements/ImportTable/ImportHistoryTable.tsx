import { importTableColumns } from "../../../interfaces/dataRepresentation/importTableColumns";
import { ImportHistoryItem } from "../../../interfaces/ImportHistoryItem";
import { renderCell } from "../../../services/tableUtils";

interface ImportTableProps {
    imports: ImportHistoryItem[];
}

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
                            {importTableColumns.map((col) => (
                                <td key={col.field}>{renderCell(row, col.field)}</td>
                            ))}
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
