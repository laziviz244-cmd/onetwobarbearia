const ONETWO_CACHE_RESET = "force-refresh-2026-04-25-universal-cache-bust-05";

async function clearAllRuntimeCaches() {
  const keys = await caches.keys();
  await Promise.all(keys.map((key) => caches.delete(key)));
}

function freshUrl(url) {
  const next = new URL(url);
  next.searchParams.set("cache", ONETWO_CACHE_RESET);
  next.searchParams.set("mobile_bust", Date.now().toString());
  return next.toString();
}

self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(clearAllRuntimeCaches());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      clearAllRuntimeCaches(),
      self.clients.claim(),
      self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
        clients.forEach((client) => client.postMessage({ type: "ONETWO_SW_UPDATED", version: ONETWO_CACHE_RESET }));
      }),
    ]),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING" || event.data?.type === "ONETWO_CLEAR_CACHES") {
    self.skipWaiting();
    event.waitUntil(clearAllRuntimeCaches());
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isCriticalAsset = ["document", "script", "style", "worker", "manifest"].includes(request.destination);

  if (isSameOrigin && (request.mode === "navigate" || isCriticalAsset)) {
    event.respondWith(
      fetch(freshUrl(request.url), {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache, no-store, must-revalidate", Pragma: "no-cache" },
      }).catch(() => fetch(freshUrl(request.url), { cache: "reload" })),
    );
  }
});

importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");

self.registration?.update?.();
