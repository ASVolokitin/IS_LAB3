import { useQuery } from "@tanstack/react-query";
import { Ticket } from "../interfaces/Ticket";
import { getAllTickets } from "../services/api";

export const useAllTickets = (page: number, size: number, enablePolling: boolean = true) => {
  return useQuery<Ticket[], Error>({
    queryKey: ["ALL_TICKETS", page, size],
    queryFn: async (): Promise<Ticket[]> => {
      const response = await getAllTickets();
      return response.data;
    },
    refetchInterval: enablePolling ? 1000 : false, 
    refetchIntervalInBackground: true,
    retry: 1,
  });
};