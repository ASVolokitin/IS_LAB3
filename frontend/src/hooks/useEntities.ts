import { useCallback, useEffect, useRef, useState } from "react";
import { getAllTickets, getCoordinates, getEvents, getLocations, getPersons, getTicketsPage, getVenues } from "../services/api";
import { EntityType } from "../types/ConnectedObject";
import { webSocketService } from "../services/webSocketService";
import { SortOrder } from "../types/SortOrder";
import { devLog } from "../services/logger";
import { Filter } from "../interfaces/FilterInterface";
import { buildFilterParams } from "../components/elements/FilterControls/FilterControls";


export function useEntities<T>(
  entityType: EntityType,
  pageNumber?: number,
  pageSize?: number,
  sortField?: string,
  sortOrder?: SortOrder,
  filters?: Filter
) {
  const [entities, setEntities] = useState<T[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const [entitiesAmount, setEntitiesAmount] = useState<number>(-1);

  const paramsRef = useRef({ pageNumber, pageSize, sortField, sortOrder, filters });

  useEffect(() => {
    paramsRef.current = { pageNumber, pageSize, sortField, sortOrder, filters };
  }, [pageNumber, pageSize, sortField, sortOrder, filters]);


  const refreshEntities = useCallback(async () => {

    const { pageNumber, pageSize, sortField, sortOrder, filters } = paramsRef.current;

    if (!entityType) return;
    try {
      let response;
      const startTime = Date.now();
      switch (entityType) {
        case "tickets":
          if (pageNumber !== undefined && pageSize !== undefined) {
            const pageResponse = await getTicketsPage(pageNumber, pageSize, sortField, sortOrder, filters ? buildFilterParams(filters) : "");
            setEntitiesAmount(pageResponse.data.totalElements);
            response = { data: pageResponse.data.content };
            devLog.log(`[REFRESH] Fetched ${pageResponse.data.content.length} tickets (page ${pageNumber}, size ${pageSize}) in ${Date.now() - startTime}ms`);
            break;
          } else {
            response = await getAllTickets();
            devLog.log(`[REFRESH] Fetched all tickets (${response.data.length}) in ${Date.now() - startTime}ms`);
            break;
          }
        case "coordinates":
          response = await getCoordinates();
          devLog.log(`[REFRESH] Fetched coordinates (${response.data.length}) in ${Date.now() - startTime}ms`);
          break;

        case "persons":
          response = await getPersons();
          devLog.log(`[REFRESH] Fetched persons (${response.data.length}) in ${Date.now() - startTime}ms`);
          break;

        case "locations":
          response = await getLocations();
          devLog.log(`[REFRESH] Fetched locations (${response.data.length}) in ${Date.now() - startTime}ms`);
          break;

        case "events":
          response = await getEvents();
          devLog.log(`[REFRESH] Fetched events (${response.data.length}) in ${Date.now() - startTime}ms`);
          break;

        case "venues":
          response = await getVenues();
          devLog.log(`[REFRESH] Fetched venues (${response.data.length}) in ${Date.now() - startTime}ms`);
          break;
      }

      setEntities(response?.data);
    } catch (err: any) {
      devLog.error(`[REFRESH] Error refreshing ${entityType}:`, err);
      setServerError(err.response?.data?.message || "Error");
      setEntities([]);
    }
  }, [entityType])



  useEffect(() => {
    refreshEntities();
  }, [pageNumber, pageSize, filters, sortField, sortOrder])

  useEffect(() => {
    refreshEntities();
    const subscription = webSocketService.subscribe(`/topic/${entityType}`, () => {
      devLog.log(`[WS] Refreshing entities for type: ${entityType}`);
      refreshEntities();
    });
    return () => {
      devLog.log(`[WS] Unsubscribing from topic: /topic/${entityType}`);
      subscription.unsubscribe();
    };
  }, [entityType]);

  return { entities, entitiesAmount, serverError, setServerError };
}

