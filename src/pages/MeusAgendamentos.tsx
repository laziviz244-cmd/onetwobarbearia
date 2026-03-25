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

      <main className="px-6">
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

      <BottomNav />
    </div>
  );
}
