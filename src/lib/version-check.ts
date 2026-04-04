const VERSION_KEY = "onetwo_app_version";
const RELOAD_FLAG = "onetwo_version_reloaded";

// Build timestamp injected by Vite at build time
const BUILD_VERSION = import.meta.env.VITE_BUILD_TIMESTAMP || Date.now().toString();

export function checkVersionAndReload() {
  // Prevent infinite reload loops — only reload once per version mismatch
  if (sessionStorage.getItem(RELOAD_FLAG) === BUILD_VERSION) return;

  const storedVersion = localStorage.getItem(VERSION_KEY);

  if (storedVersion && storedVersion !== BUILD_VERSION) {
    // Version mismatch detected — store flag, update version, and reload
    sessionStorage.setItem(RELOAD_FLAG, BUILD_VERSION);
    localStorage.setItem(VERSION_KEY, BUILD_VERSION);
    window.location.reload();
    return;
  }

  // First visit or same version — just store it
  localStorage.setItem(VERSION_KEY, BUILD_VERSION);
}
