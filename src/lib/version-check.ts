import { BUILD_VERSION, buildVersionedUrl, clearBrowserRuntimeCaches } from "./emergency-route-recovery";

const VERSION_KEY = "onetwo_app_version";
const RELOAD_FLAG = "onetwo_version_reloaded";
const BUNDLE_HASH_KEY = "onetwo_bundle_hash";
const RELOAD_ATTEMPT_PREFIX = "onetwo_update_reload_attempts";
const MAX_RELOAD_ATTEMPTS_PER_SIGNATURE = 3;
const VERSION_CHECK_INTERVAL_MS = 60_000;

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
      "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
    },
  });

  if (!res.ok) return null;

  return extractBuildSignature(await res.text());
}

async function reloadToLatestVersion(signature = BUILD_VERSION) {
  if (!canAttemptReload(signature)) return false;

  sessionStorage.setItem(RELOAD_FLAG, `${BUILD_VERSION}:${signature}`);
  localStorage.setItem(VERSION_KEY, BUILD_VERSION);
  if (signature) localStorage.setItem(BUNDLE_HASH_KEY, signature);
  await clearBrowserRuntimeCaches();
  window.location.replace(buildVersionedUrl(window.location.pathname, window.location.search, window.location.hash));
  return true;
}

export async function checkVersionAndReload() {
  if (typeof window === "undefined") return true;

  const storedVersion = localStorage.getItem(VERSION_KEY);
  const storedSignature = localStorage.getItem(BUNDLE_HASH_KEY);
  const currentSignature = getCurrentDocumentSignature();

  try {
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
      const versionUrl = buildVersionedUrl("/", `?_vc=${Date.now()}&mobile_bust=${BUILD_VERSION}`);
      const res = await fetch(versionUrl, {
        cache: "reload",
        headers: {
          Accept: "text/html",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
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
