import { useEffect, useState } from "react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Users, DollarSign, Clock, ChevronRight, Trash2 } from "lucide-react";
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
      <div className="mb-8">
        <p className="text-sm font-opensans" style={{ color: "#9CA3AF" }}>
          <span>{"Olá, Onetwo👋"}</span>
        </p>
        <h1 className="font-montserrat font-bold text-2xl md:text-3xl tracking-tight mt-1" style={{ color: "#F9FAFB" }}>
          <span>​Seus agendamentos</span><span style={{ color: "#2563EB" }}>​</span><span> hoje</span>
        </h1>
        <p className="text-sm font-opensans mt-1" style={{ color: "#9CA3AF" }}>
          <span>{format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}</span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl p-5 flex flex-col items-start gap-1.5" style={{ background: "#111111", border: "none" }}>
            <stat.icon className="h-5 w-5 mb-1" style={{ color: "#2563EB" }} />
            <span className="font-montserrat font-bold text-xl tabular-nums" style={{ color: "#F9FAFB" }}>
              {stat.value}
            </span>
            <span className="text-[11px] font-opensans" style={{ color: "#9CA3AF" }}>{stat.sub}</span>
          </div>
        ))}
      </div>

      {/* Today's appointments */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-montserrat font-bold text-lg tracking-tight" style={{ color: "#F9FAFB" }}>
          Agenda do dia
        </h2>
        <button
          onClick={() => navigate("/admin/agenda")}
          className="text-xs font-opensans font-semibold flex items-center gap-0.5"
          style={{ color: "#2563EB" }}
        >
          Ver tudo <ChevronRight className="h-3 w-3" />
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {appointments.length === 0 ? (
          <div className="rounded-2xl p-10 text-center" style={{ background: "#111111" }}>
            <Clock className="h-8 w-8 mx-auto mb-2" style={{ color: "#9CA3AF" }} />
            <p className="text-sm font-opensans" style={{ color: "#9CA3AF" }}>Nenhum agendamento hoje</p>
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
                  className="relative rounded-2xl px-5 py-5"
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
                    <span className="text-sm font-opensans font-semibold tabular-nums w-14 flex-shrink-0" style={{ color: "#9CA3AF" }}>
                      {apt.time}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-opensans font-semibold text-sm truncate" style={{ color: "#F9FAFB" }}>
                        {apt.client_name}
                      </p>
                      <p className="text-xs font-opensans" style={{ color: "#9CA3AF" }}>{apt.service}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <div className="flex items-center gap-1">
                        {isPast && (
                          <span className="text-[11px] font-opensans" style={{ color: "#9CA3AF" }}>Concluído</span>
                        )}
                        {isCurrent && (
                          <span className="text-[11px] font-montserrat font-bold px-3 py-1 rounded-full" style={{ color: "#FFFFFF", background: "#2563EB" }}>AGORA</span>
                        )}
                        <ChevronRight className="h-4 w-4" style={{ color: "#9CA3AF" }} />
                      </div>
                      <button
                        onClick={() => handleDelete(apt.id)}
                        className="p-1.5 rounded-lg transition-opacity hover:opacity-70"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={1.5} style={{ color: "#FF0000" }} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Adicionar agendamento manual */}
            <button
              onClick={() => navigate("/admin/agenda")}
              className="flex items-center gap-3 rounded-2xl px-4 py-4 w-full text-left transition-opacity hover:opacity-80"
              style={{ background: "#111111" }}
            >
              <Clock className="h-5 w-5 flex-shrink-0" style={{ color: "#1a3a8f" }} />
              <span className="font-opensans font-bold text-sm" style={{ color: "#F9FAFB" }}>
                Adicionar agendamento manual
              </span>
            </button>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
