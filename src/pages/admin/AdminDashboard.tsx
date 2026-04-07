import { useEffect, useState, useCallback } from "react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import AdminLayout from "@/components/admin/AdminLayout";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Users, DollarSign, Clock, ChevronRight, Edit2, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { adminCrud } from "@/lib/admin-api";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Appointment {
  id: string;
  client_name: string;
  service: string;
  time: string;
  status: string;
  phone?: string;
  date: string;
}

const SERVICES = ["Corte Masculino", "Barba", "Corte + Barba", "Degradê", "Pigmentação", "Sobrancelha"];

function getTodayDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

async function fetchDashboardData(today: string) {
  const res = await adminCrud("dashboard_data", { date: today });
  if (res.error) throw new Error(res.error);
  const raw = res as any;
  const appointments: Appointment[] = raw.appointments || raw.data?.appointments || [];
  const todayRevenue: number = raw.todayRevenue ?? raw.data?.todayRevenue ?? 0;
  return { appointments, todayRevenue };
}

export default function AdminDashboard() {
  const { user } = useAdminAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingApt, setEditingApt] = useState<Appointment | null>(null);
  const [editForm, setEditForm] = useState({ client_name: "", service: "", time: "", phone: "" });
  const today = getTodayDate();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard", today],
    queryFn: () => fetchDashboardData(today),
    staleTime: 0,
    gcTime: Infinity,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
  });

  const appointments = data?.appointments ?? [];
  const todayRevenue = data?.todayRevenue ?? 0;
  const todayClients = new Set(appointments.map((a) => a.client_name)).size;

  // Realtime subscription with reconnection
  useEffect(() => {
    const channel = supabase
      .channel("dashboard-appointments-rt")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "appointments" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["admin-dashboard", today] });
        }
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          // Reconnect on error
          setTimeout(() => {
            supabase.removeChannel(channel);
            // Re-subscribing will happen on next render cycle
            queryClient.invalidateQueries({ queryKey: ["admin-dashboard", today] });
          }, 1000);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, today]);

  const handleDelete = async () => {
    if (!deleteId) return;
    // Optimistic: remove from cache
    queryClient.setQueryData(["admin-dashboard", today], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        appointments: old.appointments.filter((a: Appointment) => a.id !== deleteId),
      };
    });
    const res = await adminCrud("delete_appointment", { id: deleteId });
    if (res.error) {
      toast.error("Erro ao excluir agendamento.");
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard", today] });
    } else {
      toast.success("Agendamento excluído!");
    }
    setDeleteId(null);
  };

  const openEdit = (apt: Appointment) => {
    setEditingApt(apt);
    setEditForm({ client_name: apt.client_name, service: apt.service, time: apt.time, phone: apt.phone || "" });
  };

  const handleEditSave = async () => {
    if (!editingApt) return;
    if (!editForm.client_name.trim() || !editForm.time) {
      toast.error("Preencha nome e horário.");
      return;
    }
    // Optimistic update
    const updatedApt = { ...editingApt, ...editForm, client_name: editForm.client_name.trim() };
    queryClient.setQueryData(["admin-dashboard", today], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        appointments: old.appointments.map((a: Appointment) => a.id === editingApt.id ? updatedApt : a),
      };
    });
    setEditingApt(null);

    const res = await adminCrud("update_appointment", {
      id: editingApt.id,
      client_name: editForm.client_name.trim(),
      service: editForm.service,
      time: editForm.time,
      phone: editForm.phone || null,
    });
    if (res.error) {
      toast.error("Erro ao atualizar.");
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard", today] });
    } else {
      toast.success("Agendamento atualizado!");
    }
  };

  const stats = [
    { icon: Calendar, label: "Agendamentos", value: String(appointments.length), sub: "hoje" },
    { icon: Users, label: "Clientes", value: String(todayClients), sub: "hoje" },
    { icon: DollarSign, label: "Faturamento", value: `R$ ${todayRevenue.toFixed(0)}`, sub: "hoje" },
  ];

  const now = format(new Date(), "HH:mm");
  const inputStyle = { background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" };

  return (
    <AdminLayout>
      {/* Hero title */}
      <div className="mb-10">
        <p className="text-xl font-opensans text-muted-foreground">
          {"Olá, Onetwo👋"}
        </p>
        <h1 className="font-montserrat font-extrabold text-[2.5rem] leading-tight tracking-tight mt-3 text-foreground">
          Seus agendamentos 
        </h1>
        <p className="text-xl font-opensans mt-3 text-muted-foreground">
          {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-10">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl p-5 flex flex-col items-start gap-2 bg-card">
            <stat.icon className="h-8 w-8 mb-1 text-primary" />
            <span className="font-montserrat font-bold text-[1.75rem] tabular-nums leading-tight text-foreground">
              {stat.value}
            </span>
            <span className="text-base font-opensans text-muted-foreground">{stat.sub}</span>
          </div>
        ))}
      </div>

      {/* Today's appointments */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-montserrat font-bold text-2xl tracking-tight text-foreground">
          Agenda do dia
        </h2>
        <button
          onClick={() => navigate("/admin/agenda")}
          className="text-base font-opensans font-semibold flex items-center gap-1 min-h-[48px] text-primary"
        >
          Ver tudo <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-col gap-4 pb-8">
        {isLoading && !data ? (
          <div className="rounded-2xl p-14 text-center bg-card">
            <Clock className="h-12 w-12 mx-auto mb-3 text-muted-foreground animate-pulse" />
            <p className="text-xl font-opensans text-muted-foreground">Carregando...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="rounded-2xl p-14 text-center bg-card">
            <Clock className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-xl font-opensans text-muted-foreground">Nenhum agendamento hoje</p>
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
                  className={`relative rounded-2xl px-5 py-6 bg-card ${isCurrent ? "border border-primary" : ""} ${isPast ? "opacity-50" : ""}`}
                >
                  {isCurrent && (
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary rounded-t-2xl" />
                  )}
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-opensans font-bold tabular-nums w-[3.5rem] flex-shrink-0 text-muted-foreground">
                      {apt.time}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-opensans font-semibold text-lg truncate text-foreground">
                        {apt.client_name}
                      </p>
                      <p className="text-base font-opensans mt-0.5 text-muted-foreground">{apt.service}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {isCurrent && (
                        <span className="text-xs font-montserrat font-bold px-3 py-1 rounded-full mr-1 text-primary-foreground bg-primary">AGORA</span>
                      )}
                      <button
                        onClick={() => openEdit(apt)}
                        className="h-11 w-11 flex items-center justify-center rounded-xl transition-colors active:bg-accent"
                      >
                        <Edit2 className="h-[20px] w-[20px] text-primary" strokeWidth={1.8} />
                      </button>
                      <button
                        onClick={() => setDeleteId(apt.id)}
                        className="h-11 w-11 flex items-center justify-center rounded-xl transition-colors active:bg-accent"
                      >
                        <Trash2 className="h-[20px] w-[20px] text-destructive" strokeWidth={1.8} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            <button
              onClick={() => navigate("/admin/agenda")}
              className="flex items-center gap-4 rounded-2xl px-5 py-5 w-full text-left transition-opacity hover:opacity-80 min-h-[56px] bg-card"
            >
              <Clock className="h-7 w-7 flex-shrink-0 text-primary" />
              <span className="font-opensans font-bold text-lg text-foreground">
                Adicionar agendamento manual
              </span>
            </button>
          </>
        )}
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-montserrat text-foreground">Excluir agendamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O agendamento será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-opensans">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-opensans">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit dialog */}
      <Dialog open={!!editingApt} onOpenChange={(open) => { if (!open) setEditingApt(null); }}>
        <DialogContent className="max-w-[calc(100vw-2rem)] mx-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-montserrat text-xl text-foreground">Editar Agendamento</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-3">
            <div>
              <label className="text-sm font-opensans mb-1.5 block text-muted-foreground">Nome do Cliente *</label>
              <input value={editForm.client_name} onChange={(e) => setEditForm(f => ({ ...f, client_name: e.target.value }))} className="w-full rounded-xl px-4 py-3.5 text-base font-opensans outline-none transition-all" style={inputStyle} />
            </div>
            <div>
              <label className="text-sm font-opensans mb-1.5 block text-muted-foreground">Telefone</label>
              <input value={editForm.phone} onChange={(e) => setEditForm(f => ({ ...f, phone: e.target.value }))} className="w-full rounded-xl px-4 py-3.5 text-base font-opensans outline-none transition-all" style={inputStyle} />
            </div>
            <div>
              <label className="text-sm font-opensans mb-1.5 block text-muted-foreground">Serviço *</label>
              <select value={editForm.service} onChange={(e) => setEditForm(f => ({ ...f, service: e.target.value }))} className="w-full rounded-xl px-4 py-3.5 text-base font-opensans outline-none transition-all" style={inputStyle}>
                {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-opensans mb-1.5 block text-muted-foreground">Horário *</label>
              <input value={editForm.time} onChange={(e) => setEditForm(f => ({ ...f, time: e.target.value }))} className="w-full rounded-xl px-4 py-3.5 text-base font-opensans outline-none transition-all" style={inputStyle} placeholder="HH:MM" />
            </div>
            <button onClick={handleEditSave} className="w-full py-4 rounded-xl font-montserrat font-bold text-base text-primary-foreground mt-1 transition-all hover:brightness-110 min-h-[52px] bg-primary">
              Salvar Alterações
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
