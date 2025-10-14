import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { EntityData, EntityType } from "../../../types/ConnectedObject";
import {
  deleteCoordinates,
  deleteEvent,
  deleteLocation,
  deletePerson,
  deleteTicket,
  deleteVenue,
  getCoordinates,
  getEvents,
  getLocations,
  getPersons,
  getAllTickets,
  getVenues,
  updateCoordinates,
  updateEvent,
  updateLocation,
  updatePerson,
  updateTicket,
  updateVenue,
} from "../../../services/api";
import { mapEntitiesByType } from "../../../services/mapToEntity";
import { EntityCard } from "../../elements/Card/ConnectedObjectCard/ConnectedObjectCard";
import "./DashboardPage.css";
import NavBar from "../../elements/NavBar/NavBar";
import { Notification } from "../../elements/Notification/Notification";
import { EditVenueModal } from "../../elements/Modal/EditVenueModal/EditVenueModal";
import { EditEventModal } from "../../elements/Modal/EditEventModal/EditEventModal";
import { ModalType } from "../../../types/ModalType";
import { EditCoordinatesModal } from "../../elements/Modal/EditCoordinatesModal/EditCoordinatesModal";
import { EditLocationModal } from "../../elements/Modal/EditLocationModal/EditLocationModal";
import { EditPersonModal } from "../../elements/Modal/EditPersonModal/EditPersonModal";
import { EditTicketModal } from "../../elements/Modal/EditTicketModal/EditTicketModal";

