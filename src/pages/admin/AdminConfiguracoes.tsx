import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminCrud } from "@/lib/admin-api";
import { toast } from "sonner";
import { Save, Clock, Phone, Image } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

const DAYS = [
  { key: "monday", label: "Segunda" },
  { key: "tuesday", label: "Terça" },
  { key: "wednesday", label: "Quarta" },
  { key: "thursday", label: "Quinta" },
  { key: "friday", label: "Sexta" },
  { key: "saturday", label: "Sábado" },
  { key: "sunday", label: "Domingo" },
];

interface DaySchedule {
  open: string;
  close: string;
  enabled: boolean;
}

interface ContactInfo {
  phone: string;
  whatsapp: string;
  instagram: string;
  address: string;
}

export default function AdminConfiguracoes() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"horarios" | "contato">("horarios");
  const [hours, setHours] = useState<Record<string, DaySchedule>>({});
  const [contact, setContact] = useState<ContactInfo>({ phone: "", whatsapp: "", instagram: "", address: "" });

  const loadSettings = useCallback(async () => {
    setLoading(true);
    const res = await adminCrud<Record<string, any>>("get_settings");
    if (res.data) {
      if (res.data.business_hours) setHours(res.data.business_hours);
      if (res.data.contact_info) setContact(res.data.contact_info);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const saveHours = async () => {
    setSaving(true);
    const res = await adminCrud("update_setting", { key: "business_hours", value: hours });
    if (res.error) toast.error(res.error);
    else toast.success("Horários salvos!");
    setSaving(false);
  };

  const saveContact = async () => {
    setSaving(true);
    const res = await adminCrud("update_setting", { key: "contact_info", value: contact });
    if (res.error) toast.error(res.error);
    else toast.success("Contato salvo!");
    setSaving(false);
  };

  const updateDay = (dayKey: string, field: keyof DaySchedule, value: any) => {
    setHours(prev => ({
      ...prev,
      [dayKey]: { ...prev[dayKey], [field]: value },
    }));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="font-montserrat font-bold text-2xl" style={{ color: "#FFFFFF" }}>
          Configurações
        </h1>

        <div className="flex gap-2">
          {[
            { id: "horarios" as const, label: "Horários", icon: Clock },
            { id: "contato" as const, label: "Contato", icon: Phone },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl font-opensans text-sm font-medium transition-all"
              style={{
                background: tab === t.id ? "rgba(37, 99, 235, 0.15)" : "rgba(255,255,255,0.05)",
                color: tab === t.id ? "#FFFFFF" : "#9CA3AF",
              }}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#2563EB", borderTopColor: "transparent" }} />
          </div>
        ) : tab === "horarios" ? (
          <div className="space-y-3">
            {DAYS.map(day => {
              const schedule = hours[day.key] || { open: "08:00", close: "19:00", enabled: true };
              return (
                <div key={day.key} className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: "#111111" }}>
                  <Switch
                    checked={schedule.enabled}
                    onCheckedChange={(v) => updateDay(day.key, "enabled", v)}
                  />
                  <span className="font-opensans font-medium text-sm w-20" style={{ color: schedule.enabled ? "#FFFFFF" : "#6B7280" }}>
                    {day.label}
                  </span>
                  {schedule.enabled && (
                    <div className="flex items-center gap-2 ml-auto">
                      <Input
                        type="time"
                        value={schedule.open}
                        onChange={(e) => updateDay(day.key, "open", e.target.value)}
                        className="w-28 h-9 text-sm rounded-lg border-0"
                        style={{ background: "#1F2937", color: "#FFFFFF" }}
                      />
                      <span style={{ color: "#6B7280" }}>—</span>
                      <Input
                        type="time"
                        value={schedule.close}
                        onChange={(e) => updateDay(day.key, "close", e.target.value)}
                        className="w-28 h-9 text-sm rounded-lg border-0"
                        style={{ background: "#1F2937", color: "#FFFFFF" }}
                      />
                    </div>
                  )}
                  {!schedule.enabled && (
                    <span className="ml-auto text-sm" style={{ color: "#6B7280" }}>Fechado</span>
                  )}
                </div>
              );
            })}
            <button
              onClick={saveHours}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-opensans font-semibold text-base transition-all"
              style={{ background: "#2563EB", color: "#FFFFFF", opacity: saving ? 0.6 : 1 }}
            >
              <Save className="h-5 w-5" />
              {saving ? "Salvando..." : "Salvar Horários"}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {[
              { key: "phone", label: "Telefone", placeholder: "(11) 99999-9999" },
              { key: "whatsapp", label: "WhatsApp", placeholder: "(11) 99999-9999" },
              { key: "instagram", label: "Instagram", placeholder: "@suabarbearia" },
              { key: "address", label: "Endereço", placeholder: "Rua Exemplo, 123" },
            ].map(field => (
              <div key={field.key} className="p-4 rounded-2xl space-y-2" style={{ background: "#111111" }}>
                <label className="font-opensans text-sm font-medium" style={{ color: "#9CA3AF" }}>
                  {field.label}
                </label>
                <Input
                  value={(contact as any)[field.key] || ""}
                  onChange={(e) => setContact(prev => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="h-11 rounded-lg border-0 text-base"
                  style={{ background: "#1F2937", color: "#FFFFFF" }}
                />
              </div>
            ))}
            <button
              onClick={saveContact}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-opensans font-semibold text-base transition-all"
              style={{ background: "#2563EB", color: "#FFFFFF", opacity: saving ? 0.6 : 1 }}
            >
              <Save className="h-5 w-5" />
              {saving ? "Salvando..." : "Salvar Contato"}
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
