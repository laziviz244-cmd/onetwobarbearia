import { motion } from "framer-motion";
import { Calendar, Scissors } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { staggerContainer, staggerItem } from "@/components/motion";
import { useState, useEffect } from "react";
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

export default function MeusAgendamentos() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showLoyalty, setShowLoyalty] = useState(false);
  const [cancelId, setCancelId] = useState<string | null>(null);

  const user = localStorage.getItem("onetwo_user");
  const guestName = localStorage.getItem("onetwo_guest_name");
  const hasIdentity = !!(user || guestName);
  const loyaltyCount = hasIdentity ? parseInt(localStorage.getItem("onetwo_loyalty") || "0", 10) : 0;

  const loadAppointments = () => {
    const stored: Appointment[] = JSON.parse(localStorage.getItem("onetwo_appointments") || "[]");
    setAppointments([...stored].reverse());
  };

  useEffect(() => {
    loadAppointments();
  }, [hasIdentity]);

  useEffect(() => {
    const handleFocus = () => loadAppointments();
    window.addEventListener("focus", handleFocus);
    // Also reload when navigating back to this page
    const interval = setInterval(loadAppointments, 1000);
    return () => {
      window.removeEventListener("focus", handleFocus);
      clearInterval(interval);
    };
  }, [hasIdentity]);

  const handleCancel = (id: string) => {
    const all: Appointment[] = JSON.parse(localStorage.getItem("onetwo_appointments") || "[]");
    const updated = all.filter((a) => a.id !== id);
    localStorage.setItem("onetwo_appointments", JSON.stringify(updated));
    setCancelId(null);
    loadAppointments();
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
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
        {/* Loyalty Card */}
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
            className="flex items-center gap-2 mb-3"
          >
            <Calendar className="w-4 h-4 text-foreground" />
            <h2 className="font-montserrat font-bold text-sm text-foreground">Meus Horários Marcados</h2>
          </motion.div>

          {appointments.length === 0 ? (
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
                Você ainda não possui agendamentos marcados.
              </p>
            </motion.div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="surface-card rounded-2xl p-4 flex flex-col gap-0"
            >
              {appointments.map((apt, index) => (
                <motion.div
                  key={apt.id}
                  variants={staggerItem}
                  className={index < appointments.length - 1 ? "pb-3 mb-3" : ""}
                  style={index < appointments.length - 1 ? { borderBottom: "1px solid hsl(0 0% 12%)" } : {}}
                >
                  <div className="flex items-center gap-3">
                    <Scissors className="w-4 h-4 flex-shrink-0" style={{ color: "#C5A059" }} />
                    <div className="flex-1 min-w-0">
                      <span className="font-montserrat font-bold text-foreground text-sm">
                        {apt.service}
                      </span>
                      <span className="text-xs text-dimmed font-opensans ml-2">
                        - {apt.time}
                      </span>
                      <button
                        onClick={() => setCancelId(apt.id)}
                        className="ml-2 text-xs transition-opacity hover:opacity-80"
                        style={{ color: "#808080" }}
                      >
                        cancelar agendamento
                      </button>
                    </div>
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

      <BottomNav />
    </div>
  );
}
