import { createRoot } from "react-dom/client";
import { checkVersionAndReload } from "./lib/version-check";
import "./pwa-install";
import App from "./App.tsx";
import "./index.css";

checkVersionAndReload();

createRoot(document.getElementById("root")!).render(<App />);