export const EntitiesDashboard = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<EntityType>("tickets");
  const [entities, setEntities] = useState<EntityData[]>([]);

  const [activeModal, setActiveModal] = useState<{
    type: ModalType | null;
    data: any;
  }>({
    type: null,
    data: null,
  });

  const closeModal = () => {
    setActiveModal({ type: null, data: null });
  };


  useEffect(() => {
    loadEntities(selectedType);
    console.log("loaded entites", entities);
    const intervalId = setInterval(() => {
    loadEntities(selectedType);
  }, 1000);
    return () => clearInterval(intervalId);
    
  }, [selectedType]);

  const loadEntities = async (type: EntityType) => {
    if (type === undefined) return [];
    try {
      let response;
      
      switch (type) {
        case "tickets":
          
          response = await getAllTickets();
          break;
        case "coordinates":
          
          response = await getCoordinates();
          break;
        case "persons":
          response = await getPersons();
          break;
        case "venues":
          response = await getVenues();
          break;
        case "events":
          response = await getEvents();
          break;
        case "locations":
          response = await getLocations();
          break;
        default:
          console.log(type);
          throw new Error(`Unknown entity type: ${type}`);
      }

      const mappedEntities = mapEntitiesByType(response?.data, type);
      setEntities(mappedEntities);
      console.log("mapped entities", mappedEntities);
    } catch (error: any) {
      console.error("Error loading entities:", error);
      setError(error.response?.data?.message || "Error");
      console.log("ERROR", error);
      setTimeout(() => setError(null), 5000);
      setEntities([]);
    } 
  };

  const handleUpdateVenue = async (venueData: any) => {
    updateVenue(activeModal.data.id, venueData)
      .then(() => {
        closeModal();
        loadEntities("venues");
      })
      .catch((error: any) => {
        const serverErrorMessage =
          error.response?.data?.message || "Update error";
        setError(`ERROR: ${serverErrorMessage}`);
      });
  };

  const handleUpdateEvent = async (eventData: any) => {
    updateEvent(activeModal.data.id, eventData)
      .then(() => {
        closeModal();
        loadEntities("events");
      })
      .catch((error: any) => {
        const serverErrorMessage =
          error.response?.data?.message || "Update error";
        setError(`ERROR: ${serverErrorMessage}`);
      });
  };

  const handleUpdateCoordinates = async (coordinatesData: any) => {
    updateCoordinates(activeModal.data.id, coordinatesData)
      .then(() => {
        closeModal();
        loadEntities("coordinates");
      })
      .catch((error: any) => {
        const serverErrorMessage =
          error.response?.data?.message || "Update error";
        setError(`ERROR: ${serverErrorMessage}`);
      });
  };

  const handleUpdateLocation = async (locationData: any) => {
    updateLocation(activeModal.data.id, locationData)
      .then(() => {
        closeModal();
        loadEntities("locations");
      })
      .catch((error: any) => {
        const serverErrorMessage =
          error.response?.data?.message || "Update error";
        setError(`ERROR: ${serverErrorMessage}`);
      });
  };

  const handleUpdatePerson = async (personData: any) => {
    updatePerson(activeModal.data.id, personData)
      .then(() => {
        closeModal();
        loadEntities("persons");
      })
      .catch((error: any) => {
        const serverErrorMessage =
          error.response?.data?.message || "Update error";
        setError(`ERROR: ${serverErrorMessage}`);
      });
  };

  const handleUpdateTicket = async (ticketData: any) => {
    updateTicket(activeModal.data.id, ticketData)
      .then(() => {
        closeModal();
        loadEntities("tickets");
      })
      .catch((error: any) => {
        const serverErrorMessage =
          error.response?.data?.message || "Update error";
        setError(`ERROR: ${serverErrorMessage}`);
      });
  };

  const handleDelete = async (id: number, type: EntityType) => {
    // if (!window.confirm("Are you sure you`re going to delete this object?"))
    //   return;

    try {
      switch (type) {
        case "tickets":
          await deleteTicket(id);
          break;
        case "coordinates":
          await deleteCoordinates(id);
          break;
        case "persons":
          await deletePerson(id);
          break;
        case "venues":
          await deleteVenue(id);
          break;
        case "events":
          await deleteEvent(id);
          break;
        case "locations":
          await deleteLocation(id);
          break;
        default:
          throw new Error(`Unknown entity type: ${type}`);
      }
      setEntities((prev) => prev.filter((entity) => entity.id !== id));
    } catch (error: any) {
      console.error("Error deleting entity:", error);
      const serverErrorMessage = error.response.data.message;
      setError(serverErrorMessage || "Error");
      console.log("ERROR", error);
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleEdit = (entity: EntityData) => {
    let modalData;

    console.log("entity", entity);

    switch (entity.type) {
      case "venues":
        modalData = {
          id: entity.id,
          name: entity.title,
          capacity: entity.data.capacity,
          type: entity.data.type,
        };
        break;
      case "events":
        modalData = {
          id: entity.id,
          name: entity.title,
          description: entity.description,
          eventType: entity.data.type,
          minAge: entity.data.minAge === "No restrictions" ? "" : entity.data.minAge,
          date: entity.data.date,
        };
        break;
      case "coordinates":
        modalData = {
          id: entity.id,
          x: entity.data.x,
          y: entity.data.y,
        };
        break;
        case "locations":
        modalData = {
          id: entity.id,
          x: entity.data.x,
          y: entity.data.y,
          z: entity.data.z,
          name: entity.title
        };
        break;
        case "persons":
        modalData = {
          id: entity.id,
          eyeColor: entity.data.eyeColor,
          hairColor: entity.data.hairColor,
          locationId: entity.data.locationId,
          passportID: entity.data.passportID,
          nationality: entity.data.nationality
        };
        break;

        case "tickets":
        modalData = {
          id: entity.id,
          name: entity.title,
          price: entity.data.price,
          number: entity.data.number,
          discount: entity.data.discount ? parseFloat(entity.data.discount.replace("%", "")) : null,
          refundable: entity.data.refundable ? "Yes" : "No",
          type: entity.data.type === "Not defined" ? "" : entity.data.type,
          coordinatesId: entity.data.coordinatesId,
          venueId: entity.data.venueId,
          personId: entity.data.personId,
          eventId: entity.data.eventId
        };
        break;
      default:
        modalData = entity;
    }
    
    const modalType = `edit${
      entity.type.charAt(0).toUpperCase() + entity.type.slice(1)
    }` as ModalType;

    setActiveModal({
      type: modalType,
      data: modalData,
    });

  };

  const handleCreateNew = () => {
    navigate(`/${selectedType}/create`);
  };
  return (
    <>
      <NavBar />
      <div className="dashboard-page">
        <div className="dashboard-container">
          <aside className="sidebar">

            <nav className="sidebar-nav">
              {(
                [
                  "tickets",
                  "persons",
                  "venues",
                  "coordinates",
                  "events",
                  "locations"
                ] as EntityType[]
              ).map((type) => (
                <button
                  key={type}
                  className={`sidebar-item ${
                    selectedType === type ? "sidebar-item-active" : ""
                  }`}
                  onClick={() => setSelectedType(type)}
                >
                  {type}
                </button>
              ))}
            </nav>

            <button className="create-button" onClick={handleCreateNew}>
              + Create new
            </button>
          </aside>

          <main className="content">
            <header className="content-header">
              <h1>{selectedType}</h1>
              <p>Operating {selectedType.toLowerCase()}</p>
            </header>

              <div className="cards-grid">
                {entities.map((entity) => (
                  <EntityCard
                    key={entity.id}
                    entity={entity}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
          </main>
        </div>
        {activeModal.type === "editVenues" && (
          <>
            <EditVenueModal
              isOpen={true}
              onClose={closeModal}
              venueId={activeModal.data.id}
              venueData={activeModal.data}
              onSave={handleUpdateVenue}
            />
          </>
        )}

        {activeModal.type === "editEvents" && (
          <EditEventModal
            isOpen={true}
            onClose={closeModal}
            eventId={activeModal.data.id}
            eventData={activeModal.data}
            onSave={handleUpdateEvent}
          />
        )}

        {activeModal.type === "editCoordinates" && (
          <EditCoordinatesModal
            isOpen={true}
            onClose={closeModal}
            coordinatesId={activeModal.data.id}
            coordinatesData={activeModal.data}
            onSave={handleUpdateCoordinates}
          />
        )}

        {activeModal.type === "editLocations" && (
          <EditLocationModal
            isOpen={true}
            onClose={closeModal}
            locationId={activeModal.data.id}
            locationData={activeModal.data}
            onSave={handleUpdateLocation}
          />
        )}

        {activeModal.type === "editPersons" && (
          <EditPersonModal
            isOpen={true}
            onClose={closeModal}
            personId={activeModal.data.id}
            personData={activeModal.data}
            onSave={handleUpdatePerson}
          />
        )}

        {activeModal.type === "editTickets" && (
          <EditTicketModal
            isOpen={true}
            onClose={closeModal}
            ticketId={activeModal.data.id}
            ticketData={activeModal.data}
            onSave={handleUpdateTicket}
          />
        )}

        {error && (
          <Notification
            message={error}
            type="error"
            isVisible={true}
            onClose={() => setError(null)}
          />
        )}
      </div>
    </>
  );
};