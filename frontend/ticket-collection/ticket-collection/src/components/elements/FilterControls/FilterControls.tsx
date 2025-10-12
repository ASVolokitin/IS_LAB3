import {
  FilterField,
  Filter,
} from "../../../interfaces/FilterInterface";
import "./FilterControls.css";

interface FilterControlsProps {
  filters: Filter;
  onFilterChange: (field: FilterField, value: string) => void;
}

export const FilterControls = ({
  filters,
  onFilterChange,
}: FilterControlsProps) => {
  return (
    <div className="filters-container">
      <div className="filter-container">
        <input
          value={filters.ticketNameFilter}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onFilterChange("ticketNameFilter", e.target.value)
          }
          className="glass-input"
          key="filter-ticket-name"
          placeholder="Filter by ticket name"
        />
      </div>
      <div className="filter-container">
        <input
          value={filters.personPassportIDFilter}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onFilterChange("personPassportIDFilter", e.target.value)
          }
          className="glass-input"
          key="filter-person-passportid"
          placeholder="Filter by person passport ID"
        />
      </div>
      <div className="filter-container">
        <input
          value={filters.eventDescriptionFilter}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onFilterChange("eventDescriptionFilter", e.target.value)
          }
          className="glass-input"
          key="filter-event-description"
          placeholder="Filter by event description"
        />
      </div>
      <div className="filter-container">
        <input
          value={filters.venueNameDescription}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onFilterChange("venueNameDescription", e.target.value)
          }
          className="glass-input"
          key="filter-venue-name"
          placeholder="Filter by venue name"
        />
      </div>
      <div className="filter-container">
        <input
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
