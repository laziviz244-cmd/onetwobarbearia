import { createRoot } from "react-dom/client";
import "./pwa-install";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
