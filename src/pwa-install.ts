import {
  BUILD_VERSION,
  buildVersionedUrl,
  resolveAdminPath,
} from "./lib/emergency-route-recovery";
import { applyRoutePwaIdentity } from "./lib/pwa-route-identity";

declare global {
  interface Window {
    __onetwoPwaInstallSetup?: boolean;
    __pwaInstallPrompt?: Event;
  }
}

const PAGE_RESTORE_KEY = `onetwo_pageshow_reload:${BUILD_VERSION}`;
const LEGACY_SW_CLEANUP_KEY = `onetwo_legacy_sw_cleanup:${BUILD_VERSION}`;
const SW_UPDATE_RELOAD_KEY = `onetwo_sw_update_reload:${BUILD_VERSION}`;

function isOneSignalWorker(scriptURL?: string) {
  return Boolean(scriptURL?.includes("OneSignalSDKWorker.js") || scriptURL?.includes("OneSignalSDK.sw.js"));
}

async function retireLegacyAppServiceWorkers() {
  if (!("serviceWorker" in navigator)) return;

  const registrations = await navigator.serviceWorker.getRegistrations();
  const legacyRegistrations = registrations.filter((registration) => {
    const scriptURL = registration.active?.scriptURL || registration.waiting?.scriptURL || registration.installing?.scriptURL;
    return !isOneSignalWorker(scriptURL);
  });

  if ("caches" in window) {
    const cacheKeys = await caches.keys();
    await Promise.all(cacheKeys.map((key) => caches.delete(key)));
  }

  await Promise.all(
    legacyRegistrations.map(async (registration) => {
      registration.waiting?.postMessage({ type: "SKIP_WAITING" });
      await registration.unregister();
    }),
  );

  const controllerURL = navigator.serviceWorker.controller?.scriptURL;
  if (legacyRegistrations.length > 0 || (controllerURL && !isOneSignalWorker(controllerURL))) {
    window.location.replace(buildVersionedUrl(window.location.pathname, window.location.search, window.location.hash));
  }
}

function setupServiceWorkerUpdateReload() {
  if (!("serviceWorker" in navigator)) return;

  navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data?.type !== "ONETWO_SW_UPDATED" || sessionStorage.getItem(SW_UPDATE_RELOAD_KEY)) return;

    sessionStorage.setItem(SW_UPDATE_RELOAD_KEY, "1");
    window.location.replace(buildVersionedUrl(window.location.pathname, window.location.search, window.location.hash));
  });
}

export async function setupPwaInstall() {
  if (typeof window === "undefined") return;

  if (window.__onetwoPwaInstallSetup) {
    applyRoutePwaIdentity(resolveAdminPath(window.location.pathname));
    return;
  }

  window.__onetwoPwaInstallSetup = true;
  setupServiceWorkerUpdateReload();

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
    return;
  }

  window.addEventListener("pageshow", (event) => {
    if (!event.persisted || sessionStorage.getItem(PAGE_RESTORE_KEY)) return;

    sessionStorage.setItem(PAGE_RESTORE_KEY, "1");
    window.location.replace(buildVersionedUrl(window.location.pathname, window.location.search, window.location.hash));
  });

  applyRoutePwaIdentity(resolveAdminPath(window.location.pathname));
}
