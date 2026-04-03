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

export function applyRoutePwaIdentity(pathname: string) {
  if (typeof document === "undefined") return;

  const assets = pathname.startsWith("/admin") ? ADMIN_PWA_ASSETS : CLIENT_PWA_ASSETS;

  upsertHeadLink("manifest", assets.manifest);
  upsertHeadLink("icon", assets.favicon, "image/png");
  upsertHeadLink("apple-touch-icon", assets.appleTouchIcon);
}