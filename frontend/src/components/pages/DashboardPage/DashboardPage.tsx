import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { EntityData, EntityType } from "../../../types/ConnectedObject";
import {
  deleteCoordinates,
  deleteEvent,
  deleteLocation,
  deletePerson,
  deleteTicket,
  deleteVenue,
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
import { useEntities } from "../../../hooks/useEntities";
import { devLog } from "../../../services/logger";
import { convertResponseToFormData } from "../../converters/ResponseToFormDataConverter";

export const EntitiesDashboard = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [mappedEntities, setMappedEntities] = useState<EntityData[]>([]);

  const [selectedType, setSelectedType] = useState<EntityType>(() => {
    const saved = localStorage.getItem("selectedType");
    return (saved as EntityType) || "tickets";
  });

  const handleChangeSelectedType = (type: EntityType) => {
    setSelectedType(type)
    localStorage.setItem("selectedType", type);
  }


  const [activeModal, setActiveModal] = useState<{
    type: ModalType | null;
    data: any;
    elementId: number;
  }>({
    type: null,
    data: null,
    elementId: -1
  });

  const closeModal = useCallback(() => {
    setActiveModal({ type: null, data: null, elementId: -1 });
  }, [setActiveModal]);


  const hookedEntities = useEntities(selectedType).entities;

  useEffect(() => {
    if (hookedEntities) {
      const mapped = mapEntitiesByType(hookedEntities, selectedType);
      setMappedEntities(mapped);
    }
  }, [hookedEntities, selectedType]);

  const handleUpdateVenue = async (venueData: any) => {
    updateVenue(activeModal.elementId, venueData)
      .then(() => {
        closeModal();
      })
      .catch((error: any) => {
        const serverErrorMessage =
          error.response?.data?.message || "Update error";
        setError(`ERROR: ${serverErrorMessage}`);
      });
  };

  const handleUpdateEvent = async (eventData: any) => {
    updateEvent(activeModal.elementId, eventData)
      .then(() => {
        closeModal();
      })
      .catch((error: any) => {
        const serverErrorMessage =
          error.response?.data?.message || "Update error";
        setError(`ERROR: ${serverErrorMessage}`);
      });
  };

  const handleUpdateCoordinates = async (coordinatesData: any) => {
    updateCoordinates(activeModal.elementId, coordinatesData)
      .then(() => {
        closeModal();
      })
      .catch((error: any) => {
        const serverErrorMessage =
          error.response?.data?.message || "Update error";
        setError(`ERROR: ${serverErrorMessage}`);
      });
  };

  const handleUpdateLocation = async (locationData: any) => {
    updateLocation(activeModal.elementId, locationData)
      .then(() => {
        closeModal();
      })
      .catch((error: any) => {
        const serverErrorMessage =
          error.response?.data?.message || "Update error";
        setError(`ERROR: ${serverErrorMessage}`);
      });
  };

  const handleUpdatePerson = async (personData: any) => {
    updatePerson(activeModal.elementId, personData)
      .then(() => {
        closeModal();
      })
      .catch((error: any) => {
        const serverErrorMessage =
          error.response?.data?.message || "Update error";
        setError(`ERROR: ${serverErrorMessage}`);
      });
  };

  const handleUpdateTicket = async (ticketData: any) => {
    devLog.log("data to send", activeModal.data);
    updateTicket(activeModal.elementId, ticketData)
      .then(() => {
        closeModal();
      })
      .catch((error: any) => {
        const serverErrorMessage =
          error.response?.data?.message || "Update error";
        setError(`ERROR: ${serverErrorMessage}`);
      });
  };

  // const handleUpdate = async (id: number, type: EntityType, data: any) => {
  //   try {
  //     switch (type) {
  //       case "tickets":
  //         await updateTicket(id, data);
  //         break;
  //       case "coordinates":
  //         await updateCoordinates(id, data);
  //         break;
  //       case "persons":
  //         await updatePerson(id, data);
  //         break;
  //       case "venues":
  //         await updateVenue(id, data);
  //         break;
  //       case "events":
  //         await updateEvent(id, data);
  //         break;
  //       case "locations":
  //         await updateLocation(id, data);
  //         break;
  //       default:
  //         throw new Error(`Unknown entity type: ${type}`);
  //     }
  //   } catch (error: any) {
  //     devLog.error(`Error updating ${type}:`, error);
  //     const serverErrorMessage = error.response.data.message;
  //     setError(serverErrorMessage || "Error");
  //     console.log("ERROR", error);
  //     setTimeout(() => setError(null), 5000);
  //   }
  // }

  const handleDelete = async (id: number, type: EntityType) => {

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
      // setMappedEntities((prev) => prev.filter((entity) => entity.id !== id));
    } catch (error: any) {
      // console.error("Error deleting entity:", error);
      const serverErrorMessage = error.response.data.message;
      setError(serverErrorMessage || "Error");
      // console.log("ERROR", error);
      setTimeout(() => setError(null), 5000);
    }
  };




  const handleEdit = (mappedEntity: EntityData) => {

    const original = hookedEntities.find((e: any) => e.id === mappedEntity.id);
    if (!original) {
      setError(`Original entity not found for id ${mappedEntity.id}`);
      return;
    }

    devLog.log("original: ", original);

    const modalType = `edit${mappedEntity.type.charAt(0).toUpperCase() + mappedEntity.type.slice(1)
      }` as ModalType;

    setActiveModal({
      type: modalType,
      data: convertResponseToFormData(selectedType, original),
      elementId: mappedEntity.id
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
                  className={`sidebar-item ${selectedType === type ? "sidebar-item-active" : ""
                    }`}
                  onClick={() => handleChangeSelectedType(type)}
                >
                  {type}
                </button>
              ))}
              <button className="create-button" onClick={handleCreateNew}>
                + Create new
              </button>
            </nav>


          </aside>

          <main className="content">
            <header className="content-header">
              <h1>{selectedType}</h1>
              <p>Operating {selectedType.toLowerCase()}</p>
            </header>

            <div className="cards-grid">
              {mappedEntities?.map((entity) => (
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
              venueId={activeModal.elementId}
              venueData={activeModal.data}
              onSave={handleUpdateVenue}
            />
          </>
        )}

        {activeModal.type === "editEvents" && (
          <EditEventModal
            isOpen={true}
            onClose={closeModal}
            eventId={activeModal.elementId}
            eventData={activeModal.data}
            onSave={handleUpdateEvent}
          />
        )}

        {activeModal.type === "editCoordinates" && (
          <EditCoordinatesModal
            isOpen={true}
            onClose={closeModal}
            coordinatesId={activeModal.elementId}
            coordinatesData={activeModal.data}
            onSave={handleUpdateCoordinates}
          />
        )}

        {activeModal.type === "editLocations" && (
          <EditLocationModal
            isOpen={true}
            onClose={closeModal}
            locationId={activeModal.elementId}
            locationData={activeModal.data}
            onSave={handleUpdateLocation}
          />
        )}

        {activeModal.type === "editPersons" && (
          <EditPersonModal
            isOpen={true}
            onClose={closeModal}
            personId={activeModal.elementId}
            personData={activeModal.data}
            onSave={handleUpdatePerson}
          />
        )}

        {activeModal.type === "editTickets" && (
          <EditTicketModal
            isOpen={true}
            onClose={closeModal}
            ticketId={activeModal.elementId}
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