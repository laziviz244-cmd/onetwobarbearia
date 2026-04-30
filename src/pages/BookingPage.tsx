import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, CalendarOff, Loader2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentAppointmentUserId } from "@/lib/appointment-user";
import { tagOneSignalUser } from "@/lib/onesignal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { addDays, format, startOfDay, getDay } from "date-fns";

const ALL_TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
];

const DOW_TO_KEY: Record<number, string> = {
  0: "sunday", 1: "monday", 2: "tuesday", 3: "wednesday",
  4: "thursday", 5: "friday", 6: "saturday",
};

interface DaySchedule {
  open: string;
  close: string;
  enabled: boolean;
}

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
const SCHEDULE_FULL_MESSAGE =
  "Agenda Completa! Todos os horários para este período já estão reservados. Por favor, escolha outra data ou entre em contato para mais informações.";
const WALK_IN_WEEKDAY_MESSAGE =
  "Meios de semana atendemos exclusivamente por ordem de chegada. Agendamentos disponíveis apenas para finais de semana!";

function isWalkInOnlyWeekday(date: string) {
  if (!date) return false;
  const dow = getDay(new Date(date + "T12:00:00"));
  return dow >= 1 && dow <= 4;
}

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
  const [isBooking, setIsBooking] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(() => new Date());

  const [reservedSlots, setReservedSlots] = useState<string[]>([]);
  const [businessHours, setBusinessHours] = useState<Record<string, DaySchedule> | null>(null);

  const monthLabel = weekDays.find((d) => d.full === selectedDate)?.monthLabel ?? "";

  // Get schedule for selected date
  const selectedDaySchedule = useMemo(() => {
    if (!businessHours || !selectedDate) return null;
    const d = new Date(selectedDate + "T12:00:00");
    const dow = getDay(d);
    const key = DOW_TO_KEY[dow];
    return businessHours[key] ?? null;
  }, [businessHours, selectedDate]);

  const isWalkInWeekday = useMemo(() => isWalkInOnlyWeekday(selectedDate), [selectedDate]);
  const isDayClosed = selectedDaySchedule ? !selectedDaySchedule.enabled : false;

  useEffect(() => {
    let intervalId: number | undefined;

    const syncClock = () => setCurrentDateTime(new Date());
    const now = new Date();
    const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds() + 50;

    const timeoutId = window.setTimeout(() => {
      syncClock();
      intervalId = window.setInterval(syncClock, 60_000);
    }, msUntilNextMinute);

    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId) window.clearInterval(intervalId);
    };
  }, []);

  // Filter time slots based on business hours and hide past slots for today
  const timeSlots = useMemo(() => {
    const baseSlots = !selectedDaySchedule || !selectedDaySchedule.enabled
      ? ALL_TIME_SLOTS
      : ALL_TIME_SLOTS.filter((t) => t >= selectedDaySchedule.open && t < selectedDaySchedule.close);

    if (selectedDate !== format(currentDateTime, "yyyy-MM-dd")) return baseSlots;

    return baseSlots.filter((time) => {
      const [hours, minutes] = time.split(":").map(Number);
      const slotLimit = new Date(selectedDate + "T00:00:00");
      slotLimit.setHours(hours, minutes, 59, 999);
      return currentDateTime <= slotLimit;
    });
  }, [selectedDaySchedule, selectedDate, currentDateTime]);

  const reservedVisibleSlots = timeSlots.filter((time) => reservedSlots.includes(time)).length;
  const isScheduleFull = !isDayClosed && timeSlots.length > 0 && reservedVisibleSlots === timeSlots.length;
  const hasNoBookableSlots = !isDayClosed && timeSlots.length === 0;
  const shouldBlockBooking = isWalkInWeekday || isScheduleFull || hasNoBookableSlots;
  const noSlotsMessage = shouldBlockBooking
    ? SCHEDULE_FULL_MESSAGE
    : null;

  const selectNextWeekend = useCallback(() => {
    const nextFriday = weekDays.find((d) => d.full > selectedDate && getDay(new Date(d.full + "T12:00:00")) === 5);
    if (!nextFriday) return;
    setSelectedDate(nextFriday.full);
    setSelectedTime(null);
  }, [selectedDate, weekDays]);

  // Clear selected time when day closes or the slot is no longer visible
  useEffect(() => {
    if (selectedTime && (isWalkInWeekday || isDayClosed || shouldBlockBooking || !timeSlots.includes(selectedTime) || reservedSlots.includes(selectedTime))) {
      setSelectedTime(null);
    }
  }, [isWalkInWeekday, isDayClosed, shouldBlockBooking, selectedTime, timeSlots, reservedSlots]);

  // Fetch business hours + subscribe to realtime
  useEffect(() => {
    const fetchHours = async () => {
      const { data } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "business_hours")
        .single();
      if (data?.value) setBusinessHours(data.value as unknown as Record<string, DaySchedule>);
    };
    fetchHours();

    const channelId = `business-hours-realtime-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const channel = supabase
      .channel(channelId)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "app_settings",
        filter: "key=eq.business_hours",
      }, (payload) => {
        if (payload.new?.value) {
          setBusinessHours(payload.new.value as unknown as Record<string, DaySchedule>);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    if (!selectedDate) return;
    const fetchReserved = async () => {
      const { data } = await supabase
        .from("appointments")
        .select("time")
        .eq("date", selectedDate)
        .eq("status", "Confirmado")
        .order("time", { ascending: true });
      setReservedSlots((data || []).map((a: any) => a.time));
    };
    setReservedSlots([]);
    fetchReserved();

    const channelId = `slots-realtime-${selectedDate}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const channel = supabase
      .channel(channelId)
      .on("postgres_changes", { event: "*", schema: "public", table: "appointments" }, () => {
        fetchReserved();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedDate]);

  const handleConfirm = () => {
    if (!selectedTime || isBooking || isWalkInWeekday || shouldBlockBooking || reservedSlots.includes(selectedTime)) return;

    const clientName = getCurrentAppointmentUserId();
    if (!clientName) {
      setShowNameModal(true);
      return;
    }

    finalizeBooking(clientName);
  };

  const handleGuestConfirm = () => {
    if (isBooking) return;
    const name = guestName.trim();
    if (!name) return;
    localStorage.setItem("onetwo_guest_name", name);
    localStorage.setItem("last_logged_user", name);
    setShowNameModal(false);
    void finalizeBooking(name);
  };

  const finalizeBooking = async (clientName: string) => {
    if (!selectedTime || isBooking) return;
    setIsBooking(true);

    const d = new Date(selectedDate + "T00:00:00");
    const dateLabel = `${format(d, "dd")}/${format(d, "MM")}`;
    const userId = getCurrentAppointmentUserId() ?? clientName.trim();
    const timeToBook = selectedTime;

    // Atomic reservation: insert FIRST. Unique index blocks duplicates.
    const { data: inserted, error: insErr } = await supabase
      .from("appointments")
      .insert({
        service: serviceName,
        date: selectedDate,
        date_label: dateLabel,
        time: timeToBook,
        status: "Confirmado",
        client_name: clientName,
        user_id: userId,
      } as never)
      .select("id")
      .single();

    if (insErr) {
      console.error("Booking insert failed:", insErr);
      setIsBooking(false);

      if ((insErr as any)?.code === "23505") {
        setSelectedTime(null);
        const { data: refreshed } = await supabase
          .from("appointments")
          .select("time")
          .eq("date", selectedDate)
          .eq("status", "Confirmado");
        setReservedSlots((refreshed || []).map((a: any) => a.time));
        toast({
          title: "Horário indisponível",
          description: "Este horário acabou de ser preenchido. Por favor, escolha outro.",
          variant: "destructive",
        });
      } else {
        setSelectedTime(null);
        toast({
          title: "Erro ao agendar",
          description: "Não foi possível concluir o agendamento. Tente novamente.",
          variant: "destructive",
        });
      }
      return;
    }

    // Reservation confirmed — only now redirect to WhatsApp.
    const msg = encodeURIComponent(
      `📌 *NOVO AGENDAMENTO*\n\n👤 *Cliente:* ${clientName}\n✂️ *Serviço:* ${serviceName}\n📅 *Data:* ${dateLabel}\n⏰ *Horário:* ${timeToBook}\n\n✅ *Agendamento realizado pelo App!*`
    );
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${msg}`;

    window.location.href = whatsappUrl;

    setConfirmed(true);

    // 4) Fire-and-forget background tasks
    (async () => {
      tagOneSignalUser(userId);
      try {
        const { data: notifRes } = await supabase.functions.invoke("schedule-notification", {
          body: { clientName: userId, serviceName, dateLabel, time: timeToBook, date: selectedDate },
        });
        const notifId = (notifRes as any)?.notification_id ?? (notifRes as any)?.id;
        if (notifId && inserted?.id) {
          await supabase.from("appointments").update({ notification_id: notifId } as never).eq("id", inserted.id);
        }
      } catch (err) {
        console.warn("Notification scheduling failed:", err);
      }
    })();
  };

  if (confirmed) {
    const dateObj = weekDays.find((d) => d.full === selectedDate);
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex min-h-[calc(100vh-6rem)] flex-col items-center justify-center bg-background px-6"
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
    <div className="bg-background pb-8">
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
        <AnimatePresence mode="wait">
          {isWalkInWeekday ? (
            <motion.div
              key="walk-in-weekday"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center gap-4 rounded-2xl surface-card px-5 py-12 text-center"
            >
              <CalendarOff className="h-10 w-10 text-primary" />
              <p className="font-opensans text-sm leading-relaxed text-dimmed">{WALK_IN_WEEKDAY_MESSAGE}</p>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={selectNextWeekend}
                className="mt-2 rounded-2xl btn-primary-glow px-5 py-3 font-montserrat text-sm font-bold text-primary-foreground"
              >
                Agendar para o Final de Semana
              </motion.button>
            </motion.div>
          ) : isDayClosed ? (
            <motion.div
              key="closed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center py-16 rounded-2xl surface-card gap-3"
            >
              <CalendarOff className="h-10 w-10 text-dimmed" />
              <p className="font-montserrat font-bold text-foreground text-lg">Fechado para agendamentos</p>
              <p className="text-dimmed font-opensans text-sm text-center px-4">
                Este dia não está disponível. Selecione outra data.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="font-montserrat font-bold text-foreground tracking-tighter mb-3">
                Horários disponíveis
              </h2>
              {noSlotsMessage ? (
                <motion.div
                  key="schedule-full"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center gap-3 rounded-2xl surface-card px-5 py-10 text-center"
                >
                  <CalendarOff className="h-10 w-10 text-primary" />
                  <p className="font-montserrat text-lg font-bold text-foreground">Agenda Completa</p>
                  <p className="font-opensans text-sm leading-relaxed text-dimmed">{noSlotsMessage}</p>
                </motion.div>
              ) : (
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
                        disabled={isReserved || isBooking}
                        className={`rounded-xl px-2 py-3 font-opensans text-sm tabular-nums transition-colors ${
                          isReserved
                            ? "surface-card opacity-40 cursor-not-allowed"
                            : selectedTime === time
                              ? "btn-primary-glow text-primary-foreground font-semibold"
                              : "surface-card text-foreground font-semibold"
                        }`}
                      >
                        {isReserved ? (
                          <span className="flex flex-col items-center leading-tight text-muted-foreground">
                            <span>{time}</span>
                            <span className="text-[10px]">Reservado</span>
                          </span>
                        ) : (
                          time
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Confirm */}
      {selectedTime && !shouldBlockBooking && !reservedSlots.includes(selectedTime) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent"
        >
          <motion.button
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={() => handleConfirm()}
            disabled={isBooking}
            className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-montserrat font-bold text-sm tracking-tight disabled:opacity-80"
            style={{ background: "#25D366", color: "#FFFFFF" }}
          >
            {isBooking ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Validando horário...
              </>
            ) : (
              <>Confirmar via WhatsApp · {selectedTime}</>
            )}
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
              disabled={!guestName.trim() || isBooking}
              className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 font-montserrat font-bold text-sm tracking-tight disabled:opacity-40"
              style={{ background: "#25D366", color: "#FFFFFF" }}
            >
              {isBooking ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Validando...
                </>
              ) : (
                <>Confirmar Agendamento</>
              )}
            </motion.button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
