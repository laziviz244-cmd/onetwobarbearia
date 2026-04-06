import { ReactNode, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { LayoutDashboard, Calendar, DollarSign, BarChart3, LogOut, Menu, Scissors, Settings, Sun, Moon } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import AdminHeadMeta from "@/components/AdminHeadMeta";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: Calendar, label: "Agenda", path: "/admin/agenda" },
  { icon: DollarSign, label: "Financeiro", path: "/admin/financeiro" },
  { icon: BarChart3, label: "Relatórios", path: "/admin/relatorios" },
  { icon: Settings, label: "Configurações", path: "/admin/configuracoes" },
];

function useAdminTheme() {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("admin_theme") as "dark" | "light") || "dark";
    }
    return "dark";
  });

  useEffect(() => {
    localStorage.setItem("admin_theme", theme);
  }, [theme]);

  const toggle = () => setTheme(t => t === "dark" ? "light" : "dark");
  return { theme, toggle };
}

const themeColors = {
  dark: { bg: "#000000", card: "#111111", text: "#FFFFFF", subtext: "#D1D5DB", muted: "#9CA3AF", border: "#1F2937", navActive: "rgba(37, 99, 235, 0.1)" },
  light: { bg: "#F8FAFC", card: "#FFFFFF", text: "#0F172A", subtext: "#475569", muted: "#64748B", border: "#E2E8F0", navActive: "rgba(37, 99, 235, 0.1)" },
};

function NavContent({ onNavigate, theme, toggleTheme }: { onNavigate?: () => void; theme: "dark" | "light"; toggleTheme: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAdminAuth();

  const c = themeColors[theme];

  return (
    <div className="flex flex-col min-h-[100dvh]" style={{ background: c.bg }}>
      <div className="flex items-center gap-5 px-6 py-8">
        <div className="h-16 w-16 rounded-2xl flex items-center justify-center" style={{ background: "rgba(37, 99, 235, 0.15)" }}>
          <Scissors className="h-8 w-8" style={{ color: "#2563EB" }} />
        </div>
        <div>
          <h2 className="font-montserrat font-bold text-xl tracking-tight" style={{ color: c.text }}>Painel Admin</h2>
          <p className="text-base font-opensans" style={{ color: c.subtext }}>Barbearia</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => { navigate(item.path); onNavigate?.(); }}
              className="w-full flex items-center gap-5 px-5 py-5 rounded-2xl font-opensans font-medium transition-all min-h-[60px]"
              style={{
                background: isActive ? c.navActive : "transparent",
                color: isActive ? c.text : c.subtext,
                fontWeight: isActive ? 600 : 500,
                fontSize: "18px",
              }}
            >
              <item.icon className="h-7 w-7" style={{ color: "#2563EB" }} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="px-3 py-2">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-5 px-5 py-4 rounded-2xl font-opensans font-medium transition-colors min-h-[52px]"
          style={{ color: c.subtext, fontSize: "16px" }}
        >
          {theme === "dark" ? <Sun className="h-6 w-6" style={{ color: "#F59E0B" }} /> : <Moon className="h-6 w-6" style={{ color: "#6366F1" }} />}
          {theme === "dark" ? "Modo Claro" : "Modo Escuro"}
        </button>
      </div>

      <div className="px-3 py-6 mt-auto border-t" style={{ borderColor: c.border }}>
        <button
          onClick={() => { logout(); navigate("/admin/login"); }}
          className="w-full flex items-center gap-5 px-5 py-5 rounded-2xl font-opensans font-medium transition-colors min-h-[60px]"
          style={{ color: c.subtext, fontSize: "18px" }}
        >
          <LogOut className="h-7 w-7" style={{ color: "#EF4444" }} />
          Sair
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { user } = useAdminAuth();
  const { theme, toggle: toggleTheme } = useAdminTheme();
  const c = themeColors[theme];

  return (
    <div className="min-h-[100dvh] flex overflow-x-hidden max-w-[100vw]" style={{ background: c.bg }}>
      <AdminHeadMeta />
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 z-30" style={{ background: c.bg }}>
        <NavContent theme={theme} toggleTheme={toggleTheme} />
      </aside>

      {/* Main content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-[100dvh]">
        {/* Mobile header */}
        <header
          className="md:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-20"
          style={{ background: c.bg, paddingTop: "max(env(safe-area-inset-top), 16px)" }}
        >
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button className="h-10 w-10 flex items-center justify-center rounded-xl" style={{ background: c.card }}>
                <Menu className="h-5 w-5" style={{ color: c.text }} />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0" style={{ background: c.bg, borderColor: "transparent" }}>
              <NavContent onNavigate={() => setOpen(false)} theme={theme} toggleTheme={toggleTheme} />
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2 pr-6">
            <span className="font-montserrat font-semibold text-sm tracking-wide" style={{ color: c.text }}>Admin</span>
            <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(37, 99, 235, 0.15)" }}>
              <Scissors className="h-4 w-4 rotate-180" style={{ color: "#2563EB" }} />
            </div>
          </div>
        </header>

        <main className="flex-1 px-3 py-4 md:p-8 pb-40 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
