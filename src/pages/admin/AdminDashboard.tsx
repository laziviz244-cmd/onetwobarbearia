import { useEffect, useState } from "react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Users, DollarSign, Clock, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Appointment {
  id: string;
  client_name: string;
  service: string;
  time: string;
  status: string;
  phone?: string;
}

export default function AdminDashboard() {
  const { user } = useAdminAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [todayClients, setTodayClients] = useState(0);
  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("appointments").delete().eq("id", id);
    if (error) { toast.error("Erro ao cancelar."); return; }
    toast.success("Agendamento cancelado!");
    loadData();
  };

  const loadData = async () => {
    const { data: appts } = await supabase
      .from("appointments")
      .select("*")
      .eq("date", today)
      .order("time");
    if (appts) {
      setAppointments(appts as Appointment[]);
      setTodayClients(new Set(appts.map((a: any) => a.client_name)).size);
    }

    const { data: payments } = await (supabase as any)
      .from("payments")
      .select("amount")
      .eq("date", today);
    if (payments) {
      setTodayRevenue(payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0));
    }
  };

  const stats = [
    { icon: Calendar, label: "Agendamentos", value: String(appointments.length), sub: "hoje" },
    { icon: Users, label: "Clientes", value: String(todayClients), sub: "hoje" },
    { icon: DollarSign, label: "Faturamento", value: `R$ ${todayRevenue.toFixed(0)}`, sub: "hoje" },
  ];

  const now = format(new Date(), "HH:mm");

  return (
    <AdminLayout>
      {/* Hero title */}
      <div className="mb-10">
        <p className="text-xl font-opensans" style={{ color: "#9CA3AF" }}>
          {"Olá, Onetwo👋"}
        </p>
        <h1 className="font-montserrat font-extrabold text-[2.5rem] leading-tight tracking-tight mt-3" style={{ color: "#F9FAFB" }}>
          Seus agendamentos 
        </h1>
        <p className="text-xl font-opensans mt-3" style={{ color: "#9CA3AF" }}>
          {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-10">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl p-5 flex flex-col items-start gap-2" style={{ background: "#111111" }}>
            <stat.icon className="h-8 w-8 mb-1" style={{ color: "#2563EB" }} />
            <span className="font-montserrat font-bold text-[1.75rem] tabular-nums leading-tight" style={{ color: "#F9FAFB" }}>
              {stat.value}
            </span>
            <span className="text-base font-opensans" style={{ color: "#9CA3AF" }}>{stat.sub}</span>
          </div>
        ))}
      </div>

      {/* Today's appointments */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-montserrat font-bold text-2xl tracking-tight" style={{ color: "#F9FAFB" }}>
          Agenda do dia
        </h2>
        <button
          onClick={() => navigate("/admin/agenda")}
          className="text-base font-opensans font-semibold flex items-center gap-1 min-h-[48px]"
          style={{ color: "#2563EB" }}
        >
          Ver tudo <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-col gap-4 pb-8">
        {appointments.length === 0 ? (
          <div className="rounded-2xl p-14 text-center" style={{ background: "#111111" }}>
            <Clock className="h-12 w-12 mx-auto mb-3" style={{ color: "#9CA3AF" }} />
            <p className="text-xl font-opensans" style={{ color: "#9CA3AF" }}>Nenhum agendamento hoje</p>
          </div>
        ) : (
          <>
            {appointments.map((apt) => {
              const isPast = apt.time < now;
              const isCurrent = !isPast && appointments.filter(a => a.time <= now).length > 0 && apt.time === appointments.filter(a => a.time >= now)[0]?.time;
              return (
                <motion.div
                  key={apt.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative rounded-2xl px-5 py-8"
                  style={{
                    background: "#111111",
                    border: isCurrent ? "1px solid #2563EB" : "none",
                    opacity: isPast ? 0.5 : 1,
                  }}
                >
                  {isCurrent && (
                    <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: "#2563EB" }} />
                  )}
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-opensans font-bold tabular-nums w-[4.5rem] flex-shrink-0" style={{ color: "#9CA3AF" }}>
                      {apt.time}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-opensans font-semibold text-xl truncate" style={{ color: "#F9FAFB" }}>
                        {apt.client_name}
                      </p>
                      <p className="text-lg font-opensans mt-1" style={{ color: "#9CA3AF" }}>{apt.service}</p>
                    </div>
                    <div className="flex flex-col items-end gap-3 flex-shrink-0">
                      <div className="flex items-center gap-2">
                        {isPast && (
                          <span className="text-sm font-opensans" style={{ color: "#9CA3AF" }}>Concluído</span>
                        )}
                        {isCurrent && (
                          <span className="text-sm font-montserrat font-bold px-4 py-1.5 rounded-full" style={{ color: "#FFFFFF", background: "#2563EB" }}>AGORA</span>
                        )}
                        <ChevronRight className="h-5 w-5" style={{ color: "#9CA3AF" }} />
                      </div>
                      <button
                        onClick={() => handleDelete(apt.id)}
                        className="p-2 rounded-xl transition-opacity hover:opacity-70 min-h-[48px] min-w-[48px] flex items-center justify-center"
                      >
                        <Trash2 className="h-5 w-5" strokeWidth={1.5} style={{ color: "#FF0000" }} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            <button
              onClick={() => navigate("/admin/agenda")}
              className="flex items-center gap-4 rounded-2xl px-5 py-5 w-full text-left transition-opacity hover:opacity-80 min-h-[56px]"
              style={{ background: "#111111" }}
            >
              <Clock className="h-7 w-7 flex-shrink-0" style={{ color: "#1a3a8f" }} />
              <span className="font-opensans font-bold text-lg" style={{ color: "#F9FAFB" }}>
                Adicionar agendamento manual
              </span>
            </button>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
