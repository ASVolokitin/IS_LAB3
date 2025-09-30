import { useEffect, useState } from "react";
import { Ticket } from "../../../interfaces/Ticket";
import { deleteTicket, getTickets } from "../../../services/api";
import React from "react";
import { columns } from "../../../interfaces/dataRepresentation/mainTableCoumns";
import { getNestedValue, renderCell } from "../../../services/mainPageUtils";

import "./../Button/Button.css";

const MainTable = () => {
  type SortOrder = "asc" | "desc" | null;

  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);
  const [data, setData] = useState<Ticket[]>([]);

  const updateTickets = () => {
    getTickets()
      .then((res) => {
        setData(res.data);
        console.log(res.data);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    updateTickets();
  }, []);

  const handleDelete = async (ticketId: number) => {
    try {
      await deleteTicket(ticketId);
      await updateTickets();
    } catch (err) {
      console.error(err);
    }
  };

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
    if (!sortField || !sortOrder) return data;

    return [...data].sort((a, b) => {
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
  }, [data, sortField, sortOrder]);

  return (
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
      <tbody>
        {sortedData.map((row) => (
          <tr
            key={row.id}
          >
            {columns.map((col) => (
              <td key={col.field}>{renderCell(row, col.field)}</td>
            ))}
            <td>
              <div className="button-container">
                <button
                  className="glass-button"
                  onClick={() => handleDelete(row.id)}
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default MainTable;
