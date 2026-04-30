import { motion } from "framer-motion";
import { Calendar, Scissors } from "lucide-react";
import { staggerContainer, staggerItem } from "@/components/motion";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentAppointmentUserId } from "@/lib/appointment-user";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Appointment {
  id: string;
  service: string;
  date: string;
  dateLabel: string;
  time: string;
  status: string;
  clientName?: string;
}

const APPOINTMENTS_CACHE_TTL_MS = 5 * 60 * 1000;
const appointmentsCache = new Map<string, { data: Appointment[]; timestamp: number }>();

export default function MeusAgendamentos() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showLoyalty, setShowLoyalty] = useState(false);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => getCurrentAppointmentUserId());
  const [isLoading, setIsLoading] = useState(true);

  const [loyaltyCount, setLoyaltyCount] = useState(0);

  const loadAppointments = useCallback(async () => {
    if (!currentUserId) {
      setAppointments([]);
      setIsLoading(false);
      return;
    }

    const cached = appointmentsCache.get(currentUserId);
    if (cached && Date.now() - cached.timestamp < APPOINTMENTS_CACHE_TTL_MS) {
      setAppointments(cached.data);
      setLoyaltyCount(cached.data.length);
      setIsLoading(false);
      return;
    }

    const { data } = await supabase
      .from("appointments")
      .select("*")
      .eq("user_id", currentUserId)
      .order("created_at", { ascending: false });

    const mapped = (data || []).map((a: any) => ({
      id: a.id,
      service: a.service,
      date: a.date,
      dateLabel: a.date_label,
      time: a.time,
      status: a.status,
      clientName: a.client_name,
    }));
    appointmentsCache.set(currentUserId, { data: mapped, timestamp: Date.now() });
    setAppointments(mapped);
    setLoyaltyCount(mapped.length);
    setIsLoading(false);
  }, [currentUserId]);

  useEffect(() => {
    const syncCurrentUser = () => setCurrentUserId(getCurrentAppointmentUserId());

    window.addEventListener("focus", syncCurrentUser);
    window.addEventListener("storage", syncCurrentUser);
    window.addEventListener("pageshow", syncCurrentUser);
    const onVisChange = () => { if (!document.hidden) syncCurrentUser(); };
    document.addEventListener("visibilitychange", onVisChange);

    return () => {
      window.removeEventListener("focus", syncCurrentUser);
      window.removeEventListener("storage", syncCurrentUser);
      window.removeEventListener("pageshow", syncCurrentUser);
      document.removeEventListener("visibilitychange", onVisChange);
    };
  }, []);

  useEffect(() => {
    loadAppointments();

    if (!currentUserId) return;

    const channel = supabase
      .channel(`appointments-realtime-${currentUserId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "appointments" }, () => {
        appointmentsCache.delete(currentUserId);
        loadAppointments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, loadAppointments]);

  const handleCancel = async (id: string) => {
    if (!currentUserId) return;

    // Cancel scheduled push notification (if any)
    const { data: row } = await supabase
      .from("appointments")
      .select("notification_id")
      .eq("id", id)
      .eq("user_id", currentUserId)
      .single();

    await supabase.from("appointments").delete().eq("id", id).eq("user_id", currentUserId);
    appointmentsCache.delete(currentUserId);

    const notifId = (row as any)?.notification_id;
    if (notifId) {
      supabase.functions
        .invoke("cancel-notification", { body: { notification_id: notifId } })
        .catch((err) => console.warn("Cancel push failed:", err));
    }

    setCancelId(null);
    loadAppointments();
  };

  return (
    <div className="bg-background text-foreground">
      <header className="px-6 pt-12 pb-6">
        <motion.h1
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-2xl font-montserrat font-bold"
        >
          Meus Agendamentos
        </motion.h1>
      </header>

      <main className="px-6 space-y-5">
        {/* Loyalty Card - Gold Premium */}
        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setShowLoyalty(true)}
          className="w-full rounded-2xl p-4 flex items-center gap-4"
          style={{
            background: "hsl(0 0% 6%)",
            border: "1.5px solid hsl(43 60% 50%)",
          }}
        >
          <Scissors className="w-6 h-6 flex-shrink-0" style={{ color: "#C5A059" }} />
          <div className="text-left flex-1">
            <span className="font-montserrat font-bold text-foreground text-sm">
              ✂️ Ver Meu Cartão Fidelidade
            </span>
            <p className="text-xs font-opensans mt-0.5" style={{ color: "hsl(0 0% 75%)" }}>
              {loyaltyCount} de 9 cortes completados
            </p>
          </div>
        </motion.button>

        {/* Section: Meus Horários Marcados */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="flex items-center gap-2 mb-4"
          >
            <Calendar className="w-4 h-4" style={{ color: "#C5A059" }} />
            <h2 className="font-montserrat font-bold text-sm text-foreground">Meus Horários Marcados</h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mb-4 flex items-center gap-2"
          >
            <Scissors className="w-4 h-4" style={{ color: "#C5A059" }} />
            <span className="font-montserrat text-sm font-semibold text-foreground">Cortes</span>
          </motion.div>

          {!isLoading && appointments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="surface-card rounded-2xl p-8 flex flex-col items-center gap-4"
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="w-7 h-7 text-primary" />
              </div>
              <p className="text-center text-subtle font-opensans text-sm leading-relaxed">
                Nenhum agendamento encontrado
              </p>
            </motion.div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="flex flex-col gap-3"
            >
              {appointments.map((apt) => (
                <motion.div
                  key={apt.id}
                  variants={staggerItem}
                  className="flex items-center gap-3 py-1"
                >
                  <Scissors className="w-4 h-4 flex-shrink-0" style={{ color: "#C5A059" }} />
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="font-montserrat font-bold text-foreground text-sm">
                      {apt.service}
                    </span>
                    <span className="text-xs text-dimmed font-opensans tabular-nums">
                      - {apt.time}hrs
                    </span>
                    <span className="text-xs text-muted-foreground">|</span>
                    <button
                      onClick={() => setCancelId(apt.id)}
                      className="text-xs text-muted-foreground transition-opacity hover:opacity-80 flex-shrink-0"
                    >
                      cancelar agendamento
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>

      {/* Cancel Confirmation */}
      <AlertDialog open={!!cancelId} onOpenChange={(open) => !open && setCancelId(null)}>
        <AlertDialogContent
          className="rounded-2xl border-0 max-w-[340px]"
          style={{ background: "hsl(0 0% 5%)", border: "1px solid hsl(0 0% 15%)" }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="font-montserrat font-bold text-foreground text-center">
              Cancelar agendamento?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-dimmed font-opensans text-sm">
              Tem certeza que deseja cancelar seu agendamento? O horário ficará disponível para outros clientes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2 sm:flex-row">
            <AlertDialogCancel
              className="flex-1 rounded-2xl border-0 font-montserrat font-bold"
              style={{ background: "hsl(0 0% 10%)", color: "hsl(0 0% 100%)" }}
            >
              Não
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cancelId && handleCancel(cancelId)}
              className="flex-1 rounded-2xl border-0 font-montserrat font-bold"
              style={{ background: "hsl(0 50% 40%)", color: "hsl(0 0% 100%)" }}
            >
              Sim, cancelar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Loyalty Modal */}
      {showLoyalty && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => setShowLoyalty(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="w-full max-w-sm rounded-2xl p-6 relative overflow-hidden"
            style={{
              background: "linear-gradient(160deg, hsl(0 0% 10%), hsl(0 0% 5%))",
              border: "1px solid hsl(45 60% 40% / 0.3)",
              boxShadow: "0 0 40px hsl(45 60% 30% / 0.08), inset 0 1px 0 hsl(45 60% 50% / 0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 w-12 h-12 border-t border-l rounded-tl-2xl" style={{ borderColor: "hsl(45 60% 50% / 0.3)" }} />
            <div className="absolute top-0 right-0 w-12 h-12 border-t border-r rounded-tr-2xl" style={{ borderColor: "hsl(45 60% 50% / 0.3)" }} />
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b border-l rounded-bl-2xl" style={{ borderColor: "hsl(45 60% 50% / 0.3)" }} />
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b border-r rounded-br-2xl" style={{ borderColor: "hsl(45 60% 50% / 0.3)" }} />

            <h2 className="font-montserrat font-bold text-xl text-foreground text-center mb-0.5 tracking-tight">
              Meu Cartão Fidelidade
            </h2>
            <p className="text-[11px] text-center font-montserrat tracking-[0.2em] uppercase mb-6" style={{ color: "hsl(45 50% 60%)" }}>
              Barbearia OneTwo
            </p>

            <div className="grid grid-cols-5 gap-3 mb-6">
              {Array.from({ length: 10 }).map((_, i) => {
                const filled = i < Math.min(loyaltyCount, 9);
                return (
                  <div
                    key={i}
                    className="aspect-square rounded-full flex items-center justify-center"
                    style={{
                      background: filled
                        ? "linear-gradient(145deg, hsl(43 70% 58%), hsl(38 80% 42%), hsl(43 70% 55%))"
                        : "transparent",
                      border: filled
                        ? "1.5px solid hsl(43 60% 60%)"
                        : "1.5px solid hsl(45 40% 35% / 0.5)",
                      boxShadow: filled
                        ? "0 0 12px hsl(43 70% 50% / 0.3), inset 0 1px 2px hsl(43 80% 70% / 0.3)"
                        : "none",
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                      stroke={filled ? "hsl(0 0% 8%)" : "hsl(45 30% 40% / 0.5)"}
                      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="6" cy="6" r="3" />
                      <path d="M8.12 8.12 12 12" />
                      <path d="M20 4 8.12 15.88" />
                      <circle cx="6" cy="18" r="3" />
                      <path d="M14.8 14.8 20 20" />
                      <path d="M8.12 8.12 12 12" />
                    </svg>
                  </div>
                );
              })}
            </div>

            <p className="text-center text-sm font-montserrat mb-2">
              <span className="text-foreground">A cada 9 cortes, o 10º é </span>
              <span className="font-bold" style={{ color: "hsl(43 80% 55%)" }}>por nossa conta!</span>
            </p>
            <p className="text-center text-sm font-montserrat text-foreground">
              Faltam apenas <span className="font-bold text-primary">{Math.max(9 - loyaltyCount, 0)} cortes</span> para o seu corte grátis!
            </p>

            <div className="mt-4 w-full h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(45 20% 15%)" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((loyaltyCount / 9) * 100, 100)}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, hsl(43 70% 45%), hsl(43 80% 58%))" }}
              />
            </div>

            <button
              onClick={() => setShowLoyalty(false)}
              className="mt-6 w-full py-3 rounded-2xl font-montserrat font-bold text-sm tracking-tight"
              style={{ background: "#C5A059", color: "#000000" }}
            >
              Fechar
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
