import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

const buildTimestamp = Date.now().toString();
const forceUpdateTag = "force-refresh-2026-04-25-mobile-logged-users-04";
const fullBuildVersion = `${buildTimestamp}-${forceUpdateTag}`;

const earlyVersionGuard = `
    <script>
      (function () {
        var buildVersion = "${fullBuildVersion}";
        var versionKey = "onetwo_html_build_version";
        var reloadKey = "onetwo_html_reload:" + buildVersion;
        window.__ONETWO_BUILD_VERSION__ = buildVersion;
        try {
          var stored = localStorage.getItem(versionKey);
          if (stored && stored !== buildVersion && !sessionStorage.getItem(reloadKey)) {
            sessionStorage.setItem(reloadKey, "1");
            if ("caches" in window) caches.keys().then(function (keys) { return Promise.all(keys.map(function (key) { return caches.delete(key); })); }).finally(reload);
            else reload();
            return;
          }
          localStorage.setItem(versionKey, buildVersion);
          fetch("/version.json?v=" + Date.now(), { cache: "no-store", headers: { "Cache-Control": "no-cache, no-store, must-revalidate", "Pragma": "no-cache" } })
            .then(function (res) { return res.ok ? res.json() : null; })
            .then(function (data) {
              if (!data || !data.version || data.version === buildVersion || sessionStorage.getItem(reloadKey + ":remote")) return;
              sessionStorage.setItem(reloadKey + ":remote", "1");
              localStorage.setItem(versionKey, data.version);
              if ("caches" in window) caches.keys().then(function (keys) { return Promise.all(keys.map(function (key) { return caches.delete(key); })); }).finally(reload);
              else reload();
            }).catch(function () {});
        } catch (e) {}
        function reload() {
          var url = new URL(window.location.href);
          url.searchParams.set("v", buildVersion);
          url.searchParams.set("cache", "${forceUpdateTag}");
          url.searchParams.set("mobile_bust", Date.now().toString());
          window.location.replace(url.toString());
        }
      })();
    </script>`;

function appendBuildVersionToLocalAssets(html: string) {
  return html.replace(/\b(src|href)=(['"])([^'"]+)\2/g, (match, attr: string, quote: string, url: string) => {
    if (/^(?:https?:|data:|blob:|#)/i.test(url)) return match;
    if (!/\.(?:js|mjs|css|tsx|json|webmanifest|png|jpe?g|svg|ico|webp|woff2?)(?:[?#].*)?$/i.test(url)) return match;

    const [withoutHash, hash = ""] = url.split("#");
    const [pathname, search = ""] = withoutHash.split("?");
    const params = new URLSearchParams(search);
    params.set("v", buildTimestamp);

    return `${attr}=${quote}${pathname}?${params.toString()}${hash ? `#${hash}` : ""}${quote}`;
  });
}

const forceFreshHtmlAndAssets = () => ({
  name: "onetwo-force-fresh-html-assets",
  enforce: "post" as const,
  transformIndexHtml(html: string) {
    return appendBuildVersionToLocalAssets(html.replace("<head>", `<head>${earlyVersionGuard}`));
  },
  generateBundle(_: unknown, bundle: Record<string, any>) {
    this.emitFile({
      type: "asset",
      fileName: "version.json",
      source: JSON.stringify({ version: fullBuildVersion, timestamp: buildTimestamp, cache: forceUpdateTag }),
    });

    const htmlAsset = bundle["index.html"];
    if (htmlAsset?.type === "asset" && typeof htmlAsset.source === "string") {
      htmlAsset.source = appendBuildVersionToLocalAssets(
        htmlAsset.source.includes("__ONETWO_BUILD_VERSION__")
          ? htmlAsset.source
          : htmlAsset.source.replace("<head>", `<head>${earlyVersionGuard}`),
      );
    }
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "/",
  build: {
    rollupOptions: {
      output: {
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  },
  define: {
    'import.meta.env.VITE_BUILD_TIMESTAMP': JSON.stringify(buildTimestamp),
    'import.meta.env.VITE_FORCE_UPDATE_TAG': JSON.stringify(forceUpdateTag),
  },
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    forceFreshHtmlAndAssets(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom"],
  },
}));
