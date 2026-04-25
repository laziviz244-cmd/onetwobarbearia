import {
  BUILD_VERSION,
  buildVersionedUrl,
  hardReloadOnce,
  isAdminLikePath,
  requestServiceWorkerUpdate,
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
const SW_TAKEOVER_KEY = `onetwo_sw_takeover_reload:${BUILD_VERSION}`;

export async function setupPwaInstall() {
  if (typeof window === "undefined") return;

  if (window.__onetwoPwaInstallSetup) {
    applyRoutePwaIdentity(resolveAdminPath(window.location.pathname));
    return;
  }

  window.__onetwoPwaInstallSetup = true;

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
    navigator.serviceWorker?.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => registration.unregister());
    });

    applyRoutePwaIdentity(resolveAdminPath(window.location.pathname));
    return;
  }

  window.addEventListener("pageshow", (event) => {
    if (!event.persisted || sessionStorage.getItem(PAGE_RESTORE_KEY)) return;

    sessionStorage.setItem(PAGE_RESTORE_KEY, "1");
    window.location.replace(buildVersionedUrl(window.location.pathname, window.location.search, window.location.hash));
  });

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (sessionStorage.getItem(SW_TAKEOVER_KEY)) return;

      sessionStorage.setItem(SW_TAKEOVER_KEY, "1");
      window.location.replace(buildVersionedUrl(window.location.pathname, window.location.search, window.location.hash));
    });

    const registrations = await navigator.serviceWorker.getRegistrations();
    registrations.forEach(requestServiceWorkerUpdate);

    const hasWaitingWorker = registrations.some((registration) => Boolean(registration.waiting));
    if (hasWaitingWorker) {
      await hardReloadOnce(isAdminLikePath(window.location.pathname) ? "admin-deep-link" : "client-sw-waiting");
      return;
    }

    const refreshServiceWorkers = () => {
      navigator.serviceWorker.getRegistrations().then((activeRegistrations) => {
        activeRegistrations.forEach(requestServiceWorkerUpdate);
      });
    };

    window.addEventListener("focus", refreshServiceWorkers);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") refreshServiceWorkers();
    });
  }

  applyRoutePwaIdentity(resolveAdminPath(window.location.pathname));
}
