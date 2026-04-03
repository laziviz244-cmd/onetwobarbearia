// Capture the beforeinstallprompt event for later use
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  (window as any).__pwaInstallPrompt = e;
});

// Guard against iframe/preview — unregister stale SWs
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
    registrations.forEach((r) => r.unregister());
  });
}

// Dynamic manifest: swap to admin manifest when on /admin routes
const isAdminRoute = window.location.pathname.startsWith("/admin");
const manifestLink = document.querySelector('link[rel="manifest"]');
if (isAdminRoute && manifestLink) {
  manifestLink.setAttribute("href", "/manifest-admin.json");
} else if (isAdminRoute && !manifestLink) {
  const link = document.createElement("link");
  link.rel = "manifest";
  link.href = "/manifest-admin.json";
  document.head.appendChild(link);
}
