import { createRoot } from "react-dom/client";
import { checkVersionAndReload, setupAutoVersionCheck } from "./lib/version-check";
import { setupPwaInstall } from "./pwa-install";
import { initOneSignal } from "./lib/onesignal";
import App from "./App.tsx";
import "./index.css";

async function bootstrap() {
  const shouldRender = await checkVersionAndReload();
  if (!shouldRender) return;

  createRoot(document.getElementById("root")!).render(<App />);

  const runAfterFirstPaint = () => {
    void setupPwaInstall();
    setupAutoVersionCheck();
    initOneSignal();
  };

  if ("requestIdleCallback" in window) {
    (window as any).requestIdleCallback(runAfterFirstPaint, { timeout: 1500 });
  } else {
    setTimeout(runAfterFirstPaint, 250);
  }

  // Prefetch lazy routes during idle to eliminate black flash on tab switch
  const prefetch = () => {
    import("./pages/PlanosPage");
    import("./pages/Perfil");
  };
  if ("requestIdleCallback" in window) {
    (window as any).requestIdleCallback(prefetch, { timeout: 2000 });
  } else {
    setTimeout(prefetch, 1000);
  }
}

void bootstrap();
