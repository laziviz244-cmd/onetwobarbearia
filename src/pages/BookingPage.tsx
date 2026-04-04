import { motion } from "framer-motion";
import { ArrowLeft, Check } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentAppointmentUserId } from "@/lib/appointment-user";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { addDays, format, isAfter, isBefore, startOfDay, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";

const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
];

const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTH_LABELS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function generateWeekDays(): { day: string; date: string; full: string; monthLabel: string }[] {
  const today = startOfDay(new Date());
  const days: { day: string; date: string; full: string; monthLabel: string }[] = [];

  for (let i = 0; i < 14; i++) {
    const d = addDays(today, i);
    const dow = getDay(d); // 0=Sun
    if (dow === 0) continue; // skip Sunday
    days.push({
      day: DAY_LABELS[dow],
      date: format(d, "dd"),
      full: format(d, "yyyy-MM-dd"),
      monthLabel: `${MONTH_LABELS[d.getMonth()]} ${d.getFullYear()}`,
    });
  }

  return days;
}

const WHATSAPP_NUMBER = "5577981302545";

export default function BookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const serviceName = searchParams.get("servico") || "Corte";

  const weekDays = useMemo(() => generateWeekDays(), []);
  const [selectedDate, setSelectedDate] = useState(() => weekDays[0]?.full ?? "");
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [guestName, setGuestName] = useState("");

  const [reservedSlots, setReservedSlots] = useState<string[]>([]);

  const monthLabel = weekDays.find((d) => d.full === selectedDate)?.monthLabel ?? "";

  useEffect(() => {
    if (!selectedDate) return;
    const fetchReserved = async () => {
      const { data } = await supabase
        .from("appointments")
        .select("time")
        .eq("date", selectedDate)
        .eq("status", "Confirmado");
      setReservedSlots((data || []).map((a: any) => a.time));
    };
    fetchReserved();

    const channel = supabase
      .channel(`slots-realtime-${selectedDate}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "appointments" }, () => {
        fetchReserved();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedDate]);

  const handleConfirm = () => {
    if (!selectedTime) return;

    const clientName = getCurrentAppointmentUserId();
    if (!clientName) {
      setShowNameModal(true);
      return;
    }

    finalizeBooking(clientName);
  };

  const handleGuestConfirm = () => {
    const name = guestName.trim();
    if (!name) return;
    localStorage.setItem("onetwo_guest_name", name);
    localStorage.setItem("last_logged_user", name);
    setShowNameModal(false);
    finalizeBooking(name);
  };

  const finalizeBooking = async (clientName: string) => {
    if (!selectedTime) return;

    const d = new Date(selectedDate + "T00:00:00");
    const dateLabel = `${format(d, "dd")}/${format(d, "MM")}`;
    const userId = getCurrentAppointmentUserId() ?? clientName.trim();

    const { error } = await supabase.from("appointments").insert({
      service: serviceName,
      date: selectedDate,
      date_label: dateLabel,
      time: selectedTime,
      status: "Confirmado",
      client_name: clientName,
      user_id: userId,
    } as never);

    if (error) {
      toast({
        title: "Não foi possível concluir o agendamento",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
      return;
    }

    // Always open WhatsApp with booking details
    const msg = encodeURIComponent(
      `📌 *NOVO AGENDAMENTO*\n\n👤 *Cliente:* ${clientName}\n✂️ *Serviço:* ${serviceName}\n📅 *Data:* ${dateLabel}\n⏰ *Horário:* ${selectedTime}\n\n✅ *Agendamento realizado pelo App!*`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank", "noopener,noreferrer");

    setConfirmed(true);
  };

  if (confirmed) {
    const dateObj = weekDays.find((d) => d.full === selectedDate);
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
          {dateObj?.day} {dateObj?.date} · {selectedTime}
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
          {monthLabel}
        </h2>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {weekDays.map((d) => (
            <motion.button
              key={d.full}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectedDate(d.full);
                setSelectedTime(null);
              }}
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
            onClick={() => handleConfirm()}
            className="w-full rounded-2xl py-4 font-montserrat font-bold text-sm tracking-tight"
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
