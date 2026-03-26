import { motion } from "framer-motion";
import { ArrowLeft, Check, Scissors, Calendar } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";

const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
];

const weekDays = [
  { day: "Seg", date: "17", full: "2026-03-17" },
  { day: "Ter", date: "18", full: "2026-03-18" },
  { day: "Qua", date: "19", full: "2026-03-19" },
  { day: "Qui", date: "20", full: "2026-03-20" },
  { day: "Sex", date: "21", full: "2026-03-21" },
  { day: "Sáb", date: "22", full: "2026-03-22" },
];

const WHATSAPP_NUMBER = "5577981302545";

interface Appointment {
  id: string;
  service: string;
  dateLabel: string;
  time: string;
}

export default function BookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const serviceName = searchParams.get("servico") || "Corte";

  const [selectedDate, setSelectedDate] = useState("2026-03-18");
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showLoyalty, setShowLoyalty] = useState(false);

  const loyaltyCount = parseInt(localStorage.getItem("onetwo_loyalty") || "0", 10);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("onetwo_appointments") || "[]");
    setAppointments(stored.slice(-3).reverse());
  }, []);

  const userName = (() => {
    const user = localStorage.getItem("onetwo_user");
    if (user) return JSON.parse(user).username;
    return "Meu Nome";
  })();

  const handleConfirm = () => {
    if (!selectedTime) return;

    const dateObj = weekDays.find((d) => d.full === selectedDate);
    const dateLabel = `${dateObj?.date}/03`;

    const existing = JSON.parse(localStorage.getItem("onetwo_appointments") || "[]");
    existing.push({
      id: Date.now().toString(),
      service: serviceName,
      date: selectedDate,
      dateLabel,
      time: selectedTime,
      status: "Confirmado",
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem("onetwo_appointments", JSON.stringify(existing));

    const loyaltyCount = parseInt(localStorage.getItem("onetwo_loyalty") || "0", 10);
    localStorage.setItem("onetwo_loyalty", String(loyaltyCount + 1));

    const msg = encodeURIComponent(
      `Olá! Gostaria de confirmar meu agendamento:\n\n📋 Serviço: ${serviceName}\n📅 Data: ${dateLabel}/2026\n⏰ Horário: ${selectedTime}\n\nCliente: ${userName}`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");

    setConfirmed(true);
  };

  if (confirmed) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex min-h-screen flex-col items-center justify-center bg-background px-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
          className="flex h-24 w-24 items-center justify-center rounded-full btn-primary-glow mb-6"
        >
          <Check className="h-12 w-12 text-primary-foreground" strokeWidth={3} />
        </motion.div>
        <h1 className="font-montserrat font-bold text-2xl text-foreground tracking-tighter text-center">
          Agendamento confirmado!
        </h1>
        <p className="text-subtle font-opensans mt-2 text-center">
          {weekDays.find((d) => d.full === selectedDate)?.day}{" "}
          {weekDays.find((d) => d.full === selectedDate)?.date} de Mar · {selectedTime}
        </p>
        <p className="text-dimmed font-opensans text-sm mt-1">Onetwo Barbershop</p>

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate("/cliente")}
          className="mt-10 w-full max-w-sm rounded-2xl surface-card py-4 font-montserrat font-semibold text-foreground"
        >
          Voltar ao início
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="px-6 pt-12 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full surface-card"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <div>
          <h1 className="font-montserrat font-bold text-xl text-foreground tracking-tighter">
            Agendamento
          </h1>
          <p className="text-sm text-dimmed font-opensans">{serviceName}</p>
        </div>
      </div>

      {/* Date selector */}
      <div className="px-6 mt-6">
        <h2 className="font-montserrat font-bold text-foreground tracking-tighter mb-3">
          Março 2026
        </h2>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {weekDays.map((d) => (
            <motion.button
              key={d.full}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedDate(d.full)}
              className={`flex flex-col items-center gap-1 rounded-2xl px-4 py-3 min-w-[60px] transition-colors ${
                selectedDate === d.full ? "btn-primary-glow" : "surface-card"
              }`}
            >
              <span
                className={`text-xs font-opensans ${
                  selectedDate === d.full ? "text-primary-foreground" : "text-dimmed"
                }`}
              >
                {d.day}
              </span>
              <span
                className={`font-montserrat font-bold text-lg tabular-nums ${
                  selectedDate === d.full ? "text-primary-foreground" : "text-foreground"
                }`}
              >
                {d.date}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Time slots */}
      <div className="px-6 mt-8">
        <h2 className="font-montserrat font-bold text-foreground tracking-tighter mb-3">
          Horários disponíveis
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {timeSlots.map((time) => (
            <motion.button
              key={time}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedTime(time)}
              className={`rounded-xl px-4 py-3 font-opensans font-semibold text-sm tabular-nums transition-colors ${
                selectedTime === time
                  ? "btn-primary-glow text-primary-foreground"
                  : "surface-card text-foreground"
              }`}
            >
              {time}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Confirm */}
      {selectedTime && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent"
        >
          <motion.button
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={handleConfirm}
            className="w-full rounded-2xl py-4 font-montserrat font-bold text-lg tracking-tight"
            style={{ background: "#25D366", color: "#FFFFFF" }}
          >
            Confirmar via WhatsApp · {selectedTime}
          </motion.button>
        </motion.div>
      )}

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
    </div>
  );
}
