import { useCallback, useEffect, useState, useRef } from "react";
import {
  getAllTickets,
  getCoordinates,
  getEvents,
  getLocations,
  getPersons,
  getTicketsPage,
  getVenues,
} from "../services/api";
import { webSocketService } from "../services/webSocketService";
import { EntityType } from "../types/ConnectedObject";
import { SortOrder } from "../types/SortOrder";
import { devLog } from "../services/logger";

export function useEntities<T>(
  entityType: EntityType,
  pageNumber?: number,
  pageSize?: number,
  sortField?: string,
  sortOrder?: SortOrder
) {
  const [entities, setEntities] = useState<T[]>([]);
  const [entitiesAmount, setEntitiesAmount] = useState<number>(-1);
  const [serverError, setServerError] = useState<string | null>(null);

  const wsSubscribed = useRef(false);

  const refreshEntities = useCallback(async () => {
    if (!entityType) return;
    try {
      let response;
      switch (entityType) {
        case "tickets":
          if (pageNumber !== undefined && pageSize !== undefined) {
            const pageResponse = await getTicketsPage(
              pageNumber,
              pageSize,
              sortField,
              sortOrder
            );
            setEntitiesAmount(pageResponse.data.totalElements);
            response = { data: pageResponse.data.content };
          } else {
            response = await getAllTickets();
          }
          break;

        case "coordinates":
          response = await getCoordinates();
          break;

        case "events":
          response = await getEvents();
          break;

        case "locations":
          response = await getLocations();
          break;

        case "persons":
          response = await getPersons();
          break;

        case "venues":
          response = await getVenues();
          break;
      }
      setEntities(response?.data || []);
      setServerError(null);
    } catch (err: any) {
      setServerError(err.response?.data?.message || "Error");
      setEntities([]);
    }
  }, [entityType, pageNumber, pageSize, sortField, sortOrder]);

  useEffect(() => {
    refreshEntities();
  }, [sortField, sortOrder]);

  useEffect(() => {
    return () => webSocketService.disconnect();
  }, [])
  
  useEffect(() => {
    if (wsSubscribed.current) return;
    webSocketService.connect();

    const subscription = webSocketService.subscribe(
      `/topic/${entityType}`,
      () => {
        refreshEntities();
        devLog.log("refetching ..");
      }
    );

    wsSubscribed.current = true;

    return () => subscription.unsubscribe();
  }, [entityType, refreshEntities]);

  return { entities, entitiesAmount, serverError, setServerError };
}
