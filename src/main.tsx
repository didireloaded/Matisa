import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { Analytics } from "@/lib/analytics";
import { onesignalAdapter, logIntegrationDiagnostics } from "@/integrations";

// Initialize third-party integrations & log dev diagnostic report
Analytics.init();
onesignalAdapter.init();
logIntegrationDiagnostics();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
