import { motion } from "framer-motion";
import { Calendar, Scissors, Check } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { staggerContainer, staggerItem } from "@/components/motion";
import { useState, useEffect } from "react";

interface Appointment {
  id: string;
  service: string;
  date: string;
  dateLabel: string;
  time: string;
  status: string;
}

export default function MeusAgendamentos() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showLoyalty, setShowLoyalty] = useState(false);

  const loyaltyCount = parseInt(localStorage.getItem("onetwo_loyalty") || "0", 10);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("onetwo_appointments") || "[]");
    setAppointments(stored.reverse());
  }, []);

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

      <main className="px-6 space-y-4">
        {/* Loyalty shortcut */}
        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setShowLoyalty(true)}
          className="w-full rounded-2xl p-4 flex items-center gap-4"
          style={{ background: "hsl(0 0% 0%)", border: "1px solid #C5A059" }}
        >
          <Scissors className="w-6 h-6 flex-shrink-0" style={{ color: "#C5A059" }} />
          <div className="text-left flex-1">
            <span className="font-montserrat font-bold text-foreground text-sm">
              ✂️ Ver Meu Cartão Fidelidade
            </span>
            <p className="text-xs text-dimmed font-opensans mt-0.5">
              {loyaltyCount} de 9 cortes completados
            </p>
          </div>
        </motion.button>

        {/* Recent appointments */}
        {appointments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="font-montserrat font-bold text-foreground text-sm mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" style={{ color: "#C5A059" }} />
              Meus Horários Marcados
            </h2>
            <div className="space-y-2">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="rounded-xl p-3 flex items-center gap-3"
                  style={{ background: "hsl(0 0% 4%)" }}
                >
                  <Scissors className="w-4 h-4 flex-shrink-0" style={{ color: "#C5A059" }} />
                  <span className="font-montserrat font-semibold text-foreground text-sm flex-1">
                    {apt.service}
                  </span>
                  <span className="text-xs text-dimmed font-opensans">
                    {apt.dateLabel} · {apt.time}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Divider */}
        <div className="w-full h-px" style={{ background: "hsl(0 0% 100% / 0.08)" }} />

        {/* Empty state or full list */}
        {appointments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
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
            className="flex flex-col gap-3"
          >
            {appointments.map((apt) => (
              <motion.div
                key={apt.id}
                variants={staggerItem}
                className="rounded-2xl p-4 flex items-center gap-4"
                style={{
                  background: "hsl(0 0% 0%)",
                  border: "1px solid #C5A059",
                }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "hsl(40 40% 15%)" }}
                >
                  <Scissors className="w-5 h-5" style={{ color: "#C5A059" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-montserrat font-bold text-foreground text-sm truncate">
                    {apt.service}
                  </h3>
                  <p className="text-xs text-dimmed font-opensans mt-0.5">
                    📅 {apt.dateLabel} · ⏰ {apt.time}
                  </p>
                </div>
                <span
                  className="text-[10px] font-montserrat font-bold px-2 py-1 rounded-full flex items-center gap-1"
                  style={{ background: "hsl(140 50% 15%)", color: "hsl(140 60% 55%)" }}
                >
                  <Check className="w-3 h-3" />
                  {apt.status}
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

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
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={filled ? "hsl(0 0% 8%)" : "hsl(45 30% 40% / 0.5)"}
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
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
