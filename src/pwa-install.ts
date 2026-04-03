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

// Dynamic manifest & icons: swap to admin versions when on /admin routes
const isAdminRoute = window.location.pathname.startsWith("/admin");

if (isAdminRoute) {
  // Swap manifest
  const manifestLink = document.querySelector('link[rel="manifest"]');
  if (manifestLink) {
    manifestLink.setAttribute("href", "/manifest-admin.json");
  } else {
    const link = document.createElement("link");
    link.rel = "manifest";
    link.href = "/manifest-admin.json";
    document.head.appendChild(link);
  }

  // Swap favicon
  const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
  if (favicon) {
    favicon.href = "/icon-admin-512x512.png";
  } else {
    const fi = document.createElement("link");
    fi.rel = "icon";
    fi.type = "image/png";
    fi.href = "/icon-admin-512x512.png";
    document.head.appendChild(fi);
  }

  // Swap apple-touch-icon
  const appleIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement | null;
  if (appleIcon) {
    appleIcon.href = "/icon-admin-512x512.png";
  } else {
    const ai = document.createElement("link");
    ai.rel = "apple-touch-icon";
    ai.href = "/icon-admin-512x512.png";
    document.head.appendChild(ai);
  }
}
