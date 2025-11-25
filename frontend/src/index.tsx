import React, { Profiler, ProfilerOnRenderCallback, StrictMode } from "react";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
// import ClickSpark from "./components/decorators/ClickSpark";
import { SqlQueriesPage } from "./components/pages/SqlQueriesPage/SqlQueriesPage";
import { NotFoundPage } from "./components/pages/NotFoundPage/NotFoundPage";
import { CreateTicketPage } from "./components/pages/CreatePage/CreateTicketPage/CreateTicketPage";
import { CreateCoordinatesPage } from "./components/pages/CreatePage/CreateSubobjectPage/CreateCoordinatesPage/CreateCoordinatesPage";
import { CreatePersonPage } from "./components/pages/CreatePage/CreateSubobjectPage/CreatePersonPage/CreatePersonPage";
import { CreateLocationPage } from "./components/pages/CreatePage/CreateSubobjectPage/CreateLocationPage/CreateLocationPage";
import { CreateEventPage } from "./components/pages/CreatePage/CreateSubobjectPage/CreateEventPage/CreateEventPage";
import { CreateVenuePage } from "./components/pages/CreatePage/CreateSubobjectPage/CreateVenuePage/CreateVenuePage";
import { EntitiesDashboard } from "./components/pages/DashboardPage/DashboardPage";
import { CalculateGroupsPage } from "./components/pages/CalculateGroupsPage/CalculateGroupsPage";
import { SellTicketPage } from "./components/pages/SellTicketPage/SellTicketPage";
import MainPage from "./components/pages/MainPage/MainPage";
import { webSocketService } from "./services/webSocketService";
import ReactDOM from "react-dom/client";
import { ImportHistoryPage } from "./components/pages/ImportHistoryPage/ImportHistoryPage";

webSocketService.connect()

window.addEventListener("beforeunload", () => {
  webSocketService.disconnect();
});



const router = createBrowserRouter([
  { path: "/", element: <MainPage /> },
  { path: "/sql", element: <SqlQueriesPage /> },
  { path: "/sql/calculate_groups", element: <CalculateGroupsPage /> },
  { path: "/sql/sell", element: <SellTicketPage /> },
  { path: "/tickets/create", element: <CreateTicketPage /> },
  { path: "/coordinates/create", element: <CreateCoordinatesPage /> },
  { path: "/persons/create", element: <CreatePersonPage /> },
  { path: "/events/create", element: <CreateEventPage /> },
  { path: "/locations/create", element: <CreateLocationPage /> },
  { path: "/venues/create", element: <CreateVenuePage /> },
  { path: "/connected_entities", element: <EntitiesDashboard /> },
  { path: "/import_history", element: <ImportHistoryPage /> },
  { path: "*", element: <NotFoundPage /> },
]);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);

reportWebVitals();
