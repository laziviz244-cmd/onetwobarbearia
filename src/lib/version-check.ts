import { BUILD_VERSION, buildVersionedUrl, clearBrowserRuntimeCaches } from "./emergency-route-recovery";

const VERSION_KEY = "onetwo_app_version";
const RELOAD_FLAG = "onetwo_version_reloaded";
const BUNDLE_HASH_KEY = "onetwo_bundle_hash";
const PRE_RELOAD_BUNDLE_HASH_KEY = "onetwo_pre_reload_bundle_hash";
const RELOAD_ATTEMPT_PREFIX = "onetwo_update_reload_attempts";
const MAX_RELOAD_ATTEMPTS_PER_SIGNATURE = 3;
const VERSION_CHECK_INTERVAL_MS = 60_000;
const MOBILE_BOOTSTRAP_REFRESH_KEY = `onetwo_mobile_bootstrap_refresh:${BUILD_VERSION}`;
const RUNTIME_CACHE_PREFIXES = ["onetwo", "workbox", "runtime", "precache", "html", "assets", "js", "css", "font", "image", "onesignal"];

async function fetchRemoteBuildVersion() {
  const res = await fetch(`/version.json?v=${Date.now()}&mobile_bust=${Date.now()}`, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0, proxy-revalidate, s-maxage=0",
      Pragma: "no-cache",
      Expires: "0",
    },
  });

  if (!res.ok) return null;

  const data = await res.json().catch(() => null);
  return typeof data?.version === "string" ? data.version : null;
}

function extractBuildSignature(html: string) {
  const assetMatches = [...html.matchAll(/assets\/[\w.-]+-([a-zA-Z0-9_-]+)\.(?:js|css)/g)].map((match) => match[1]);
  const devMatches = [...html.matchAll(/\/src\/main\.tsx\?t=([0-9]+)/g)].map((match) => match[1]);

  if (devMatches.length) return devMatches.sort().join("|");
  return assetMatches.length ? assetMatches.sort().join("|") : null;
}

function getCurrentDocumentSignature() {
  if (typeof document === "undefined") return null;

  const resourceMarkup = [
    ...Array.from(document.scripts).map((script) => script.src),
    ...Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"][href]')).map((link) => link.href),
  ].join("\n");

  return extractBuildSignature(resourceMarkup);
}

function canAttemptReload(signature: string) {
  const attemptKey = `${RELOAD_ATTEMPT_PREFIX}:${signature}`;
  const attempts = Number(sessionStorage.getItem(attemptKey) || "0");

  if (attempts >= MAX_RELOAD_ATTEMPTS_PER_SIGNATURE) return false;

  sessionStorage.setItem(attemptKey, String(attempts + 1));
  return true;
}

async function fetchLatestBuildSignature() {
  const versionUrl = buildVersionedUrl("/", `?_vc=${Date.now()}&mobile_bust=${Date.now()}&ngsw-bypass=1`);
  const res = await fetch(versionUrl, {
    cache: "no-store",
    headers: {
      Accept: "text/html",
      "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0, proxy-revalidate, s-maxage=0",
      Pragma: "no-cache",
      Expires: "0",
    },
  });

  if (!res.ok) return null;

  return extractBuildSignature(await res.text());
}

async function reloadToLatestVersion(signature = BUILD_VERSION) {
  if (!canAttemptReload(signature)) return false;

  const currentSignature = getCurrentDocumentSignature();
  if (currentSignature && currentSignature !== signature) {
    localStorage.setItem(PRE_RELOAD_BUNDLE_HASH_KEY, currentSignature);
  }

  sessionStorage.setItem(RELOAD_FLAG, `${BUILD_VERSION}:${signature}`);
  localStorage.setItem(VERSION_KEY, BUILD_VERSION);
  if (signature) localStorage.setItem(BUNDLE_HASH_KEY, signature);
  await clearBrowserRuntimeCaches();
  window.location.replace(buildVersionedUrl(window.location.pathname, window.location.search, window.location.hash));
  return true;
}

async function forceMobileBootstrapRefresh() {
  const isTouchDevice = navigator.maxTouchPoints > 0 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (!isTouchDevice || sessionStorage.getItem(MOBILE_BOOTSTRAP_REFRESH_KEY)) return false;

  const hasPersistentSession = [
    "onetwo_user",
    "onetwo_guest_name",
    "barber_admin_session",
  ].some((key) => localStorage.getItem(key));

  const isVersionedNavigation = new URLSearchParams(window.location.search).get("v") === BUILD_VERSION;
  if (!hasPersistentSession || isVersionedNavigation) return false;

  sessionStorage.setItem(MOBILE_BOOTSTRAP_REFRESH_KEY, "1");
  await clearBrowserRuntimeCaches();
  window.location.replace(buildVersionedUrl(window.location.pathname, window.location.search, window.location.hash));
  return true;
}

export async function checkVersionAndReload() {
  if (typeof window === "undefined") return true;

  if (!(await verifyPostReloadCacheIntegrity())) return false;

  if (await forceMobileBootstrapRefresh()) return false;

  const storedVersion = localStorage.getItem(VERSION_KEY);
  const storedSignature = localStorage.getItem(BUNDLE_HASH_KEY);
  const currentSignature = getCurrentDocumentSignature();

  try {
    const remoteVersion = await fetchRemoteBuildVersion();
    if (remoteVersion && remoteVersion !== BUILD_VERSION) {
      const isReloading = await reloadToLatestVersion(remoteVersion);
      return !isReloading;
    }

    const latestSignature = await fetchLatestBuildSignature();

    if (latestSignature) {
      const hasNewerDocument = currentSignature && latestSignature !== currentSignature;
      const hasNewerStoredSignature = storedSignature && latestSignature !== storedSignature;

      if (hasNewerDocument || hasNewerStoredSignature) {
        const isReloading = await reloadToLatestVersion(latestSignature);
        return !isReloading;
      }

      localStorage.setItem(BUNDLE_HASH_KEY, latestSignature);
    }
  } catch {
    // Network error, continue with local version checks.
  }

  if (storedVersion && storedVersion !== BUILD_VERSION) {
    const isReloading = await reloadToLatestVersion(BUILD_VERSION);
    return !isReloading;
  }

  localStorage.setItem(VERSION_KEY, BUILD_VERSION);
  return true;
}

