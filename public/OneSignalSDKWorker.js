const ONETWO_CACHE_RESET = "force-refresh-2026-04-25-existing-users";

self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key)))),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key)))),
      self.clients.claim(),
    ]),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING" || event.data?.type === "ONETWO_CLEAR_CACHES") {
    self.skipWaiting();
    event.waitUntil(caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key)))));
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isCriticalAsset = ["document", "script", "style", "worker", "manifest"].includes(request.destination);

  if (isSameOrigin && (request.mode === "navigate" || isCriticalAsset)) {
    event.respondWith(
      fetch(request, { cache: "no-store" }).catch(() => fetch(`${url.pathname}?cache=${ONETWO_CACHE_RESET}`, { cache: "reload" })),
    );
  }
});

importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");
