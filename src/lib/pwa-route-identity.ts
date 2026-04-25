import { BUILD_VERSION } from "./emergency-route-recovery";

const CLIENT_PWA_ASSETS = {
  manifest: "/manifest.webmanifest",
  favicon: "/icon-192x192.png",
  appleTouchIcon: "/icon-512x512.png",
};

const ADMIN_PWA_ASSETS = {
  manifest: "/manifest-admin.json",
  favicon: "/icon-admin-512x512.png",
  appleTouchIcon: "/icon-admin-512x512.png",
};

function upsertHeadLink(rel: string, href: string, type?: string) {
  let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;

  if (!link) {
    link = document.createElement("link");
    link.rel = rel;
    document.head.appendChild(link);
  }

  if (type) {
    link.type = type;
  }

  link.href = href;
}

function normalizePathname(pathname: string) {
  if (pathname === "/") return "/";

  const normalized = pathname.replace(/\/+$/, "").toLowerCase();
  return normalized || "/";
}

export function applyRoutePwaIdentity(pathname: string) {
  if (typeof document === "undefined") return;

  const normalizedPath = normalizePathname(pathname);
  const assets = normalizedPath.startsWith("/admin") ? ADMIN_PWA_ASSETS : CLIENT_PWA_ASSETS;

  // Cache-bust so the browser re-reads the correct manifest on install
  const bust = `?v=${encodeURIComponent(BUILD_VERSION)}&mobile_bust=${Date.now()}`;
  upsertHeadLink("manifest", assets.manifest + bust);
  upsertHeadLink("icon", assets.favicon + bust, "image/png");
  upsertHeadLink("apple-touch-icon", assets.appleTouchIcon + bust);
}