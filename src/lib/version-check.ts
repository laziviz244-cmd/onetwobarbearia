import { BUILD_VERSION, buildVersionedUrl, clearBrowserRuntimeCaches } from "./emergency-route-recovery";

const VERSION_KEY = "onetwo_app_version";
const RELOAD_FLAG = "onetwo_version_reloaded";

export async function checkVersionAndReload() {
  if (typeof window === "undefined") return true;

  if (sessionStorage.getItem(RELOAD_FLAG) === BUILD_VERSION) return true;

  const storedVersion = localStorage.getItem(VERSION_KEY);

  if (storedVersion && storedVersion !== BUILD_VERSION) {
    sessionStorage.setItem(RELOAD_FLAG, BUILD_VERSION);
    localStorage.setItem(VERSION_KEY, BUILD_VERSION);
    await clearBrowserRuntimeCaches();
    window.location.replace(buildVersionedUrl(window.location.pathname, window.location.search, window.location.hash));
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

  const check = async () => {
    try {
      const res = await fetch(`/?_vc=${Date.now()}`, { cache: "no-store", headers: { Accept: "text/html" } });
      if (!res.ok) return;
      const html = await res.text();
      // Look for the main JS entry with a hash – if it changed, there's a new deploy
      const match = html.match(/assets\/index-([a-zA-Z0-9]+)\.js/);
      const storedHash = localStorage.getItem("onetwo_bundle_hash");
      if (match && storedHash && match[1] !== storedHash) {
        // New version detected
        localStorage.setItem("onetwo_bundle_hash", match[1]);
        await clearBrowserRuntimeCaches();
        window.location.reload();
        return;
      }
      if (match) {
        localStorage.setItem("onetwo_bundle_hash", match[1]);
      }
    } catch {
      // Network error, skip silently
    }
  };

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
