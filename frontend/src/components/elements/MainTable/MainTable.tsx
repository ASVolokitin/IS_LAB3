import { useState } from "react";
import { Ticket } from "../../../interfaces/Ticket";
import React from "react";
import { columns } from "../../../interfaces/dataRepresentation/mainTableColumns";
import { renderCell } from "../../../services/tableUtils";

import "./../Button/Button.css";
import { Filter } from "../../../interfaces/FilterInterface";
import { SortOrder } from "../../../types/SortOrder";

interface MainTableProps {
  tickets: Ticket[];
  filters: Filter;
  initialSortField: string;
  initialSortOrder: SortOrder
  onSortChange: (sortField: string, sortOrder: SortOrder) => void;
  onTicketDelete: (ticketId: number) => void;
  onTicketDoubleClick: (ticket: Ticket) => void;
}

const MainTable = ({
  tickets,
  filters,
  onSortChange,
  initialSortField,
  initialSortOrder,
  onTicketDelete,
  onTicketDoubleClick,
}: MainTableProps) => {
  

  const [sortField, setSortField] = useState<string | null>(initialSortField);
  const [sortOrder, setSortOrder] = useState<SortOrder>(initialSortOrder);


  const handleSortOrderChange = (field: string) => {
  let newSortField: string | null = field;
  let newSortOrder: SortOrder;

  if (sortField !== field) {
    newSortOrder = "asc";
  } else {
    newSortOrder = sortOrder === "asc" ? "desc" : sortOrder === "desc" ? null : "asc";
    if (sortOrder === "desc") newSortField = null;
  }

  setSortField(newSortField);
  setSortOrder(newSortOrder);

  onSortChange(newSortField ?? "", newSortOrder);
};

  return (
    <>
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.field}
                onClick={() => {handleSortOrderChange(col.field)}}
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
        {tickets && (
          <tbody>
            {tickets.map((row) => (
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
      {tickets.length === 0 && (
          <div style={{textAlign: "center", alignItems: "center", width: "100%"}}>
            <p>No tickets</p>
          </div>
        )}
    </>
  );
};

export default MainTable;
