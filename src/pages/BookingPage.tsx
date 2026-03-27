import { motion } from "framer-motion";
import { ArrowLeft, Check } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

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

function getClientName(): string | null {
  const user = localStorage.getItem("onetwo_user");
  if (user) {
    try { return JSON.parse(user).username || null; } catch { return null; }
  }
  return localStorage.getItem("onetwo_guest_name") || null;
}

export default function BookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const serviceName = searchParams.get("servico") || "Corte";

  const [selectedDate, setSelectedDate] = useState("2026-03-18");
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [guestName, setGuestName] = useState("");

  const reservedSlots = useMemo(() => {
    const appointments = JSON.parse(localStorage.getItem("onetwo_appointments") || "[]");
    return appointments
      .filter((a: any) => a.date === selectedDate && a.status === "Confirmado")
      .map((a: any) => a.time as string);
  }, [selectedDate]);

  const [bookingMode, setBookingMode] = useState<"site" | "whatsapp" | null>(null);

  const handleConfirm = (mode: "site" | "whatsapp") => {
    if (!selectedTime) return;
    setBookingMode(mode);

    const clientName = getClientName();
    if (!clientName) {
      setShowNameModal(true);
      return;
    }

    finalizeBooking(clientName, mode);
  };

  const handleGuestConfirm = () => {
    const name = guestName.trim();
    if (!name) return;
    localStorage.setItem("onetwo_guest_name", name);
    localStorage.setItem("last_logged_user", name);
    setShowNameModal(false);
    finalizeBooking(name, bookingMode || "site");
  };

  const finalizeBooking = (clientName: string, mode: "site" | "whatsapp") => {
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
      clientName,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem("onetwo_appointments", JSON.stringify(existing));

    const loyaltyCount = parseInt(localStorage.getItem("onetwo_loyalty") || "0", 10);
    localStorage.setItem("onetwo_loyalty", String(loyaltyCount + 1));

    if (mode === "whatsapp") {
      const msg = encodeURIComponent(
        `Olá! Meu nome é ${clientName}. Gostaria de confirmar meu agendamento de ${serviceName} para o dia ${dateLabel}/2026 às ${selectedTime}.`
      );
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank", "noopener,noreferrer");
    }

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
          {timeSlots.map((time) => {
            const isReserved = reservedSlots.includes(time);
            return (
              <motion.button
                key={time}
                whileTap={isReserved ? undefined : { scale: 0.95 }}
                onClick={() => {
                  if (isReserved) {
                    toast({
                      title: "Putz! Horário indisponível",
                      description: "Este horário já foi reservado por outro cliente. Por favor, marque outro.",
                      variant: "destructive",
                    });
                    return;
                  }
                  setSelectedTime(time);
                }}
                disabled={isReserved}
                className={`rounded-xl px-2 py-3 font-opensans text-sm tabular-nums transition-colors ${
                  isReserved
                    ? "surface-card opacity-40 cursor-not-allowed"
                    : selectedTime === time
                      ? "btn-primary-glow text-primary-foreground font-semibold"
                      : "surface-card text-foreground font-semibold"
                }`}
              >
                {isReserved ? (
                  <span className="flex flex-col items-center leading-tight">
                    <span style={{ color: "#808080" }}>{time}</span>
                    <span className="text-[10px]" style={{ color: "#808080" }}>Reservado</span>
                  </span>
                ) : (
                  time
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Confirm */}
      {selectedTime && !reservedSlots.includes(selectedTime) && (
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

      {/* Guest Name Modal */}
      <Dialog open={showNameModal} onOpenChange={setShowNameModal}>
        <DialogContent
          className="rounded-2xl border-0 max-w-[340px]"
          style={{
            background: "hsl(0 0% 5%)",
            border: "1px solid hsl(43 70% 45% / 0.4)",
          }}
        >
          <DialogHeader>
            <DialogTitle className="font-montserrat font-bold text-foreground text-center">
              Qual o seu nome?
            </DialogTitle>
            <DialogDescription className="text-center text-dimmed font-opensans text-sm">
              Para registrar seu agendamento
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-2">
            <Input
              placeholder="Seu nome"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGuestConfirm()}
              className="rounded-xl border-0 font-opensans"
              style={{
                background: "hsl(0 0% 10%)",
                color: "hsl(0 0% 100%)",
              }}
              autoFocus
            />
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleGuestConfirm}
              disabled={!guestName.trim()}
              className="w-full rounded-2xl py-3 font-montserrat font-bold text-sm tracking-tight disabled:opacity-40"
              style={{ background: "#25D366", color: "#FFFFFF" }}
            >
              Confirmar Agendamento
            </motion.button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
