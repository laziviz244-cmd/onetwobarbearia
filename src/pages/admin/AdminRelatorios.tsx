import { useEffect, useState, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, TrendingUp, Users, Scissors, DollarSign } from "lucide-react";

interface Payment {
  id: string;
  client_name: string;
  service: string;
  amount: number;
  payment_method: string;
  date: string;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
}

interface Appointment {
  id: string;
  client_name: string;
  service: string;
  time: string;
  date: string;
}

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
    const { data: p } = await (supabase as any).from("payments").select("*").eq("date", selectedDate).order("created_at");
    if (p) setDailyPayments(p);
    const { data: a } = await supabase.from("appointments").select("*").eq("date", selectedDate).order("time");
    if (a) setDailyAppointments(a as Appointment[]);
  }, [selectedDate]);

  const loadMonthly = useCallback(async () => {
    const monthDate = new Date(selectedMonth + "-01T12:00:00");
    const start = format(startOfMonth(monthDate), "yyyy-MM-dd");
    const end = format(endOfMonth(monthDate), "yyyy-MM-dd");

    const { data: p } = await (supabase as any).from("payments").select("*").gte("date", start).lte("date", end);
    if (p) setMonthlyPayments(p);

    const { data: e } = await (supabase as any).from("expenses").select("*").gte("date", start).lte("date", end);
    if (e) setMonthlyExpenses(e);

    const { data: a } = await supabase.from("appointments").select("*").gte("date", start).lte("date", end);
    if (a) setMonthlyAppointments(a as Appointment[]);
  }, [selectedMonth]);

  useEffect(() => { loadDaily(); }, [loadDaily]);
  useEffect(() => { loadMonthly(); }, [loadMonthly]);

  const dailyTotal = dailyPayments.reduce((s, p) => s + Number(p.amount), 0);
  const monthlyTotal = monthlyPayments.reduce((s, p) => s + Number(p.amount), 0);
  const monthlyExpenseTotal = monthlyExpenses.reduce((s, e) => s + Number(e.amount), 0);
  const monthlyProfit = monthlyTotal - monthlyExpenseTotal;
  const monthlyClients = new Set(monthlyAppointments.map(a => a.client_name)).size;

  // Most popular service
  const serviceCounts: Record<string, number> = {};
  monthlyAppointments.forEach(a => { serviceCounts[a.service] = (serviceCounts[a.service] || 0) + 1; });
  const topService = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0];

  const methodLabel = (m: string) => ({ pix: "PIX", dinheiro: "Dinheiro", cartao: "Cartão" }[m] || m);

  return (
    <AdminLayout>
      <h1 className="font-montserrat font-bold text-2xl text-foreground tracking-tight mb-4">Relatórios</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(["diario", "mensal"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-montserrat font-semibold transition-all ${
              tab === t ? "text-black" : "surface-card text-muted-foreground"
            }`}
            style={tab === t ? { background: "hsl(40, 50%, 55%)" } : undefined}
          >
            {t === "diario" ? "Diário" : "Mensal"}
          </button>
        ))}
      </div>

      {tab === "diario" ? (
        <>
          <div className="mb-4">
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="rounded-xl px-4 py-2.5 text-sm font-opensans outline-none bg-secondary text-foreground border border-[hsl(0,0%,100%,0.1)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="surface-card rounded-2xl p-4">
              <Calendar className="h-5 w-5 mb-2" style={{ color: "hsl(40, 50%, 55%)" }} />
              <p className="font-montserrat font-bold text-xl text-foreground tabular-nums">{dailyAppointments.length}</p>
              <p className="text-[10px] text-muted-foreground font-opensans">Atendimentos</p>
            </div>
            <div className="surface-card rounded-2xl p-4">
              <DollarSign className="h-5 w-5 mb-2" style={{ color: "hsl(120, 50%, 50%)" }} />
              <p className="font-montserrat font-bold text-xl text-foreground tabular-nums">R$ {dailyTotal.toFixed(2)}</p>
              <p className="text-[10px] text-muted-foreground font-opensans">Faturado</p>
            </div>
          </div>

          <h3 className="font-montserrat font-bold text-sm text-foreground mb-3">Atendimentos do dia</h3>
          <div className="flex flex-col gap-2">
            {dailyAppointments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6 font-opensans">Nenhum atendimento nesta data</p>
            ) : dailyAppointments.map(a => (
              <div key={a.id} className="surface-card rounded-xl p-3 flex items-center gap-3">
                <span className="text-sm font-opensans font-semibold tabular-nums text-muted-foreground w-12">{a.time}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-opensans font-semibold text-foreground truncate">{a.client_name}</p>
                  <p className="text-xs text-muted-foreground">{a.service}</p>
                </div>
              </div>
            ))}
          </div>

          {dailyPayments.length > 0 && (
            <>
              <h3 className="font-montserrat font-bold text-sm text-foreground mb-3 mt-6">Pagamentos</h3>
              <div className="flex flex-col gap-2">
                {dailyPayments.map(p => (
                  <div key={p.id} className="surface-card rounded-xl p-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-opensans font-semibold text-foreground truncate">{p.client_name}</p>
                      <p className="text-xs text-muted-foreground">{p.service} · {methodLabel(p.payment_method)}</p>
                    </div>
                    <span className="font-montserrat font-bold text-sm tabular-nums" style={{ color: "hsl(120, 50%, 50%)" }}>
                      R$ {Number(p.amount).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        <>
          <div className="mb-4">
            <input
              type="month"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="rounded-xl px-4 py-2.5 text-sm font-opensans outline-none bg-secondary text-foreground border border-[hsl(0,0%,100%,0.1)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="surface-card rounded-2xl p-4">
              <TrendingUp className="h-5 w-5 mb-2" style={{ color: "hsl(120, 50%, 50%)" }} />
              <p className="font-montserrat font-bold text-xl text-foreground tabular-nums">R$ {monthlyTotal.toFixed(0)}</p>
              <p className="text-[10px] text-muted-foreground font-opensans">Faturamento</p>
            </div>
            <div className="surface-card rounded-2xl p-4">
              <DollarSign className="h-5 w-5 mb-2" style={{ color: "hsl(40, 50%, 55%)" }} />
              <p className={`font-montserrat font-bold text-xl tabular-nums ${monthlyProfit >= 0 ? "text-foreground" : "text-destructive"}`}>
                R$ {monthlyProfit.toFixed(0)}
              </p>
              <p className="text-[10px] text-muted-foreground font-opensans">Lucro (receita - despesas)</p>
            </div>
            <div className="surface-card rounded-2xl p-4">
              <Users className="h-5 w-5 mb-2" style={{ color: "hsl(40, 50%, 55%)" }} />
              <p className="font-montserrat font-bold text-xl text-foreground tabular-nums">{monthlyClients}</p>
              <p className="text-[10px] text-muted-foreground font-opensans">Clientes</p>
            </div>
            <div className="surface-card rounded-2xl p-4">
              <Scissors className="h-5 w-5 mb-2" style={{ color: "hsl(40, 50%, 55%)" }} />
              <p className="font-montserrat font-bold text-lg text-foreground truncate">{topService ? topService[0] : "—"}</p>
              <p className="text-[10px] text-muted-foreground font-opensans">
                Serviço mais realizado {topService ? `(${topService[1]}x)` : ""}
              </p>
            </div>
          </div>

          {/* Payment method breakdown */}
          <h3 className="font-montserrat font-bold text-sm text-foreground mb-3">Por forma de pagamento</h3>
          <div className="flex flex-col gap-2 mb-6">
            {["pix", "dinheiro", "cartao"].map(m => {
              const total = monthlyPayments.filter(p => p.payment_method === m).reduce((s, p) => s + Number(p.amount), 0);
              if (total === 0) return null;
              return (
                <div key={m} className="surface-card rounded-xl p-3 flex items-center justify-between">
                  <span className="text-sm font-opensans text-foreground">{methodLabel(m)}</span>
                  <span className="font-montserrat font-bold text-sm tabular-nums text-foreground">R$ {total.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </AdminLayout>
  );
}
