import { motion } from "framer-motion";
import { User, Calendar, Scissors } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { useState, useEffect } from "react";

interface Appointment {
  id: string;
  service: string;
  dateLabel: string;
  time: string;
}

export default function Perfil() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const loyaltyCount = parseInt(localStorage.getItem("onetwo_loyalty") || "0", 10);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("onetwo_appointments") || "[]");
    setAppointments(stored.slice(-3).reverse());
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <header className="px-6 pt-12 pb-6">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-4"
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: "hsl(40 40% 15%)" }}
          >
            <User className="w-7 h-7" style={{ color: "#C5A059" }} />
          </div>
          <div>
            <h1 className="text-xl font-montserrat font-bold text-foreground">
              Cliente OneTwo
            </h1>
            <p className="text-xs font-montserrat font-semibold" style={{ color: "#C5A059" }}>
              Membro do Clube One Two
            </p>
          </div>
        </motion.div>
      </header>

      <main className="px-6 space-y-5">
        {/* Loyalty shortcut */}
        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate("/cliente")}
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
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="font-montserrat font-bold text-foreground text-sm mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" style={{ color: "#C5A059" }} />
            Meus Horários Marcados
          </h2>
          {appointments.length === 0 ? (
            <div className="surface-card rounded-2xl p-6 text-center">
              <p className="text-subtle font-opensans text-sm">
                Nenhum agendamento ainda.
              </p>
            </div>
          ) : (
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
          )}
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
}
