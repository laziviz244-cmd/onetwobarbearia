import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

declare global {
  interface Window {
    OneSignalDeferred?: Array<(OneSignal: any) => Promise<void>>;
  }
}

const WELCOME_SENT_KEY = "welcomeNotifSent";

const WELCOME_TITLE = "Obrigado por Confirmar!";
const WELCOME_MESSAGE =
  "Agora enviaremos uma notificação 30 minutos antes do seu horário para evitar que se atrase.";

function isIOS(): boolean {
  const ua = navigator.userAgent || "";
  const iOSUA = /iPad|iPhone|iPod/.test(ua);
  // iPadOS 13+ reports as Mac; detect via touch
  const iPadOS = ua.includes("Macintosh") && "ontouchend" in document;
  return iOSUA || iPadOS;
}

function showWelcomeToast() {
  toast.success(WELCOME_TITLE, {
    description: WELCOME_MESSAGE,
    duration: 5000,
  });
}

// Init lives in index.html (official OneSignal snippet).
// This file handles tagging + welcome notification logic per platform.
export function initOneSignal() {
  window.OneSignalDeferred = window.OneSignalDeferred || [];

  window.OneSignalDeferred.push(async (OneSignal: any) => {
    try {
      // Listener principal - dispara quando o usuário muda permissão/inscrição
      OneSignal.User.PushSubscription.addEventListener("change", async (event: any) => {
        const isSubscribed = event?.current?.optedIn === true;
        let playerId: string | null = null;
        try {
          playerId = OneSignal.User?.PushSubscription?.id ?? null;
        } catch {}
        console.log("[OneSignal] subscriptionChange — isSubscribed:", isSubscribed, "playerId:", playerId);

        if (!isSubscribed) return;
        // Pequeno delay para garantir que o external_id já foi registrado
        setTimeout(() => handleWelcome(OneSignal), 1500);
      });

      // Caso a permissão já esteja concedida ao carregar (usuário recorrente)
      if (OneSignal.Notifications.permission === true) {
        setTimeout(() => handleWelcome(OneSignal), 2000);
      }
    } catch (err) {
      console.warn("OneSignal init listener failed:", err);
    }
  });
}

async function handleWelcome(OneSignal: any) {
  try {
    if (localStorage.getItem(WELCOME_SENT_KEY) === "true") {
      console.log("[OneSignal] Welcome já enviado anteriormente — ignorando.");
      return;
    }

    if (isIOS()) {
      // iOS PWA: push imediato após permitir é instável; mostramos toast in-app garantido.
      console.log("[OneSignal] iOS detectado — exibindo toast in-app de boas-vindas.");
      showWelcomeToast();
      localStorage.setItem(WELCOME_SENT_KEY, "true");
      return;
    }

    // Android / Desktop: dispara push real via Edge Function (usa REST API com chave segura)
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
    if (!externalId) {
      console.warn("[OneSignal] Sem external_id — não é possível enviar push de boas-vindas.");
      return;
    }

    console.log("[OneSignal] Android/Desktop — disparando push de boas-vindas para:", externalId);
    const { error } = await supabase.functions.invoke("send-notification", {
      body: {
        user_id: externalId,
        title: WELCOME_TITLE,
        message: WELCOME_MESSAGE,
      },
    });

    if (!error) {
      localStorage.setItem(WELCOME_SENT_KEY, "true");
      console.log("[OneSignal] Push de boas-vindas enviado com sucesso.");
    } else {
      console.warn("[OneSignal] Falha ao enviar push de boas-vindas:", error);
    }
  } catch (err) {
    console.warn("handleWelcome error:", err);
  }
}

export async function tagOneSignalUser(externalId: string) {
  if (!externalId) return;
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(async (OneSignal: any) => {
    try {
      await OneSignal.login(externalId);
      if (OneSignal.Notifications.permission === true) {
        setTimeout(() => handleWelcome(OneSignal), 1500);
      }
    } catch (err) {
      console.warn("OneSignal login failed:", err);
    }
  });
}
