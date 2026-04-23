import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    OneSignalDeferred?: Array<(OneSignal: any) => Promise<void>>;
  }
}

const WELCOME_SENT_KEY = "onetwo_welcome_sent";

// Init lives in index.html (official OneSignal snippet).
// This file handles tagging + iOS PWA welcome notification fallback.
export function initOneSignal() {
  window.OneSignalDeferred = window.OneSignalDeferred || [];

  // Once SDK is ready, attach a permissionChange listener that fires our
  // server-side welcome notification. The native welcomeNotification can be
  // unreliable on iOS PWAs, so we send our own via the Edge Function.
  window.OneSignalDeferred.push(async (OneSignal: any) => {
    try {
      OneSignal.Notifications.addEventListener("permissionChange", async (granted: boolean) => {
        if (!granted) return;
        // Wait briefly for OneSignal to register the subscription / external_id.
        setTimeout(() => sendWelcomeIfNeeded(OneSignal), 2500);
      });

      // If permission is already granted on load (returning user), still try once.
      if (OneSignal.Notifications.permission === true) {
        setTimeout(() => sendWelcomeIfNeeded(OneSignal), 2500);
      }
    } catch (err) {
      console.warn("OneSignal init listener failed:", err);
    }
  });
}

async function sendWelcomeIfNeeded(OneSignal: any) {
  try {
    if (localStorage.getItem(WELCOME_SENT_KEY) === "1") return;

    // Resolve external_id: prefer OneSignal's value, fall back to local user.
    let externalId: string | null = null;
    try {
      externalId = OneSignal.User?.externalId ?? null;
    } catch {}
    if (!externalId) {
      externalId =
        localStorage.getItem("onetwo_user") ||
        localStorage.getItem("last_logged_user") ||
        localStorage.getItem("onetwo_guest_name");
    }
    if (!externalId) return;

    const { error } = await supabase.functions.invoke("send-notification", {
      body: {
        user_id: externalId,
        title: "Onetwo Barbearia",
        message: "Notificações ativadas! Você receberá lembretes 30 min antes do seu corte. ✂️",
      },
    });

    if (!error) {
      localStorage.setItem(WELCOME_SENT_KEY, "1");
    } else {
      console.warn("Welcome notification failed:", error);
    }
  } catch (err) {
    console.warn("sendWelcomeIfNeeded error:", err);
  }
}

export async function tagOneSignalUser(externalId: string) {
  if (!externalId) return;
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(async (OneSignal: any) => {
    try {
      await OneSignal.login(externalId);
      // After login, if permission already granted, attempt welcome.
      if (OneSignal.Notifications.permission === true) {
        setTimeout(() => sendWelcomeIfNeeded(OneSignal), 1500);
      }
    } catch (err) {
      console.warn("OneSignal login failed:", err);
    }
  });
}
