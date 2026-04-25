const FORCE_UPDATE_TAG = "force-refresh-2026-04-25-mobile-logged-users-02";

export const BUILD_VERSION = `${import.meta.env.VITE_BUILD_TIMESTAMP || Date.now().toString()}-${FORCE_UPDATE_TAG}`;

export const ADMIN_ROUTE_ALIASES: Record<string, string> = {
  "/agenda": "/admin/agenda",
  "/financeiro": "/admin/financeiro",
  "/relatorios": "/admin/relatorios",
  "/configuracoes": "/admin/configuracoes",
};

const HARD_RELOAD_PREFIX = "onetwo_hard_reload";

export function normalizePathname(pathname: string) {
  if (pathname === "/") return "/";

  const normalized = pathname.replace(/\/+$/, "").toLowerCase();
  return normalized || "/";
}

export function resolveAdminPath(pathname: string) {
  const normalized = normalizePathname(pathname);
  return ADMIN_ROUTE_ALIASES[normalized] ?? normalized;
}

export function isAdminLikePath(pathname: string) {
  const resolved = resolveAdminPath(pathname);

  return (
    resolved === "/admin" ||
    resolved.startsWith("/admin/") ||
    resolved === "/dashboard" ||
    resolved.startsWith("/dashboard/")
  );
}

export function buildVersionedUrl(pathname: string, search = "", hash = "") {
  const url = new URL(window.location.origin + resolveAdminPath(pathname) + search + hash);
  url.searchParams.set("v", BUILD_VERSION);
  url.searchParams.set("cache", FORCE_UPDATE_TAG);
  url.searchParams.set("mobile_bust", Date.now().toString());
  return url.toString();
}

export async function clearBrowserRuntimeCaches() {
  if (typeof window === "undefined") return;

  try {
    if ("caches" in window) {
      const cacheKeys = await caches.keys();
      await Promise.all(cacheKeys.map((key) => caches.delete(key)));
    }
  } catch {
    // Ignore cache cleanup failures.
  }

  try {
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();

      await Promise.all(
        registrations.map(async (registration) => {
          registration.waiting?.postMessage({ type: "SKIP_WAITING" });
          await registration.unregister();
        }),
      );
    }
  } catch {
    // Ignore service worker cleanup failures.
  }
}

export async function hardReloadOnce(
  tag: string,
  pathname = window.location.pathname,
  search = window.location.search,
  hash = window.location.hash,
) {
  if (typeof window === "undefined") return false;

  const resolvedPath = resolveAdminPath(pathname);
  const flag = `${HARD_RELOAD_PREFIX}:${BUILD_VERSION}:${tag}:${resolvedPath}`;

  if (sessionStorage.getItem(flag)) return false;

  sessionStorage.setItem(flag, "1");
  await clearBrowserRuntimeCaches();
  window.location.replace(buildVersionedUrl(resolvedPath, search, hash));
  return true;
}

export function requestServiceWorkerUpdate(registration?: ServiceWorkerRegistration | null) {
  if (!registration) return;

  registration.waiting?.postMessage({ type: "SKIP_WAITING" });
  void registration.update();
}