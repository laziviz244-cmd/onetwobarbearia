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
