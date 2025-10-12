import { useState } from "react";
import { Ticket } from "../../../interfaces/Ticket";
import React from "react";
import { columns } from "../../../interfaces/dataRepresentation/mainTableColumns";
import { getNestedValue, renderCell } from "../../../services/mainPageUtils";

import "./../Button/Button.css";
import { Filter } from "../../../interfaces/FilterInterface";

interface MainTableProps {
  tickets: Ticket[];
  filters: Filter;
  onTicketDelete: (ticketId: number) => void;
  onTicketDoubleClick: (ticket: Ticket) => void;
}

const MainTable = ({
  tickets,
  filters,
  onTicketDelete,
  onTicketDoubleClick,
}: MainTableProps) => {
  type SortOrder = "asc" | "desc" | null;

  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  const handleSort = (field: string) => {
    if (sortField !== field) {
      setSortField(field);
      setSortOrder("asc");
    } else {
      setSortOrder((prev) =>
        prev === "asc" ? "desc" : prev === "desc" ? null : "asc"
      );
      if (sortOrder === "desc") setSortField(null);
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortField || !sortOrder) return tickets;

    return [...tickets].sort((a, b) => {
      const aValue = getNestedValue(a, sortField);
      const bValue = getNestedValue(b, sortField);

      if (aValue === bValue) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      const aDate = new Date(aValue);
      const bDate = new Date(bValue);
      if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
        return sortOrder === "asc"
          ? aDate.getTime() - bDate.getTime()
          : bDate.getTime() - aDate.getTime();
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      }

      return sortOrder === "asc"
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
  }, [tickets, sortField, sortOrder]);

  return (
    <>
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.field}
                onClick={() => handleSort(col.field)}
                style={{ cursor: "pointer" }}
              >
                {col.label}
                {sortField === col.field
                  ? sortOrder === "asc"
                    ? " ↑"
                    : sortOrder === "desc"
                    ? " ↓"
                    : ""
                  : ""}
              </th>
            ))}
          </tr>
        </thead>
        {sortedData && (
          <tbody>
            {sortedData.map((row) => (
              <tr onDoubleClick={() => onTicketDoubleClick(row)} key={row.id}>
                {columns.map((col) => (
                  <td key={col.field}>{renderCell(row, col.field)}</td>
                ))}
                <td>
                  <div className="button-container">
                    <button
                      className="glass-button"
                      onClick={() => onTicketDelete(row.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        )}
      </table>
      {sortedData.length === 0 && (
          <div style={{textAlign: "center", alignItems: "center", width: "100%"}}>
            <p>No tickets</p>
          </div>
        )}
    </>
  );
};

export default MainTable;
