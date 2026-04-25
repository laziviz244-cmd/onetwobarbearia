import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

const buildTimestamp = Date.now().toString();

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
    return appendBuildVersionToLocalAssets(html);
  },
  generateBundle(_: unknown, bundle: Record<string, any>) {
    const htmlAsset = bundle["index.html"];
    if (htmlAsset?.type === "asset" && typeof htmlAsset.source === "string") {
      htmlAsset.source = appendBuildVersionToLocalAssets(htmlAsset.source);
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
