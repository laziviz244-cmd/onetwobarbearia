declare global {
  interface Window {
    OneSignalDeferred?: Array<(OneSignal: any) => Promise<void>>;
  }
}

const APP_ID = "0f5b4b37-b119-45c0-bd5e-641d5553970d";
let initialized = false;

export function initOneSignal() {
  if (initialized) return;
  initialized = true;

  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(async (OneSignal: any) => {
    await OneSignal.init({ appId: APP_ID });
  });
}

export async function tagOneSignalUser(externalId: string) {
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(async (OneSignal: any) => {
    await OneSignal.login(externalId);
  });
}
