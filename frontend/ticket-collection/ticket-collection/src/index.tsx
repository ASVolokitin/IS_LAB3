import React from "react";
import ReactDOM from "react-dom/client";
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
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./config/react-query";
import MainPage from "./components/pages/MainPage/MainPage";


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
  { path: "*", element: <NotFoundPage /> },
]);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);

reportWebVitals();
