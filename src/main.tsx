import { createRoot } from "react-dom/client";
import { setupPwaInstall } from "./pwa-install";
import { initOneSignal } from "./lib/onesignal";
import { checkVersionAndReload, setupAutoVersionCheck } from "./lib/version-check";
import App from "./App.tsx";
import "./index.css";

async function renderFreshApp() {
  const canRenderCurrentBundle = await checkVersionAndReload();

  if (!canRenderCurrentBundle) return;

  setupAutoVersionCheck();
  createRoot(document.getElementById("root")!).render(<App />);
  bootstrap();
}

void renderFreshApp();

function bootstrap() {
  const runAfterFirstPaint = () => {
    void setupPwaInstall();
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
