import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainPage from "./components/pages/MainPage/MainPage";
// import ClickSpark from "./components/decorators/ClickSpark";
import { SqlQueriesPage } from "./components/pages/SqlQueriesPage/SqlQueriesPage";
import { NotFoundPage } from "./components/pages/NotFoundPage/NotFoundPage";
import { CreateTicketPage } from "./components/pages/CreatePage/CreateTicketPage/CreateTicketPage";
import { CreateCoordinatesPage } from "./components/pages/CreatePage/CreateSubobjectPage/CreateCoordinatesPage/CreateCoordinatesPage";
import { CreatePersonPage } from "./components/pages/CreatePage/CreateSubobjectPage/CreatePersonPage/CreatePersonPage";
import { CreateLocationPage } from "./components/pages/CreatePage/CreateSubobjectPage/CreateLocationPage/CreateLocationPage";
import { CreateEventPage } from "./components/pages/CreatePage/CreateSubobjectPage/CreateEventPage/CreateEventPage";
import { CreateVenuePage } from "./components/pages/CreatePage/CreateSubobjectPage/CreateVenuePage/CreateVenuePage";

const router = createBrowserRouter([
  { path: "/", element: <MainPage /> },
  { path: "/sql", element: <SqlQueriesPage /> },
  { path: "/tickets/create", element: <CreateTicketPage /> },
  { path: "/coordinates/create", element: <CreateCoordinatesPage /> },
  { path: "/persons/create", element: <CreatePersonPage /> },
  { path: "/events/create", element: <CreateEventPage /> },
  { path: "/locations/create", element: <CreateLocationPage /> },
  { path: "/venues/create", element: <CreateVenuePage /> },
  { path: "*", element: <NotFoundPage /> },
]);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  // <ClickSpark>
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  // </ClickSpark>
);

reportWebVitals();
