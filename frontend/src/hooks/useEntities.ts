import { useCallback, useEffect, useRef, useState } from "react";
import { getAllTickets, getCoordinates, getCoordinatesPage, getEvents, getEventsPage, getImportsPage, getLocations, getLocationsPage, getPersons, getPersonsPage, getTicketsPage, getVenues, getVenuesPage } from "../services/api";
import { EntityType } from "../types/ConnectedObject";
import { webSocketService } from "../services/webSocketService";
import { SortOrder } from "../types/SortOrder";
import { devLog } from "../services/logger";
import { Filter } from "../interfaces/FilterInterface";
import { buildFilterParams } from "../components/elements/FilterControls/FilterControls";
import { WebSocketEvent } from "../types/WebSocketEvent";
import { IMessage } from "@stomp/stompjs";


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
      let pageResponse;
      const startTime = Date.now();
      switch (entityType) {
        case "tickets":
            pageResponse = await getTicketsPage(pageNumber ? pageNumber : 0, pageSize ? pageSize : 5, sortField, sortOrder, filters ? buildFilterParams(filters) : "");
            setEntitiesAmount(pageResponse.data.totalElements);
            response = { data: pageResponse.data.content };
            devLog.log(`[REFRESH] Fetched ${pageResponse.data.content.length} tickets (page ${pageNumber}, size ${pageSize}) in ${Date.now() - startTime}ms`);
            break;

        case "import_history":
          pageResponse = await getImportsPage(pageNumber ? pageNumber : 0, pageSize ? pageSize : 5);
          setEntitiesAmount(pageResponse.data.totalElements);
          response = { data: pageResponse.data.content };
          devLog.log(`[REFRESH] Fetched ${pageResponse.data.content.length} tickets (page ${pageNumber}, size ${pageSize}) in ${Date.now() - startTime}ms`);
          break;

        case "coordinates":
          pageResponse = await getCoordinatesPage(pageNumber ? pageNumber : 0, pageSize ? pageSize : 8);
          response = { data: pageResponse.data.content };
          setEntitiesAmount(pageResponse.data.totalElements);
          devLog.log(`[REFRESH] Fetched coordinates (${response.data.length}) in ${Date.now() - startTime}ms`);
          break;

        case "persons":
          pageResponse = await getPersonsPage(pageNumber ? pageNumber : 0, pageSize ? pageSize : 8);
          response = { data: pageResponse.data.content };
          setEntitiesAmount(pageResponse.data.totalElements);
          devLog.log(`[REFRESH] Fetched persons (${response.data.length}) in ${Date.now() - startTime}ms`);
          break;

        case "locations":
          pageResponse = await getLocationsPage(pageNumber ? pageNumber : 0, pageSize ? pageSize : 8);
          response = { data: pageResponse.data.content };
          setEntitiesAmount(pageResponse.data.totalElements);
          devLog.log(`[REFRESH] Fetched locations (${response.data.length}) in ${Date.now() - startTime}ms`);
          break;

        case "events":
          pageResponse = await getEventsPage(pageNumber ? pageNumber : 0, pageSize ? pageSize : 8);
          response = { data: pageResponse.data.content };
          setEntitiesAmount(pageResponse.data.totalElements);
          devLog.log(`[REFRESH] Fetched events (${response.data.length}) in ${Date.now() - startTime}ms`);
          break;

        case "venues":
          pageResponse = await getVenuesPage(pageNumber ? pageNumber : 0, pageSize ? pageSize : 8);
          response = { data: pageResponse.data.content };
          setEntitiesAmount(pageResponse.data.totalElements);
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
    const subscription = webSocketService.subscribe(`/topic/${entityType}`, (msg: IMessage) => {
      try {
        const event: WebSocketEvent = JSON.parse(msg.body);
        devLog.log(`[WS] Received event for ${entityType}:`, event);
        devLog.log(`[WS] Event type: ${event.eventType}, Entity ID: ${event.entityId}, Timestamp: ${event.timestamp}`);

        refreshEntities();
      } catch (error) {
        devLog.error(`[WS] Error parsing WebSocket message:`, error);
        refreshEntities();
      }
    });
    return () => {
      devLog.log(`[WS] Unsubscribing from topic: /topic/${entityType}`);
      subscription.unsubscribe();
    };
  }, [entityType]);

  return { entities, entitiesAmount, serverError, setServerError };
}

