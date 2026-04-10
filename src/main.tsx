import { createRoot } from "react-dom/client";
import { checkVersionAndReload, setupAutoVersionCheck } from "./lib/version-check";
import { setupPwaInstall } from "./pwa-install";
import { initOneSignal } from "./lib/onesignal";
import App from "./App.tsx";
import "./index.css";

async function bootstrap() {
  const shouldRender = await checkVersionAndReload();
  if (!shouldRender) return;

  await setupPwaInstall();
  setupAutoVersionCheck();
  initOneSignal();
  createRoot(document.getElementById("root")!).render(<App />);
}

void bootstrap();
