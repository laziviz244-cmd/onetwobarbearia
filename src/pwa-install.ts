import {
  BUILD_VERSION,
  resolveAdminPath,
} from "./lib/emergency-route-recovery";
import { applyRoutePwaIdentity } from "./lib/pwa-route-identity";

declare global {
  interface Window {
    __onetwoPwaInstallSetup?: boolean;
    __pwaInstallPrompt?: Event;
  }
}

const LEGACY_SW_CLEANUP_KEY = `onetwo_legacy_sw_cleanup:${BUILD_VERSION}`;

function isOneSignalWorker(scriptURL?: string) {
  return Boolean(scriptURL?.includes("OneSignalSDKWorker.js") || scriptURL?.includes("OneSignalSDK.sw.js"));
}

async function retireLegacyAppServiceWorkers() {
  if (!("serviceWorker" in navigator)) return;

  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map((registration) => registration.update().catch(() => undefined)));
  const outdatedRegistrations = registrations.filter((registration) => {
    const scriptURL = registration.active?.scriptURL || registration.waiting?.scriptURL || registration.installing?.scriptURL;
    return !isOneSignalWorker(scriptURL) || !scriptURL?.includes(BUILD_VERSION);
  });

  if ("caches" in window) {
    const cacheKeys = await caches.keys();
    await Promise.all(cacheKeys.map((key) => caches.delete(key)));
  }

  await Promise.all(
    outdatedRegistrations.map(async (registration) => {
      registration.waiting?.postMessage({ type: "SKIP_WAITING" });
      registration.active?.postMessage({ type: "ONETWO_CLEAR_CACHES", version: BUILD_VERSION });
      await registration.unregister();
    }),
  );

  applyRoutePwaIdentity(resolveAdminPath(window.location.pathname));
}

function requestServiceWorkerUpdates() {
  if (!("serviceWorker" in navigator)) return;

  void navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.update().catch(() => undefined);
    });
  });
}

export async function setupPwaInstall() {
  if (typeof window === "undefined") return;

  if (window.__onetwoPwaInstallSetup) {
    applyRoutePwaIdentity(resolveAdminPath(window.location.pathname));
    return;
  }

  window.__onetwoPwaInstallSetup = true;
  requestServiceWorkerUpdates();

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    window.__pwaInstallPrompt = e;
  });

  const isInIframe = (() => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  })();

  const isPreviewHost =
    window.location.hostname.includes("id-preview--") ||
    window.location.hostname.includes("lovableproject.com");

  if (isPreviewHost || isInIframe) {
    void retireLegacyAppServiceWorkers();
    applyRoutePwaIdentity(resolveAdminPath(window.location.pathname));
    return;
  }

  if (!sessionStorage.getItem(LEGACY_SW_CLEANUP_KEY)) {
    sessionStorage.setItem(LEGACY_SW_CLEANUP_KEY, "1");
    await retireLegacyAppServiceWorkers();
  }

  applyRoutePwaIdentity(resolveAdminPath(window.location.pathname));
}
