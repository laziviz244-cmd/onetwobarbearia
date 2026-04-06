import { createRoot } from "react-dom/client";
import { checkVersionAndReload } from "./lib/version-check";
import { setupPwaInstall } from "./pwa-install";
import App from "./App.tsx";
import "./index.css";

async function bootstrap() {
  const shouldRender = await checkVersionAndReload();
  if (!shouldRender) return;

  await setupPwaInstall();
  createRoot(document.getElementById("root")!).render(<App />);
}

void bootstrap();
