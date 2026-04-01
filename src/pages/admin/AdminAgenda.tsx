import { useEffect, useState, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, X, Edit2, Trash2, Phone } from "lucide-react";
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
    const { data } = await supabase
      .from("appointments")
      .select("*")
      .eq("date", selectedDate)
      .order("time");
    if (data) setAppointments(data as Appointment[]);
  }, [selectedDate]);

  useEffect(() => {
    loadAppointments();

    const channel = supabase
      .channel(`admin-agenda-${selectedDate}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "appointments" }, () => {
        loadAppointments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
    if (!form.client_name.trim() || !form.time) {
      toast.error("Preencha nome e horário.");
      return;
    }

    if (!editingId && occupiedTimes.has(form.time)) {
      toast.error("Esse horário já está ocupado.");
      return;
    }

    if (editingId) {
      const { error } = await supabase
        .from("appointments")
        .update({
          client_name: form.client_name.trim(),
          service: form.service,
          time: form.time,
          phone: form.phone || null,
        } as any)
        .eq("id", editingId);
      if (error) { toast.error("Erro ao atualizar."); return; }
      toast.success("Agendamento atualizado!");
    } else {
      const { error } = await supabase.from("appointments").insert({
        client_name: form.client_name.trim(),
        service: form.service,
        date: selectedDate,
        date_label: dateLabel,
        time: form.time,
        status: "Confirmado",
        user_id: form.client_name.trim(),
        phone: form.phone || null,
      } as any);
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

  // Date navigation (7 days)
  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = addDays(new Date(), i);
    return { value: format(d, "yyyy-MM-dd"), label: format(d, "EEE", { locale: ptBR }), day: format(d, "d") };
  });

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-montserrat font-bold text-2xl text-foreground tracking-tight">Agenda</h1>
        <button
          onClick={() => openNew()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-montserrat font-semibold text-sm text-black transition-opacity hover:opacity-90"
          style={{ background: "hsl(40, 50%, 55%)" }}
        >
          <Plus className="h-4 w-4" /> Novo
        </button>
      </div>

      {/* Date selector */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 -mx-1 px-1 scrollbar-hide">
        {dates.map((d) => (
          <button
            key={d.value}
            onClick={() => setSelectedDate(d.value)}
            className={`flex flex-col items-center min-w-[52px] py-2 px-3 rounded-xl text-xs font-opensans transition-all ${
              selectedDate === d.value ? "text-black font-bold" : "surface-card text-muted-foreground"
            }`}
            style={selectedDate === d.value ? { background: "hsl(40, 50%, 55%)" } : undefined}
          >
            <span className="uppercase text-[10px]">{d.label}</span>
            <span className="text-lg font-montserrat font-bold">{d.day}</span>
          </button>
        ))}
      </div>

      {/* Time slots */}
      <div className="flex flex-col gap-1.5">
        {TIME_SLOTS.map((time) => {
          const apt = appointments.find(a => a.time === time);
          return (
            <div
              key={time}
              className={`flex items-center gap-3 rounded-xl p-3 transition-all ${
                apt ? "surface-card border-l-2" : "surface-card opacity-60 hover:opacity-100"
              }`}
              style={apt ? { borderLeftColor: "hsl(40, 50%, 55%)" } : undefined}
            >
              <span className="text-sm font-opensans font-semibold tabular-nums text-muted-foreground w-12 flex-shrink-0">
                {time}
              </span>

              {apt ? (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="font-opensans font-semibold text-foreground text-sm truncate">{apt.client_name}</p>
                    <p className="text-xs text-muted-foreground font-opensans flex items-center gap-1">
                      {apt.service}
                      {apt.phone && (
                        <span className="inline-flex items-center gap-0.5 ml-2">
                          <Phone className="h-3 w-3" /> {apt.phone}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(apt)} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-[hsl(0,0%,100%,0.05)]">
                      <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    <button onClick={() => handleDelete(apt.id)} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-destructive/10">
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </button>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => openNew(time)}
                  className="flex-1 text-left text-xs text-muted-foreground font-opensans hover:text-foreground transition-colors"
                >
                  Horário livre — clique para agendar
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* New/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[hsl(0,0%,5%)] border-[hsl(0,0%,100%,0.1)] max-w-md">
          <DialogHeader>
            <DialogTitle className="font-montserrat text-foreground">
              {editingId ? "Editar Agendamento" : "Novo Agendamento"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 mt-2">
            <div>
              <label className="text-xs text-muted-foreground font-opensans mb-1 block">Nome do Cliente *</label>
              <input
                value={form.client_name}
                onChange={(e) => setForm(f => ({ ...f, client_name: e.target.value }))}
                className="w-full rounded-xl px-4 py-3 text-sm font-opensans outline-none bg-secondary text-foreground border border-[hsl(0,0%,100%,0.1)] focus:border-[hsl(40,50%,55%)] transition-colors"
                placeholder="Ex: João Silva"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-opensans mb-1 block">Telefone (opcional)</label>
              <input
                value={form.phone}
                onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full rounded-xl px-4 py-3 text-sm font-opensans outline-none bg-secondary text-foreground border border-[hsl(0,0%,100%,0.1)] focus:border-[hsl(40,50%,55%)] transition-colors"
                placeholder="(00) 00000-0000"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-opensans mb-1 block">Serviço *</label>
              <select
                value={form.service}
                onChange={(e) => setForm(f => ({ ...f, service: e.target.value }))}
                className="w-full rounded-xl px-4 py-3 text-sm font-opensans outline-none bg-secondary text-foreground border border-[hsl(0,0%,100%,0.1)] focus:border-[hsl(40,50%,55%)] transition-colors"
              >
                {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-opensans mb-1 block">Horário *</label>
              <select
                value={form.time}
                onChange={(e) => setForm(f => ({ ...f, time: e.target.value }))}
                className="w-full rounded-xl px-4 py-3 text-sm font-opensans outline-none bg-secondary text-foreground border border-[hsl(0,0%,100%,0.1)] focus:border-[hsl(40,50%,55%)] transition-colors"
              >
                <option value="">Selecione</option>
                {TIME_SLOTS.map(t => (
                  <option key={t} value={t} disabled={!editingId && occupiedTimes.has(t)}>
                    {t} {!editingId && occupiedTimes.has(t) ? "(Ocupado)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSave}
              className="w-full py-3 rounded-xl font-montserrat font-bold text-sm text-black mt-2 transition-opacity hover:opacity-90"
              style={{ background: "hsl(40, 50%, 55%)" }}
            >
              {editingId ? "Salvar Alterações" : "Criar Agendamento"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
