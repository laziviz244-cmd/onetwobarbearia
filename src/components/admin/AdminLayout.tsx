import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { LayoutDashboard, Calendar, DollarSign, BarChart3, LogOut, Menu, Scissors } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: Calendar, label: "Agenda", path: "/admin/agenda" },
  { icon: DollarSign, label: "Financeiro", path: "/admin/financeiro" },
  { icon: BarChart3, label: "Relatórios", path: "/admin/relatorios" },
];

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAdminAuth();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-6 py-6 border-b border-[hsl(0,0%,100%,0.08)]">
        <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: "hsl(40, 50%, 55%)" }}>
          <Scissors className="h-5 w-5 text-black" />
        </div>
        <div>
          <h2 className="font-montserrat font-bold text-sm text-foreground tracking-tight">Painel Admin</h2>
          <p className="text-xs text-muted-foreground font-opensans">Barbearia</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => { navigate(item.path); onNavigate?.(); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-opensans font-medium transition-all ${
                isActive
                  ? "text-black font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-[hsl(0,0%,100%,0.05)]"
              }`}
              style={isActive ? { background: "hsl(40, 50%, 55%)" } : undefined}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-[hsl(0,0%,100%,0.08)]">
        <button
          onClick={() => { logout(); navigate("/admin/login"); }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-opensans text-muted-foreground hover:text-destructive transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Sair
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { user } = useAdminAuth();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-[hsl(0,0%,100%,0.08)] bg-[hsl(0,0%,3%)] fixed inset-y-0 left-0 z-30">
        <NavContent />
      </aside>

      {/* Main content */}
      <div className="flex-1 md:ml-64">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-[hsl(0,0%,100%,0.08)] bg-[hsl(0,0%,3%)] sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: "hsl(40, 50%, 55%)" }}>
              <Scissors className="h-4 w-4 text-black" />
            </div>
            <span className="font-montserrat font-bold text-sm text-foreground">Admin</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-opensans">{user?.name}</span>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <button className="h-9 w-9 flex items-center justify-center rounded-lg surface-card">
                  <Menu className="h-5 w-5 text-foreground" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 bg-[hsl(0,0%,3%)] border-[hsl(0,0%,100%,0.08)]">
                <NavContent onNavigate={() => setOpen(false)} />
              </SheetContent>
            </Sheet>
          </div>
        </header>

        <main className="p-4 md:p-8 max-w-6xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
