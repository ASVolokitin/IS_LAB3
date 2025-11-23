import {
  FilterField,
  Filter,
} from "../../../interfaces/FilterInterface";
import "./FilterControls.css";

interface FilterControlsProps {
  filters: Filter;
  onFilterChange: (field: FilterField, value: string) => void;
}

export function buildFilterParams(filter: Filter): string | undefined {
  const params = new URLSearchParams();

  Object.entries(filter).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      params.append(key, String(value));
    }
  });

  const queryString = params.toString();
  return queryString ? `&${queryString}` : "";
}

export const FilterBar = ({
  filters,
  onFilterChange,
}: FilterControlsProps) => {
  return (
    <div className="filters-container">
      <div className="filter-container">
        <input
          autoComplete="off"
          value={filters.ticketName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onFilterChange("ticketName", e.target.value)
          }
          className="glass-input"
          key="filter-ticket-name"
          placeholder="Filter by ticket name"
        />
      </div>
      <div className="filter-container">
        <input
          autoComplete="off"
          value={filters.personPassportID}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onFilterChange("personPassportID", e.target.value)
          }
          className="glass-input"
          key="filter-person-passportid"
          placeholder="Filter by person passport ID"
        />
      </div>
      <div className="filter-container">
        <input
          autoComplete="off"
          value={filters.eventDescription}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onFilterChange("eventDescription", e.target.value)
          }
          className="glass-input"
          key="filter-event-description"
          placeholder="Filter by event description"
        />
      </div>
      <div className="filter-container">
        <input
          autoComplete="off"
          value={filters.venueName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onFilterChange("venueName", e.target.value)
          }
          className="glass-input"
          key="filter-venue-name"
          placeholder="Filter by venue name"
        />
      </div>
      <div className="filter-container">
        <input
          autoComplete="off"
          value={filters.personLocationName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onFilterChange("personLocationName", e.target.value)
          }
          className="glass-input"
          key="filter-location-name"
          placeholder="Filter by location name"
        />
      </div>
      <button
        className="glass-button"
        onClick={() => {
          (Object.keys(filters) as FilterField[]).forEach(key => {
            onFilterChange(key, '');
          });
        }}>Reset</button>
    </div>
  );
};
