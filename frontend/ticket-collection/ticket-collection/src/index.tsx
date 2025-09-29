import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainPage from "./components/pages/MainPage/MainPage";
import ClickSpark from "./components/decorators/ClickSpark";
import { SqlQueriesPage } from "./components/pages/SqlQueriesPage/SqlQueriesPage";
import { NotFoundPage } from "./components/pages/NotFoundPage/NotFoundPage";

const router = createBrowserRouter([
  { path: "/", element: <MainPage /> },
  { path: "/sql", element: <SqlQueriesPage /> },
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
