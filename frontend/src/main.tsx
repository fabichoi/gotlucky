import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AppWrapper from "./AppWrapper";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./main.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppWrapper />
  </StrictMode>
);
