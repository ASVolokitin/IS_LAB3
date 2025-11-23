import { useQuery } from "@tanstack/react-query";
import { Ticket } from "../interfaces/Ticket";
import { getTicketsPage } from "../services/api";

interface PaginationResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export const useTicketsPage = (page: number, size: number, enablePolling: boolean = true) => {
  return useQuery<PaginationResponse<Ticket>>({
    queryKey: ["TICKETS_PAGE", page, size],
    queryFn: async (): Promise<PaginationResponse<Ticket>> => {
      const response = await getTicketsPage(page, size);
      return response.data;
    },
    refetchInterval: enablePolling ? 1000 : false, 
    refetchIntervalInBackground: true,
    retry: 1,
  });
};