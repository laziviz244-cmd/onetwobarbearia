import { useEffect, useState, useCallback, useMemo } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { format } from "date-fns";
import { Plus, Trash2, DollarSign, TrendingUp, TrendingDown, Search, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { adminCrud } from "@/lib/admin-api";
import { Input } from "@/components/ui/input";

interface Payment { id: string; client_name: string; service: string; amount: number; payment_method: string; date: string; created_at: string; }
interface Expense { id: string; description: string; amount: number; date: string; }

const PAYMENT_METHODS = [
  { value: "pix", label: "PIX" },
  { value: "dinheiro", label: "Dinheiro" },
  { value: "cartao", label: "Cartão" },
];
const SERVICES = ["Corte Masculino", "Barba", "Corte + Barba", "Degradê", "Pigmentação", "Sobrancelha"];

export default function AdminFinanceiro() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [tab, setTab] = useState<"pagamentos" | "despesas">("pagamentos");
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ client_name: "", service: SERVICES[0], amount: "", payment_method: "pix", date: format(new Date(), "yyyy-MM-dd") });
  const [expenseForm, setExpenseForm] = useState({ description: "", amount: "", date: format(new Date(), "yyyy-MM-dd") });

  const loadData = useCallback(async () => {
    const [pRes, eRes] = await Promise.all([
      adminCrud<Payment[]>("list_payments"),
      adminCrud<Expense[]>("list_expenses"),
    ]);
    if (pRes.data) setPayments(pRes.data);
    if (eRes.data) setExpenses(eRes.data);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const totalPayments = payments.reduce((s, p) => s + Number(p.amount), 0);
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const profit = totalPayments - totalExpenses;

  const handleSavePayment = async () => {
    if (!paymentForm.client_name.trim() || !paymentForm.amount) { toast.error("Preencha cliente e valor."); return; }
    const res = await adminCrud("add_payment", {
      client_name: paymentForm.client_name.trim(),
      service: paymentForm.service,
      amount: paymentForm.amount,
      payment_method: paymentForm.payment_method,
      date: paymentForm.date,
    });
    if (res.error) { toast.error("Erro ao salvar pagamento."); return; }
    toast.success("Pagamento registrado!");
    setPaymentDialogOpen(false);
    setPaymentForm({ client_name: "", service: SERVICES[0], amount: "", payment_method: "pix", date: format(new Date(), "yyyy-MM-dd") });
    loadData();
  };

  const handleSaveExpense = async () => {
    if (!expenseForm.description.trim() || !expenseForm.amount) { toast.error("Preencha descrição e valor."); return; }
    const res = await adminCrud("add_expense", {
      description: expenseForm.description.trim(),
      amount: expenseForm.amount,
      date: expenseForm.date,
    });
    if (res.error) { toast.error("Erro ao salvar despesa."); return; }
    toast.success("Despesa registrada!");
    setExpenseDialogOpen(false);
    setExpenseForm({ description: "", amount: "", date: format(new Date(), "yyyy-MM-dd") });
    loadData();
  };

  const handleDeletePayment = async (id: string) => {
    const res = await adminCrud("delete_payment", { id });
    if (res.error) { toast.error("Erro ao remover."); return; }
    toast.success("Pagamento removido.");
    loadData();
  };

  const handleDeleteExpense = async (id: string) => {
    const res = await adminCrud("delete_expense", { id });
    if (res.error) { toast.error("Erro ao remover."); return; }
    toast.success("Despesa removida.");
    loadData();
  };

  const methodLabel = (m: string) => PAYMENT_METHODS.find(p => p.value === m)?.label || m;

  const [searchQuery, setSearchQuery] = useState("");
  const [filterMethod, setFilterMethod] = useState("");

  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const matchesSearch = !searchQuery || p.client_name.toLowerCase().includes(searchQuery.toLowerCase()) || p.service.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMethod = !filterMethod || p.payment_method === filterMethod;
      return matchesSearch && matchesMethod;
    });
  }, [payments, searchQuery, filterMethod]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      return !searchQuery || e.description.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [expenses, searchQuery]);

  const inputStyle = { background: "#0F172A", border: "1px solid #1F2937", color: "#F9FAFB" };
  const cardStyle = { background: "#0F172A", border: "1px solid #1F2937" };

  return (
    <AdminLayout>
      <h1 className="font-montserrat font-bold text-[1.75rem] tracking-tight mb-6" style={{ color: "#F9FAFB" }}>Financeiro</h1>

      {/* Summary */}
      <div className="flex gap-2 mb-6">
        <div className="flex-1 rounded-2xl p-4 flex flex-col gap-1.5" style={cardStyle}>
          <TrendingUp className="h-5 w-5" style={{ color: "#22C55E" }} />
          <span className="font-montserrat font-bold text-lg tabular-nums" style={{ color: "#F9FAFB" }}>R$ {totalPayments.toFixed(0)}</span>
          <span className="text-xs font-opensans" style={{ color: "#9CA3AF" }}>Receitas</span>
        </div>
        <div className="flex-1 rounded-2xl p-4 flex flex-col gap-1.5" style={cardStyle}>
          <TrendingDown className="h-5 w-5" style={{ color: "#EF4444" }} />
          <span className="font-montserrat font-bold text-lg tabular-nums" style={{ color: "#F9FAFB" }}>R$ {totalExpenses.toFixed(0)}</span>
          <span className="text-xs font-opensans" style={{ color: "#9CA3AF" }}>Despesas</span>
        </div>
        <div className="flex-1 rounded-2xl p-4 flex flex-col gap-1.5" style={cardStyle}>
          <DollarSign className="h-5 w-5" style={{ color: "#2563EB" }} />
          <span className="font-montserrat font-bold text-lg tabular-nums" style={{ color: profit >= 0 ? "#F9FAFB" : "#EF4444" }}>R$ {profit.toFixed(0)}</span>
          <span className="text-xs font-opensans" style={{ color: "#9CA3AF" }}>Lucro</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 px-0">
        {(["pagamentos", "despesas"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className="flex-1 py-3 rounded-2xl font-montserrat font-semibold transition-all min-h-[48px] text-sm"
            style={tab === t ? { background: "#2563EB", color: "#FFFFFF" } : { background: "#0F172A", color: "#9CA3AF", border: "1px solid #1F2937" }}>
            {t === "pagamentos" ? "Pagamentos" : "Despesas"}
          </button>
        ))}
        <button onClick={() => tab === "pagamentos" ? setPaymentDialogOpen(true) : setExpenseDialogOpen(true)} className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl font-montserrat font-bold text-white transition-all hover:brightness-110 min-h-[48px] text-sm" style={{ background: "#2563EB" }}>
          <Plus className="h-5 w-5" /> Novo
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "#6B7280" }} />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={tab === "pagamentos" ? "Buscar cliente ou serviço..." : "Buscar descrição..."}
            className="pl-9 h-10 rounded-xl border-0 text-sm"
            style={{ background: "#0F172A", color: "#F9FAFB" }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="h-4 w-4" style={{ color: "#6B7280" }} />
            </button>
          )}
        </div>
        {tab === "pagamentos" && (
          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="rounded-xl px-3 py-2 text-sm font-opensans outline-none"
            style={{ background: "#0F172A", color: "#F9FAFB", border: "1px solid #1F2937" }}
          >
            <option value="">Todos</option>
            {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        )}
      </div>

      {/* List */}
      {tab === "pagamentos" ? (
        <div className="flex flex-col gap-2">
          {payments.length === 0 ? (
            <p className="text-sm text-center py-8 font-opensans" style={{ color: "#9CA3AF" }}>Nenhum pagamento registrado</p>
          ) : filteredPayments.map(p => (
            <div key={p.id} className="rounded-xl p-4 flex items-center gap-3" style={cardStyle}>
              <div className="flex-1 min-w-0">
                <p className="font-opensans font-semibold text-sm truncate" style={{ color: "#F9FAFB" }}>{p.client_name}</p>
                <p className="text-xs font-opensans" style={{ color: "#9CA3AF" }}>{p.service} · {methodLabel(p.payment_method)} · {format(new Date(p.date + "T12:00:00"), "dd/MM/yy")}</p>
              </div>
              <span className="font-montserrat font-bold text-sm tabular-nums" style={{ color: "#22C55E" }}>R$ {Number(p.amount).toFixed(2)}</span>
              <button onClick={() => handleDeletePayment(p.id)} className="h-8 w-8 flex items-center justify-center rounded-lg transition-colors" onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
                <Trash2 className="h-3.5 w-3.5" style={{ color: "#EF4444" }} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {expenses.length === 0 ? (
            <p className="text-sm text-center py-8 font-opensans" style={{ color: "#9CA3AF" }}>Nenhuma despesa registrada</p>
          ) : filteredExpenses.map(e => (
            <div key={e.id} className="rounded-xl p-4 flex items-center gap-3" style={cardStyle}>
              <div className="flex-1 min-w-0">
                <p className="font-opensans font-semibold text-sm truncate" style={{ color: "#F9FAFB" }}>{e.description}</p>
                <p className="text-xs font-opensans" style={{ color: "#9CA3AF" }}>{format(new Date(e.date + "T12:00:00"), "dd/MM/yy")}</p>
              </div>
              <span className="font-montserrat font-bold text-sm tabular-nums" style={{ color: "#EF4444" }}>R$ {Number(e.amount).toFixed(2)}</span>
              <button onClick={() => handleDeleteExpense(e.id)} className="h-8 w-8 flex items-center justify-center rounded-lg transition-colors" onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
                <Trash2 className="h-3.5 w-3.5" style={{ color: "#EF4444" }} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="max-w-md" style={{ background: "#0F172A", borderColor: "#1F2937" }}>
          <DialogHeader><DialogTitle className="font-montserrat" style={{ color: "#F9FAFB" }}>Registrar Pagamento</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-4 mt-2">
            <div><label className="text-xs font-opensans mb-1 block" style={{ color: "#9CA3AF" }}>Cliente *</label><input value={paymentForm.client_name} onChange={e => setPaymentForm(f => ({ ...f, client_name: e.target.value }))} className="w-full rounded-xl px-4 py-3 text-sm font-opensans outline-none transition-all" style={inputStyle} placeholder="Nome do cliente" onFocus={(e) => e.currentTarget.style.borderColor = "#2563EB"} onBlur={(e) => e.currentTarget.style.borderColor = "#1F2937"} /></div>
            <div><label className="text-xs font-opensans mb-1 block" style={{ color: "#9CA3AF" }}>Serviço</label><select value={paymentForm.service} onChange={e => setPaymentForm(f => ({ ...f, service: e.target.value }))} className="w-full rounded-xl px-4 py-3 text-sm font-opensans outline-none" style={inputStyle}>{SERVICES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
            <div><label className="text-xs font-opensans mb-1 block" style={{ color: "#9CA3AF" }}>Valor (R$) *</label><input type="number" step="0.01" value={paymentForm.amount} onChange={e => setPaymentForm(f => ({ ...f, amount: e.target.value }))} className="w-full rounded-xl px-4 py-3 text-sm font-opensans outline-none transition-all" style={inputStyle} placeholder="0.00" onFocus={(e) => e.currentTarget.style.borderColor = "#2563EB"} onBlur={(e) => e.currentTarget.style.borderColor = "#1F2937"} /></div>
            <div><label className="text-xs font-opensans mb-1 block" style={{ color: "#9CA3AF" }}>Forma de Pagamento</label><select value={paymentForm.payment_method} onChange={e => setPaymentForm(f => ({ ...f, payment_method: e.target.value }))} className="w-full rounded-xl px-4 py-3 text-sm font-opensans outline-none" style={inputStyle}>{PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}</select></div>
            <div><label className="text-xs font-opensans mb-1 block" style={{ color: "#9CA3AF" }}>Data</label><input type="date" value={paymentForm.date} onChange={e => setPaymentForm(f => ({ ...f, date: e.target.value }))} className="w-full rounded-xl px-4 py-3 text-sm font-opensans outline-none" style={inputStyle} /></div>
            <button onClick={handleSavePayment} className="w-full py-3 rounded-xl font-montserrat font-bold text-sm text-white mt-2 transition-all hover:brightness-110" style={{ background: "#2563EB" }}>Registrar Pagamento</button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Expense Dialog */}
      <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
        <DialogContent className="max-w-md" style={{ background: "#0F172A", borderColor: "#1F2937" }}>
          <DialogHeader><DialogTitle className="font-montserrat" style={{ color: "#F9FAFB" }}>Registrar Despesa</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-4 mt-2">
            <div><label className="text-xs font-opensans mb-1 block" style={{ color: "#9CA3AF" }}>Descrição *</label><input value={expenseForm.description} onChange={e => setExpenseForm(f => ({ ...f, description: e.target.value }))} className="w-full rounded-xl px-4 py-3 text-sm font-opensans outline-none transition-all" style={inputStyle} placeholder="Ex: Produtos, Aluguel..." onFocus={(e) => e.currentTarget.style.borderColor = "#2563EB"} onBlur={(e) => e.currentTarget.style.borderColor = "#1F2937"} /></div>
            <div><label className="text-xs font-opensans mb-1 block" style={{ color: "#9CA3AF" }}>Valor (R$) *</label><input type="number" step="0.01" value={expenseForm.amount} onChange={e => setExpenseForm(f => ({ ...f, amount: e.target.value }))} className="w-full rounded-xl px-4 py-3 text-sm font-opensans outline-none transition-all" style={inputStyle} placeholder="0.00" onFocus={(e) => e.currentTarget.style.borderColor = "#2563EB"} onBlur={(e) => e.currentTarget.style.borderColor = "#1F2937"} /></div>
            <div><label className="text-xs font-opensans mb-1 block" style={{ color: "#9CA3AF" }}>Data</label><input type="date" value={expenseForm.date} onChange={e => setExpenseForm(f => ({ ...f, date: e.target.value }))} className="w-full rounded-xl px-4 py-3 text-sm font-opensans outline-none" style={inputStyle} /></div>
            <button onClick={handleSaveExpense} className="w-full py-3 rounded-xl font-montserrat font-bold text-sm text-white mt-2 transition-all hover:brightness-110" style={{ background: "#2563EB" }}>Registrar Despesa</button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
