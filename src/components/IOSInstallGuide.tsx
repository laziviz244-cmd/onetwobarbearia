import { useEffect, useState } from "react";
import { X, Share, Plus } from "lucide-react";

const DISMISS_KEY = "onetwo_ios_install_dismissed";

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    (window.navigator as any).standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches
  );
}

function isInAppBrowser(): boolean {
  const ua = navigator.userAgent || "";
  // Instagram, Facebook, TikTok, etc. — push will never work here.
  return /FBAN|FBAV|Instagram|Line|TikTok|MicroMessenger/i.test(ua);
}

/**
 * Shown only on iOS Safari (not standalone). Explains the required
 * "Add to Home Screen" flow so push notifications can work on iOS 16.4+.
 */
export function IOSInstallGuide() {
  const [show, setShow] = useState(false);
  const [inAppBrowser, setInAppBrowser] = useState(false);

  useEffect(() => {
    if (!isIOS()) return;
    if (isStandalone()) return;
    if (localStorage.getItem(DISMISS_KEY) === "1") return;

    setInAppBrowser(isInAppBrowser());
    // Small delay so it doesn't pop instantly on first paint.
    const t = setTimeout(() => setShow(true), 1500);
    return () => clearTimeout(t);
  }, []);

  if (!show) return null;

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setShow(false);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md rounded-t-2xl border border-[#C5A059]/40 bg-black p-6 text-white sm:rounded-2xl">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#C5A059]">
            <span>Instale o Onetwo no seu iPhone</span>
          </h2>
          <button
            onClick={handleDismiss}
            aria-label="Fechar"
            className="text-white/60 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {inAppBrowser ? (
          <div className="space-y-3 text-sm text-white/90">
            <p>
              <span>
                Você está usando um navegador interno (Instagram/Facebook). Para receber
                notificações, abra este link no <strong>Safari</strong>.
              </span>
            </p>
            <p className="text-white/70">
              <span>
                Toque nos três pontinhos no topo e escolha "Abrir no Safari".
              </span>
            </p>
          </div>
        ) : (
          <div className="space-y-4 text-sm text-white/90">
            <p>
              <span>
                Para receber lembretes 30 min antes do seu corte, instale o app na sua
                tela de início:
              </span>
            </p>
            <ol className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#C5A059] text-black text-xs font-bold">
                  1
                </span>
                <span className="flex items-center gap-2">
                  Toque em <Share size={16} className="inline text-[#C5A059]" />{" "}
                  <span>(Compartilhar) na barra do Safari</span>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#C5A059] text-black text-xs font-bold">
                  2
                </span>
                <span className="flex items-center gap-2">
                  Escolha <Plus size={16} className="inline text-[#C5A059]" />{" "}
                  <span>"Adicionar à Tela de Início"</span>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#C5A059] text-black text-xs font-bold">
                  3
                </span>
                <span>
                  Abra o app pelo ícone na tela de início e permita as notificações.
                </span>
              </li>
            </ol>
          </div>
        )}

        <button
          onClick={handleDismiss}
          className="mt-6 w-full rounded-lg border border-[#C5A059]/60 bg-transparent py-3 text-sm font-medium text-[#C5A059] hover:bg-[#C5A059]/10"
        >
          <span>Entendi</span>
        </button>
      </div>
    </div>
  );
}
