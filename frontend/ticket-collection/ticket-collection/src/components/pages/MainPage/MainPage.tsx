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
import { useAllTickets } from "../../../hooks/useAllTickets";
import { queryClient } from "../../../config/react-query";
import { useTicketsPage } from "../../../hooks/useTicketsPage";
import { filterTickets } from "../../../services/ticketsFilter";

const MainPage = () => {
  const [activeTicketId, setActiveTicketId] = useState<number>(0);
  const [dataPage, setDataPage] = useState<number>(0);
  const [maxPageValue, setMaxPageValue] = useState<number>(0);
  const [dataSize] = useState<number>(5);
  const [status, setStatus] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>("");

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

  const {
    data: allTickets,
    isError: isAllTicketsFetchError,
    error: allTicketsFetchError,
  } = useAllTickets(dataPage, dataSize);

  const {
    data: allTicketsPage,
    isError: isAllTicketsPageFetchError,
    error: allTicketsPageFetchError,
  } = useTicketsPage(dataPage, dataSize);

  const computedFilteredTickets = useMemo(
    () => filterTickets(allTickets || [], filters),
    [allTickets, filters]
  );

  const computedFilteredTicketsPage = useMemo(
    () => filterTickets(allTicketsPage?.content || [], filters),
    [allTicketsPage, filters]
  );

  const updateFilter = (fieldName: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  useEffect(() => {
    setMaxPageValue(
      Math.floor(
        computedFilteredTickets
          ? computedFilteredTickets.length / dataSize -
              Number(!Boolean(computedFilteredTickets.length % dataSize))
          : 0
      )
    );
  }, [allTickets, dataSize, computedFilteredTickets]);
  const handleDeleteTicket = async (ticketId: number) => {
    try {
      await deleteTicket(ticketId);
      await queryClient.invalidateQueries({ queryKey: ["ALL_TICKETS"] });
      await queryClient.invalidateQueries({ queryKey: ["TICKETS_PAGE"] });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateTicket = async (ticketData: any) => {
    try {
      await updateTicket(activeModal.data.id, ticketData);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["ALL_TICKETS"] }),
        queryClient.invalidateQueries({ queryKey: ["TICKETS_PAGE"] }),
      ]);
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
        tickets={computedFilteredTicketsPage}
        filters={filters}
        onTicketDelete={handleDeleteTicket}
        onTicketDoubleClick={handleTicketDoubleClick}
      />
      <PageNav
        page={dataPage}
        size={dataSize}
        ticketsAmount={computedFilteredTickets.length}
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
      {isAllTicketsFetchError && (
        <Notification
          message={allTicketsFetchError.message}
          type="error"
          isVisible={true}
          onClose={() => console.log(allTicketsFetchError)}
        />
      )}

      {isAllTicketsPageFetchError && (
        <Notification
          message={allTicketsPageFetchError.message}
          type="error"
          isVisible={true}
          onClose={() => console.log(allTicketsPageFetchError)}
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