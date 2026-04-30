import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

const buildTimestamp = Date.now().toString();
const forceUpdateTag = "force-refresh-2026-04-30-latest-deploy-cache-policy-01";
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
            purgeCachesAndWorkers().finally(reload);
            return;
          }
          localStorage.setItem(versionKey, buildVersion);
          fetch("/version.json?v=" + Date.now() + "&mobile_bust=" + Date.now(), { cache: "no-store", headers: { "Accept": "application/json", "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0", "Pragma": "no-cache", "Expires": "0" } })
            .then(function (res) { return res.ok ? res.json() : null; })
            .then(function (data) {
              if (!data || !data.version || data.version === buildVersion || sessionStorage.getItem(reloadKey + ":remote")) return;
              sessionStorage.setItem(reloadKey + ":remote", "1");
              localStorage.setItem(versionKey, data.version);
              purgeCachesAndWorkers().finally(function () { reload(data.version, data.cache); });
            }).catch(function () {});
        } catch (e) {}
        function purgeCachesAndWorkers() {
          var cacheCleanup = "caches" in window ? caches.keys().then(function (keys) { return Promise.all(keys.map(function (key) { return caches.delete(key); })); }) : Promise.resolve();
          var workerCleanup = "serviceWorker" in navigator ? navigator.serviceWorker.getRegistrations().then(function (registrations) { return Promise.all(registrations.map(function (registration) { registration.waiting && registration.waiting.postMessage({ type: "SKIP_WAITING" }); registration.active && registration.active.postMessage({ type: "ONETWO_CLEAR_CACHES", version: buildVersion }); return registration.unregister(); })); }) : Promise.resolve();
          return Promise.all([cacheCleanup, workerCleanup]).catch(function () {});
        }
        function reload(targetVersion, targetCache) {
          var url = new URL(window.location.href);
          url.searchParams.set("v", targetVersion || buildVersion);
          url.searchParams.set("cache", targetCache || "${forceUpdateTag}");
          url.searchParams.set("mobile_bust", Date.now().toString());
          url.searchParams.set("ngsw-bypass", "1");
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
  configureServer(server: any) {
    server.middlewares.use("/version.json", (_req: any, res: any) => {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.end(JSON.stringify({ version: fullBuildVersion, timestamp: buildTimestamp, cache: forceUpdateTag }));
    });
  },
  transformIndexHtml(html: string) {
    return appendBuildVersionToLocalAssets(html.replace("<head>", `<head>${earlyVersionGuard}`));
  },
  generateBundle(this: any, _: unknown, bundle: Record<string, any>) {
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
