import { motion } from "framer-motion";
import { ArrowLeft, Check } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
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

const WHATSAPP_NUMBER = "5577999999999";

export default function BookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const serviceName = searchParams.get("servico") || "Corte";

  const [selectedDate, setSelectedDate] = useState("2026-03-18");
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    if (!selectedTime) return;

    const dateObj = weekDays.find((d) => d.full === selectedDate);
    const dateLabel = `${dateObj?.date}/03`;

    // Save to localStorage
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

    // Update loyalty count
    const loyaltyCount = parseInt(localStorage.getItem("onetwo_loyalty") || "0", 10);
    localStorage.setItem("onetwo_loyalty", String(loyaltyCount + 1));

    // Open WhatsApp
    const msg = encodeURIComponent(
      `Olá! Gostaria de confirmar meu agendamento:\n\n📋 Serviço: ${serviceName}\n📅 Data: ${dateLabel}/2026\n⏰ Horário: ${selectedTime}\n\nCliente: Meu Nome`
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
            Escolha o horário
          </h1>
          <p className="text-sm text-dimmed font-opensans">{serviceName}</p>
        </div>
      </div>

      {/* Date selector */}
      <div className="px-6 mt-8">
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
    </div>
  );
}
