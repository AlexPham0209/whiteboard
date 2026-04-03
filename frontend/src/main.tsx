import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

export const PORT = import.meta.env.VITE_SERVER_PORT;
export const BACKEND_URL = import.meta.env.PROD ? undefined : `http://localhost:${PORT}`;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
