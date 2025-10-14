import "../../../sharedStyles/Table.css";

import MainTable from "../../elements/MainTable/MainTable";
import { NavBar } from "../../elements/NavBar/NavBar";
import { ModalType } from "../../../types/ModalType";
import { useEffect, useMemo, useState } from "react";
import {
  deleteTicket,
  updateTicket,
} from "../../../services/api";
import { FilterControls } from "../../elements/FilterControls/FilterControls";
import { Filter } from "../../../interfaces/FilterInterface";
import { Ticket } from "../../../interfaces/Ticket";
import { Notification } from "../../elements/Notification/Notification";
import { EditTicketModal } from "../../elements/Modal/EditTicketModal/EditTicketModal";
import { TicketFormData } from "../../../interfaces/formData/TicketFormData";
import { PageNav } from "../../elements/PageNav/PageNav";
import { queryClient } from "../../../config/react-query";
import { useEntities } from "../../../hooks/useEntities";
import { SortOrder } from "../../../types/SortOrder";
import { devLog } from "../../../services/logger";
import { QuerySort } from "../../../interfaces/QuerySort";

const MainPage = () => {
  const [activeTicketId, setActiveTicketId] = useState<number>(0);
  const [dataPage, setDataPage] = useState<number>(0);
  const [maxPageValue, setMaxPageValue] = useState<number>(0);
  const [dataSize] = useState<number>(2);
  const [status, setStatus] = useState<string | null>(null);
  const [sort, setSort] = useState<QuerySort>({
    sortField: "id",
    sortOrder: "asc"
  })


  const [filters, setFilters] = useState<Filter>({
    ticketNameFilter: "",
    personPassportIDFilter: "",
    eventDescriptionFilter: "",
    venueNameDescription: "",
    personLocationName: "",
  });

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

  const handleTicketDoubleClick = (ticket: Ticket) => {
    setActiveTicketId(ticket.id);
    setActiveModal({
      type: "editTickets",
      data: ticket,
    });
  };

 

  const handleSortChange = (sortField: string, sortOrder: SortOrder) => {
    setSort({ sortField, sortOrder });
    devLog.log("Changed sorting: ", sortField, sortOrder);

  }

  const page = useMemo(() => ({ page: dataPage, size: dataSize }), [dataPage, dataSize]);

  const { entities: tickets, serverError, setServerError, entitiesAmount } = useEntities<Ticket>("tickets", dataPage, dataSize, sort.sortField, sort.sortOrder);

  const updateFilter = (fieldName: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  useEffect(() => {
    setMaxPageValue(
      Math.floor(
        tickets
          ? entitiesAmount / dataSize -
          Number(!Boolean(entitiesAmount % dataSize))
          : 0
      )
    );
  }, [tickets, dataSize]);
  const handleDeleteTicket = async (ticketId: number) => {
    try {
      await deleteTicket(ticketId);
    } catch (err: any) {
      const serverErrorMessage = err.response?.data?.message || "Delete error";
      setServerError(serverErrorMessage);
    }
  };

  const handleUpdateTicket = async (ticketData: any) => {
    try {
      await updateTicket(activeModal.data.id, ticketData);
    } catch (err: any) {
      const serverErrorMessage = err.response?.data?.message || "Update error";
      setServerError(serverErrorMessage);
    }
  };

  const handlePageChange = (page: number) => {
    const minPageValue = 0;
    setDataPage(Math.max(Math.min(page, maxPageValue), minPageValue));
  };

  const transformTicketToFormData = (ticket: Ticket): TicketFormData => {
    return {
      name: ticket.name,
      coordinatesId: ticket.coordinates.id.toString(),
      personId: ticket.person?.id?.toString() || null,
      eventId: ticket.event?.id?.toString() || null,
      price: ticket.price.toString(),
      type: ticket.type || null,
      discount: ticket.discount?.toString() || null,
      number: ticket.number.toString(),
      refundable: ticket.refundable.toString(),
      venueId: ticket.venue.id.toString(),
    };
  };


  return (
    <>
      <NavBar />
      <FilterControls filters={filters} onFilterChange={updateFilter} />
      <MainTable
        tickets={tickets}
        filters={filters}
        initialSortField={sort.sortField}
        initialSortOrder={sort.sortOrder}
        onSortChange={handleSortChange}
        onTicketDelete={handleDeleteTicket}
        onTicketDoubleClick={handleTicketDoubleClick}
      />
      <PageNav
        page={page.page}
        size={page.size}
        ticketsAmount={entitiesAmount}
        onPageChange={handlePageChange}
      />
      {activeModal.type === "editTickets" && (
        <EditTicketModal
          isOpen={true}
          onClose={closeModal}
          ticketId={activeTicketId}
          ticketData={transformTicketToFormData(activeModal.data)}
          onSave={handleUpdateTicket}
        />
      )}
      {serverError && (
        <Notification
          message={serverError}
          type="error"
          isVisible={true}
          onClose={() => setServerError(null)}
        />
      )}
      {status && (
        <Notification
          message={status}
          type="success"
          isVisible={true}
          onClose={() => setStatus(null)}
        />
      )}
    </>
  );
};

export default MainPage