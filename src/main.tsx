import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import "./pwa-install";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
