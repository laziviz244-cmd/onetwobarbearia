declare global {
  interface Window {
    OneSignalDeferred?: Array<(OneSignal: any) => Promise<void>>;
  }
}

// Init agora vive em index.html (snippet oficial do OneSignal).
// Mantemos só o helper de tagueamento por external_id.
export function initOneSignal() {
  // no-op: kept for backward compatibility with main.tsx
  window.OneSignalDeferred = window.OneSignalDeferred || [];
}

export async function tagOneSignalUser(externalId: string) {
  if (!externalId) return;
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(async (OneSignal: any) => {
    try {
      await OneSignal.login(externalId);
    } catch (err) {
      console.warn("OneSignal login failed:", err);
    }
  });
}
