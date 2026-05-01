import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { checkVersionAndReload, setupAutoVersionCheck, verifyPostReloadCacheIntegrity } from "./version-check";

const versionMocks = vi.hoisted(() => ({
  clearBrowserRuntimeCaches: vi.fn(() => Promise.resolve()),
  buildVersionedUrl: vi.fn((pathname = "/", search = "", hash = "") => {
    const url = new URL(`https://onetwobarrbearia.lovable.app${pathname}${search || ""}${hash || ""}`);
    url.searchParams.set("v", "new-build-2026");
    url.searchParams.set("cache", "force-refresh-test");
    url.searchParams.set("mobile_bust", "123456789");
    url.searchParams.set("ngsw-bypass", "1");
    return url.toString();
  }),
}));

vi.mock("./emergency-route-recovery", () => ({
  BUILD_VERSION: "new-build-2026",
  buildVersionedUrl: versionMocks.buildVersionedUrl,
  clearBrowserRuntimeCaches: versionMocks.clearBrowserRuntimeCaches,
}));

const browserUserAgents = [
  {
    name: "Chrome",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  },
  {
    name: "Safari",
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
  },
];

describe("checkVersionAndReload cache antigo", () => {
  const originalLocation = window.location;
  let replaceMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-29T12:00:00Z"));
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    document.head.innerHTML = `<script src="https://onetwobarrbearia.lovable.app/assets/index-oldhash.js"></script>`;

    replaceMock = vi.fn();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        ...originalLocation,
        origin: "https://onetwobarrbearia.lovable.app",
        pathname: "/agendar",
        search: "?servico=Corte",
        hash: "",
        replace: replaceMock,
      },
    });

    localStorage.setItem("onetwo_app_version", "old-build-2025");
    localStorage.setItem("onetwo_bundle_hash", "oldhash");

    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ version: "new-build-2026" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: async () => `<script type="module" src="/assets/index-newhash.js"></script>`,
      }) as unknown as typeof fetch;
  });

  afterEach(() => {
    vi.useRealTimers();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });

  it.each(browserUserAgents)(
    "força reload para o bundle mais recente em ambiente simulado $name com cache antigo",
    async ({ userAgent }) => {
      Object.defineProperty(navigator, "userAgent", { configurable: true, value: userAgent });
      Object.defineProperty(navigator, "maxTouchPoints", { configurable: true, value: 0 });

      const canContinueWithoutReload = await checkVersionAndReload();

      expect(canContinueWithoutReload).toBe(false);
      expect(versionMocks.clearBrowserRuntimeCaches).toHaveBeenCalledTimes(1);
      expect(localStorage.getItem("onetwo_app_version")).toBe("new-build-2026");
      expect(localStorage.getItem("onetwo_bundle_hash")).toBe("newhash");
      expect(localStorage.getItem("onetwo_pre_reload_bundle_hash")).toBe("oldhash");
      expect(replaceMock).toHaveBeenCalledTimes(1);
      expect(replaceMock.mock.calls[0][0]).toContain("/agendar?servico=Corte");
      expect(replaceMock.mock.calls[0][0]).toContain("v=new-build-2026");
      expect(replaceMock.mock.calls[0][0]).toContain("cache=force-refresh-test");
      expect(replaceMock.mock.calls[0][0]).toContain("ngsw-bypass=1");
    },
  );

  it.each(browserUserAgents)(
    "confirma pós-reload em $name que caches, Service Workers antigos e bundle antigo foram removidos",
    async ({ userAgent }) => {
      Object.defineProperty(navigator, "userAgent", { configurable: true, value: userAgent });
      Object.defineProperty(navigator, "serviceWorker", {
        configurable: true,
        value: {
          getRegistrations: vi.fn().mockResolvedValue([]),
        },
      });
      Object.defineProperty(window, "caches", {
        configurable: true,
        value: {
          keys: vi.fn()
            .mockResolvedValueOnce(["onetwo-runtime-oldhash", "workbox-precache-v1"])
            .mockResolvedValueOnce([]),
          delete: vi.fn().mockResolvedValue(true),
        },
      });
      vi.spyOn(performance, "getEntriesByType").mockReturnValue([
        { name: "https://onetwobarrbearia.lovable.app/assets/index-newhash.js" } as PerformanceResourceTiming,
      ]);

      document.head.innerHTML = `<script type="module" src="https://onetwobarrbearia.lovable.app/assets/index-newhash.js"></script>`;
      localStorage.setItem("onetwo_pre_reload_bundle_hash", "oldhash");
      localStorage.setItem("onetwo_bundle_hash", "newhash");
      sessionStorage.setItem("onetwo_version_reloaded", "new-build-2026:newhash");

      await expect(verifyPostReloadCacheIntegrity()).resolves.toBe(true);
      expect(window.caches.delete).toHaveBeenCalledWith("onetwo-runtime-oldhash");
      expect(window.caches.delete).toHaveBeenCalledWith("workbox-precache-v1");
      expect(localStorage.getItem("onetwo_pre_reload_bundle_hash")).toBeNull();
      expect(replaceMock).not.toHaveBeenCalled();
    },
  );

  it("não força novo reload se a sessão já passou por um reload obrigatório", async () => {
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: {
        getRegistrations: vi.fn().mockResolvedValue([]),
      },
    });
    Object.defineProperty(window, "caches", {
      configurable: true,
      value: {
        keys: vi.fn().mockResolvedValue([]),
        delete: vi.fn().mockResolvedValue(true),
      },
    });
    vi.spyOn(performance, "getEntriesByType").mockReturnValue([
      { name: "https://onetwobarrbearia.lovable.app/assets/index-oldhash.js" } as PerformanceResourceTiming,
    ]);

    localStorage.setItem("onetwo_pre_reload_bundle_hash", "oldhash");
    localStorage.setItem("onetwo_bundle_hash", "newhash");
    sessionStorage.setItem("onetwo_version_reloaded", "new-build-2026:newhash");

    await expect(verifyPostReloadCacheIntegrity()).resolves.toBe(true);
    expect(versionMocks.clearBrowserRuntimeCaches).not.toHaveBeenCalled();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("libera a abertura do app se version.json não responder em até 3 segundos", async () => {
    globalThis.fetch = vi.fn(() => new Promise(() => undefined)) as unknown as typeof fetch;

    const checkPromise = checkVersionAndReload();
    await vi.advanceTimersByTimeAsync(3_100);

    await expect(checkPromise).resolves.toBe(true);
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("verifica versão só no boot e depois de 5 minutos", async () => {
    sessionStorage.clear();
    localStorage.clear();
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ version: "new-build-2026" }),
      text: async () => `<script type="module" src="/assets/index-newhash.js"></script>`,
    }) as unknown as typeof fetch;

    setupAutoVersionCheck();
    expect(fetch).not.toHaveBeenCalled();

    window.dispatchEvent(new Event("focus"));
    await vi.advanceTimersByTimeAsync(299_000);
    expect(fetch).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1_000);
    await vi.runOnlyPendingTimersAsync();
    expect(fetch).toHaveBeenCalled();
  });
});