function getLoadedResourceUrls() {
  const domUrls = [
    ...Array.from(document.scripts).map((script) => script.src),
    ...Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"][href]')).map((link) => link.href),
  ].filter(Boolean);

  const performanceUrls = typeof performance?.getEntriesByType === "function"
    ? performance.getEntriesByType("resource").map((entry) => entry.name)
    : [];

  return [...domUrls, ...performanceUrls];
}

function resourcePointsToSignature(url: string, signature: string) {
  return url.includes(`-${signature}.js`) || url.includes(`-${signature}.css`) || url.includes(`/${signature}.js`) || url.includes(`/${signature}.css`);
}

async function hasStaleServiceWorker() {
  if (!("serviceWorker" in navigator)) return false;

  const registrations = await navigator.serviceWorker.getRegistrations();
  return registrations.some((registration) => {
    const scriptURL = registration.active?.scriptURL || registration.waiting?.scriptURL || registration.installing?.scriptURL || "";
    return Boolean(scriptURL && !scriptURL.includes(BUILD_VERSION));
  });
}

async function hasRuntimeCaches() {
  if (!("caches" in window)) return false;
  return (await caches.keys()).length > 0;
}

async function clearRuntimeCachesByPrefix(extraSignatures: string[] = []) {
  if (!("caches" in window)) return [];

  const cacheKeys = await caches.keys();
  const signatures = extraSignatures.filter(Boolean).map((signature) => signature.toLowerCase());
  const deletedKeys = cacheKeys.filter((key) => {
    const normalizedKey = key.toLowerCase();
    return RUNTIME_CACHE_PREFIXES.some((prefix) => normalizedKey.startsWith(prefix) || normalizedKey.includes(`-${prefix}`))
      || signatures.some((signature) => normalizedKey.includes(signature));
  });

  await Promise.all(deletedKeys.map((key) => caches.delete(key)));
  return deletedKeys;
}

export async function verifyPostReloadCacheIntegrity() {
  if (typeof window === "undefined" || typeof document === "undefined") return true;

  const oldSignature = localStorage.getItem(PRE_RELOAD_BUNDLE_HASH_KEY);
  const reloadMarker = sessionStorage.getItem(RELOAD_FLAG);
  if (!oldSignature || !reloadMarker) return true;

  try {
    await clearRuntimeCachesByPrefix([oldSignature, localStorage.getItem(BUNDLE_HASH_KEY) || "", BUILD_VERSION]);

    const urls = getLoadedResourceUrls();
    const hasOldBundleReference = urls.some((url) => resourcePointsToSignature(url, oldSignature));
    const staleServiceWorker = await hasStaleServiceWorker();
    const runtimeCachesRemain = await hasRuntimeCaches();

    if (hasOldBundleReference || staleServiceWorker || runtimeCachesRemain) {
      const isReloading = await reloadToLatestVersion(localStorage.getItem(BUNDLE_HASH_KEY) || BUILD_VERSION);
      return !isReloading;
    }

    localStorage.removeItem(PRE_RELOAD_BUNDLE_HASH_KEY);
    return true;
  } catch {
    return true;
  }
}

/**
 * Checks for a newer deployed version by fetching index.html and comparing
 * the BUILD_VERSION baked into the JS bundle reference.
 * If a new version is found, clears caches and reloads.
 */
export function setupAutoVersionCheck() {
  if (typeof window === "undefined") return;

  let checking = false;

  const check = async () => {
    if (checking) return;
    checking = true;

    try {
      const remoteVersion = await fetchRemoteBuildVersion();
      if (remoteVersion && remoteVersion !== BUILD_VERSION) {
        await reloadToLatestVersion(remoteVersion);
        return;
      }

      const versionUrl = buildVersionedUrl("/", `?_vc=${Date.now()}&mobile_bust=${BUILD_VERSION}`);
      const res = await fetch(versionUrl, {
        cache: "reload",
        headers: {
          Accept: "text/html",
          "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0, proxy-revalidate, s-maxage=0",
          Pragma: "no-cache",
          Expires: "0",
        },
      });
      if (!res.ok) return;
      const html = await res.text();
      const buildSignature = extractBuildSignature(html);
      const storedSignature = localStorage.getItem(BUNDLE_HASH_KEY);

      if (buildSignature && storedSignature && buildSignature !== storedSignature) {
        localStorage.setItem(BUNDLE_HASH_KEY, buildSignature);
        await reloadToLatestVersion();
        return;
      }

      if (buildSignature) {
        localStorage.setItem(BUNDLE_HASH_KEY, buildSignature);
      }
    } catch {
      // Network error, skip silently
    } finally {
      checking = false;
    }
  };

  void check();

  window.setInterval(() => {
    if (!document.hidden && navigator.onLine !== false) {
      void check();
    }
  }, VERSION_CHECK_INTERVAL_MS);

  // Check when app becomes visible (user opens/switches to app)
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      check();
    }
  });

  // Check when PWA regains focus
  window.addEventListener("focus", () => {
    check();
  });
}
