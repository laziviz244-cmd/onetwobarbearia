import { useEffect, useState, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Appointment {
  id: string;
  client_name: string;
  service: string;
  time: string;
  date: string;
  date_label: string;
  status: string;
  phone?: string;
  user_id: string;
}

const SERVICES = ["Corte Masculino", "Barba", "Corte + Barba", "Degradê", "Pigmentação", "Sobrancelha"];
const TIME_SLOTS: string[] = [];
for (let h = 8; h < 20; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, "0")}:00`);
  TIME_SLOTS.push(`${String(h).padStart(2, "0")}:30`);
}

export default function AdminAgenda() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ client_name: "", phone: "", service: SERVICES[0], time: "" });

  const dateLabel = format(new Date(selectedDate + "T12:00:00"), "EEE, d MMM", { locale: ptBR });

  const loadAppointments = useCallback(async () => {
    const { data } = await supabase.from("appointments").select("*").eq("date", selectedDate).order("time");
    if (data) setAppointments(data as Appointment[]);
  }, [selectedDate]);

  useEffect(() => {
    loadAppointments();
    const channel = supabase
      .channel(`admin-agenda-${selectedDate}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "appointments" }, () => { loadAppointments(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadAppointments, selectedDate]);

  const occupiedTimes = new Set(appointments.map(a => a.time));

  const openNew = (time?: string) => {
    setEditingId(null);
    setForm({ client_name: "", phone: "", service: SERVICES[0], time: time || "" });
    setDialogOpen(true);
  };

  const openEdit = (apt: Appointment) => {
    setEditingId(apt.id);
    setForm({ client_name: apt.client_name, phone: apt.phone || "", service: apt.service, time: apt.time });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.client_name.trim() || !form.time) { toast.error("Preencha nome e horário."); return; }
    if (!editingId && occupiedTimes.has(form.time)) { toast.error("Esse horário já está ocupado."); return; }

    if (editingId) {
      const { error } = await supabase.from("appointments").update({ client_name: form.client_name.trim(), service: form.service, time: form.time, phone: form.phone || null } as any).eq("id", editingId);
      if (error) { toast.error("Erro ao atualizar."); return; }
      toast.success("Agendamento atualizado!");
    } else {
      const { error } = await supabase.from("appointments").insert({ client_name: form.client_name.trim(), service: form.service, date: selectedDate, date_label: dateLabel, time: form.time, status: "Confirmado", user_id: form.client_name.trim(), phone: form.phone || null } as any);
      if (error) { toast.error("Erro ao salvar."); return; }
      toast.success("Agendamento criado!");
    }
    setDialogOpen(false);
    loadAppointments();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("appointments").delete().eq("id", id);
    if (error) { toast.error("Erro ao cancelar."); return; }
    toast.success("Agendamento cancelado!");
    loadAppointments();
  };

  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = addDays(new Date(), i);
    return { value: format(d, "yyyy-MM-dd"), label: format(d, "EEE", { locale: ptBR }), day: format(d, "d") };
  });

  const inputStyle = { background: "#111111", border: "1px solid #1F2937", color: "#F9FAFB" };

  return (
    <AdminLayout>
      <div className="max-w-[100vw] overflow-x-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-montserrat font-bold text-[2.25rem] tracking-tight" style={{ color: "#F9FAFB" }}>Agenda</h1>
          <button
            onClick={() => openNew()}
            className="flex items-center gap-3 px-9 py-5 rounded-2xl font-montserrat font-bold text-xl text-white transition-all hover:brightness-110 active:scale-95 min-h-[56px]"
            style={{ background: "#2563EB" }}
          >
            <Plus className="h-8 w-8" /> Novo
          </button>
        </div>

        {/* Date selector */}
        <div className="flex gap-3 overflow-x-auto pb-5 mb-8 scrollbar-hide">
          {dates.map((d) => (
            <button
              key={d.value}
              onClick={() => setSelectedDate(d.value)}
              className="flex flex-col items-center min-w-[88px] py-5 px-5 rounded-2xl font-opensans transition-all flex-shrink-0 min-h-[80px]"
              style={selectedDate === d.value
                ? { background: "#2563EB", color: "#FFFFFF", fontWeight: 700 }
                : { background: "#111111", color: "#9CA3AF" }
              }
            >
              <span className="uppercase text-base font-semibold">{d.label}</span>
              <span className="text-3xl font-montserrat font-bold mt-1">{d.day}</span>
            </button>
          ))}
        </div>

        {/* Time slots */}
        <div className="flex flex-col gap-3 w-full">
          {TIME_SLOTS.map((time) => {
            const apt = appointments.find(a => a.time === time);
            return (
              <div
                key={time}
                className="flex items-center w-full rounded-2xl px-5 py-6 transition-all overflow-hidden min-h-[64px]"
                style={apt
                  ? { background: "#111111", borderLeft: "4px solid #2563EB" }
                  : { background: "#111111", opacity: 0.6 }
                }
                onMouseEnter={(e) => { if (!apt) e.currentTarget.style.opacity = "1"; }}
                onMouseLeave={(e) => { if (!apt) e.currentTarget.style.opacity = "0.6"; }}
              >
                <span className="text-xl font-opensans font-bold tabular-nums w-[4.5rem] flex-shrink-0" style={{ color: "#9CA3AF" }}>
                  {time}
                </span>

                {apt ? (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="font-opensans font-semibold text-xl truncate" style={{ color: "#F9FAFB" }}>
                        {apt.client_name}
                      </p>
                      <p className="text-lg font-opensans truncate mt-0.5" style={{ color: "#9CA3AF" }}>
                        {apt.service}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                      <button
                        onClick={() => openEdit(apt)}
                        className="min-h-[52px] min-w-[52px] flex items-center justify-center rounded-xl transition-colors active:bg-white/10"
                        style={{ color: "#9CA3AF" }}
                      >
                        <Edit2 className="h-6 w-6" />
                      </button>
                      <button
                        onClick={() => handleDelete(apt.id)}
                        className="min-h-[52px] min-w-[52px] flex items-center justify-center rounded-xl transition-colors active:bg-white/10"
                      >
                        <Trash2 className="h-6 w-6" style={{ color: "#EF4444" }} />
                      </button>
                    </div>
                  </>
                ) : (
                  <button onClick={() => openNew(time)} className="flex-1 text-left text-xl font-opensans font-medium transition-colors min-h-[48px] flex items-center" style={{ color: "#9CA3AF" }}>
                    Livre — agendar
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md mx-3" style={{ background: "#111111", borderColor: "#1F2937" }}>
            <DialogHeader>
              <DialogTitle className="font-montserrat text-xl" style={{ color: "#F9FAFB" }}>
                {editingId ? "Editar Agendamento" : "Novo Agendamento"}
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-5 mt-3">
              <div>
                <label className="text-sm font-opensans mb-1.5 block" style={{ color: "#9CA3AF" }}>Nome do Cliente *</label>
                <input value={form.client_name} onChange={(e) => setForm(f => ({ ...f, client_name: e.target.value }))} className="w-full rounded-xl px-5 py-4 text-lg font-opensans outline-none transition-all" style={inputStyle} placeholder="Ex: João Silva" onFocus={(e) => e.currentTarget.style.borderColor = "#2563EB"} onBlur={(e) => e.currentTarget.style.borderColor = "#1F2937"} />
              </div>
              <div>
                <label className="text-sm font-opensans mb-1.5 block" style={{ color: "#9CA3AF" }}>Telefone (opcional)</label>
                <input value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full rounded-xl px-5 py-4 text-lg font-opensans outline-none transition-all" style={inputStyle} placeholder="(00) 00000-0000" onFocus={(e) => e.currentTarget.style.borderColor = "#2563EB"} onBlur={(e) => e.currentTarget.style.borderColor = "#1F2937"} />
              </div>
              <div>
                <label className="text-sm font-opensans mb-1.5 block" style={{ color: "#9CA3AF" }}>Serviço *</label>
                <select value={form.service} onChange={(e) => setForm(f => ({ ...f, service: e.target.value }))} className="w-full rounded-xl px-5 py-4 text-lg font-opensans outline-none transition-all" style={inputStyle}>
                  {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-opensans mb-1.5 block" style={{ color: "#9CA3AF" }}>Horário *</label>
                <select value={form.time} onChange={(e) => setForm(f => ({ ...f, time: e.target.value }))} className="w-full rounded-xl px-5 py-4 text-lg font-opensans outline-none transition-all" style={inputStyle}>
                  <option value="">Selecione</option>
                  {TIME_SLOTS.map(t => (
                    <option key={t} value={t} disabled={!editingId && occupiedTimes.has(t)}>{t} {!editingId && occupiedTimes.has(t) ? "(Ocupado)" : ""}</option>
                  ))}
                </select>
              </div>
              <button onClick={handleSave} className="w-full py-4.5 rounded-xl font-montserrat font-bold text-lg text-white mt-2 transition-all hover:brightness-110 min-h-[56px]" style={{ background: "#2563EB" }}>
                {editingId ? "Salvar Alterações" : "Criar Agendamento"}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
