import { BUILD_VERSION, buildVersionedUrl, clearBrowserRuntimeCaches } from "./emergency-route-recovery";

const VERSION_KEY = "onetwo_app_version";
const RELOAD_FLAG = "onetwo_version_reloaded";
const BUNDLE_HASH_KEY = "onetwo_bundle_hash";
const VERSION_CHECK_INTERVAL_MS = 60_000;

function extractBuildSignature(html: string) {
  const assetMatches = [...html.matchAll(/assets\/[\w.-]+-([a-zA-Z0-9_-]+)\.(?:js|css)/g)].map((match) => match[1]);
  return assetMatches.length ? assetMatches.sort().join("|") : null;
}

async function reloadToLatestVersion() {
  sessionStorage.setItem(RELOAD_FLAG, BUILD_VERSION);
  localStorage.setItem(VERSION_KEY, BUILD_VERSION);
  await clearBrowserRuntimeCaches();
  window.location.replace(buildVersionedUrl(window.location.pathname, window.location.search, window.location.hash));
}

export async function checkVersionAndReload() {
  if (typeof window === "undefined") return true;

  if (sessionStorage.getItem(RELOAD_FLAG) === BUILD_VERSION) return true;

  const storedVersion = localStorage.getItem(VERSION_KEY);

  if (storedVersion && storedVersion !== BUILD_VERSION) {
    await reloadToLatestVersion();
    return false;
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
      const res = await fetch(`/?_vc=${Date.now()}`, { cache: "no-store", headers: { Accept: "text/html" } });
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
