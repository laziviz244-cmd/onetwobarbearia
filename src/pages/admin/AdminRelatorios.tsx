import { useEffect, useState, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { Calendar, TrendingUp, Users, Scissors, DollarSign } from "lucide-react";
import { adminCrud } from "@/lib/admin-api";

interface Payment { id: string; client_name: string; service: string; amount: number; payment_method: string; date: string; }
interface Expense { id: string; description: string; amount: number; date: string; }
interface Appointment { id: string; client_name: string; service: string; time: string; date: string; }

export default function AdminRelatorios() {
  const [tab, setTab] = useState<"diario" | "mensal">("diario");
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
  const [dailyPayments, setDailyPayments] = useState<Payment[]>([]);
  const [dailyAppointments, setDailyAppointments] = useState<Appointment[]>([]);
  const [monthlyPayments, setMonthlyPayments] = useState<Payment[]>([]);
  const [monthlyExpenses, setMonthlyExpenses] = useState<Expense[]>([]);
  const [monthlyAppointments, setMonthlyAppointments] = useState<Appointment[]>([]);

  const loadDaily = useCallback(async () => {
    const res = await adminCrud<{ payments: Payment[]; appointments: Appointment[] }>("report_daily", { date: selectedDate });
    if (res.data) {
      setDailyPayments(res.data.payments || []);
      setDailyAppointments(res.data.appointments || []);
    }
  }, [selectedDate]);

  const loadMonthly = useCallback(async () => {
    const monthDate = new Date(selectedMonth + "-01T12:00:00");
    const start = format(startOfMonth(monthDate), "yyyy-MM-dd");
    const end = format(endOfMonth(monthDate), "yyyy-MM-dd");
    const res = await adminCrud<{ payments: Payment[]; expenses: Expense[]; appointments: Appointment[] }>("report_monthly", { start, end });
    if (res.data) {
      setMonthlyPayments(res.data.payments || []);
      setMonthlyExpenses(res.data.expenses || []);
      setMonthlyAppointments(res.data.appointments || []);
    }
  }, [selectedMonth]);

  useEffect(() => { loadDaily(); }, [loadDaily]);
  useEffect(() => { loadMonthly(); }, [loadMonthly]);

  const dailyTotal = dailyPayments.reduce((s, p) => s + Number(p.amount), 0);
  const monthlyTotal = monthlyPayments.reduce((s, p) => s + Number(p.amount), 0);
  const monthlyExpenseTotal = monthlyExpenses.reduce((s, e) => s + Number(e.amount), 0);
  const monthlyProfit = monthlyTotal - monthlyExpenseTotal;
  const monthlyClients = new Set(monthlyAppointments.map(a => a.client_name)).size;

  const serviceCounts: Record<string, number> = {};
  monthlyAppointments.forEach(a => { serviceCounts[a.service] = (serviceCounts[a.service] || 0) + 1; });
  const topService = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0];

  const methodLabel = (m: string) => ({ pix: "PIX", dinheiro: "Dinheiro", cartao: "Cartão" }[m] || m);
  const cardStyle = { background: "#0F172A", border: "1px solid #1F2937" };
  const inputStyle = { background: "#0F172A", border: "1px solid #1F2937", color: "#F9FAFB" };

  return (
    <AdminLayout>
      <h1 className="font-montserrat font-bold text-2xl tracking-tight mb-4" style={{ color: "#F9FAFB" }}>Relatórios</h1>

      <div className="flex gap-2 mb-6">
        {(["diario", "mensal"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className="px-4 py-2 rounded-xl text-sm font-montserrat font-semibold transition-all"
            style={tab === t ? { background: "#2563EB", color: "#FFFFFF" } : { background: "#0F172A", color: "#9CA3AF", border: "1px solid #1F2937" }}>
            {t === "diario" ? "Diário" : "Mensal"}
          </button>
        ))}
      </div>

      {tab === "diario" ? (
        <>
          <div className="mb-4">
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="rounded-xl px-4 py-2.5 text-sm font-opensans outline-none" style={inputStyle} />
          </div>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="rounded-2xl p-4" style={cardStyle}>
              <Calendar className="h-5 w-5 mb-2" style={{ color: "#2563EB" }} />
              <p className="font-montserrat font-bold text-xl tabular-nums" style={{ color: "#F9FAFB" }}>{dailyAppointments.length}</p>
              <p className="text-[10px] font-opensans" style={{ color: "#9CA3AF" }}>Atendimentos</p>
            </div>
            <div className="rounded-2xl p-4" style={cardStyle}>
              <DollarSign className="h-5 w-5 mb-2" style={{ color: "#22C55E" }} />
              <p className="font-montserrat font-bold text-xl tabular-nums" style={{ color: "#F9FAFB" }}>R$ {dailyTotal.toFixed(2)}</p>
              <p className="text-[10px] font-opensans" style={{ color: "#9CA3AF" }}>Faturado</p>
            </div>
          </div>

          <h3 className="font-montserrat font-bold text-sm mb-3" style={{ color: "#F9FAFB" }}>Atendimentos do dia</h3>
          <div className="flex flex-col gap-2">
            {dailyAppointments.length === 0 ? (
              <p className="text-sm text-center py-6 font-opensans" style={{ color: "#9CA3AF" }}>Nenhum atendimento nesta data</p>
            ) : dailyAppointments.map(a => (
              <div key={a.id} className="rounded-xl p-3 flex items-center gap-3" style={cardStyle}>
                <span className="text-sm font-opensans font-semibold tabular-nums w-12" style={{ color: "#9CA3AF" }}>{a.time}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-opensans font-semibold truncate" style={{ color: "#F9FAFB" }}>{a.client_name}</p>
                  <p className="text-xs" style={{ color: "#9CA3AF" }}>{a.service}</p>
                </div>
              </div>
            ))}
          </div>

          {dailyPayments.length > 0 && (
            <>
              <h3 className="font-montserrat font-bold text-sm mb-3 mt-6" style={{ color: "#F9FAFB" }}>Pagamentos</h3>
              <div className="flex flex-col gap-2">
                {dailyPayments.map(p => (
                  <div key={p.id} className="rounded-xl p-3 flex items-center gap-3" style={cardStyle}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-opensans font-semibold truncate" style={{ color: "#F9FAFB" }}>{p.client_name}</p>
                      <p className="text-xs" style={{ color: "#9CA3AF" }}>{p.service} · {methodLabel(p.payment_method)}</p>
                    </div>
                    <span className="font-montserrat font-bold text-sm tabular-nums" style={{ color: "#22C55E" }}>R$ {Number(p.amount).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        <>
          <div className="mb-4">
            <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="rounded-xl px-4 py-2.5 text-sm font-opensans outline-none" style={inputStyle} />
          </div>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="rounded-2xl p-4" style={cardStyle}>
              <TrendingUp className="h-5 w-5 mb-2" style={{ color: "#22C55E" }} />
              <p className="font-montserrat font-bold text-xl tabular-nums" style={{ color: "#F9FAFB" }}>R$ {monthlyTotal.toFixed(0)}</p>
              <p className="text-[10px] font-opensans" style={{ color: "#9CA3AF" }}>Faturamento</p>
            </div>
            <div className="rounded-2xl p-4" style={cardStyle}>
              <DollarSign className="h-5 w-5 mb-2" style={{ color: "#2563EB" }} />
              <p className="font-montserrat font-bold text-xl tabular-nums" style={{ color: monthlyProfit >= 0 ? "#F9FAFB" : "#EF4444" }}>R$ {monthlyProfit.toFixed(0)}</p>
              <p className="text-[10px] font-opensans" style={{ color: "#9CA3AF" }}>Lucro</p>
            </div>
            <div className="rounded-2xl p-4" style={cardStyle}>
              <Users className="h-5 w-5 mb-2" style={{ color: "#2563EB" }} />
              <p className="font-montserrat font-bold text-xl tabular-nums" style={{ color: "#F9FAFB" }}>{monthlyClients}</p>
              <p className="text-[10px] font-opensans" style={{ color: "#9CA3AF" }}>Clientes</p>
            </div>
            <div className="rounded-2xl p-4" style={cardStyle}>
              <Scissors className="h-5 w-5 mb-2" style={{ color: "#2563EB" }} />
              <p className="font-montserrat font-bold text-lg truncate" style={{ color: "#F9FAFB" }}>{topService ? topService[0] : "—"}</p>
              <p className="text-[10px] font-opensans" style={{ color: "#9CA3AF" }}>Serviço mais realizado {topService ? `(${topService[1]}x)` : ""}</p>
            </div>
          </div>

          <h3 className="font-montserrat font-bold text-sm mb-3" style={{ color: "#F9FAFB" }}>Por forma de pagamento</h3>
          <div className="flex flex-col gap-2 mb-6">
            {["pix", "dinheiro", "cartao"].map(m => {
              const total = monthlyPayments.filter(p => p.payment_method === m).reduce((s, p) => s + Number(p.amount), 0);
              if (total === 0) return null;
              return (
                <div key={m} className="rounded-xl p-3 flex items-center justify-between" style={cardStyle}>
                  <span className="text-sm font-opensans" style={{ color: "#F9FAFB" }}>{methodLabel(m)}</span>
                  <span className="font-montserrat font-bold text-sm tabular-nums" style={{ color: "#F9FAFB" }}>R$ {total.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </AdminLayout>
  );
}
