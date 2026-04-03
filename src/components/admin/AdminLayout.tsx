import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { LayoutDashboard, Calendar, DollarSign, BarChart3, LogOut, Menu, Scissors } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import AdminHeadMeta from "@/components/AdminHeadMeta";

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
    <div className="flex flex-col h-full" style={{ background: "#000000" }}>
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(37, 99, 235, 0.15)" }}>
          <Scissors className="h-5 w-5" style={{ color: "#2563EB" }} />
        </div>
        <div>
          <h2 className="font-montserrat font-bold text-sm tracking-tight" style={{ color: "#FFFFFF" }}>Painel Admin</h2>
          <p className="text-xs font-opensans" style={{ color: "#D1D5DB" }}>Barbearia</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => { navigate(item.path); onNavigate?.(); }}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-opensans font-medium transition-all min-h-[44px]"
              style={{
                background: "transparent",
                color: isActive ? "#FFFFFF" : "#D1D5DB",
                fontWeight: isActive ? 600 : 500,
              }}
            >
              <item.icon className="h-5 w-5" style={{ color: "#2563EB" }} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="px-3 py-4">
        <button
          onClick={() => { logout(); navigate("/admin/login"); }}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-opensans font-medium transition-colors min-h-[44px]"
          style={{ color: "#D1D5DB" }}
        >
          <LogOut className="h-5 w-5" style={{ color: "#2563EB" }} />
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
    <div className="min-h-screen flex overflow-x-hidden max-w-[100vw]" style={{ background: "#000000" }}>
      <AdminHeadMeta />
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 z-30" style={{ background: "#000000" }}>
        <NavContent />
      </aside>

      {/* Main content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-[100dvh]">
        {/* Mobile header — menu LEFT, logo RIGHT */}
        <header className="md:hidden flex items-center justify-between px-5 py-5 pt-[env(safe-area-inset-top,20px)] sticky top-0 z-20" style={{ background: "#000000" }}>
          <div className="flex items-center gap-3">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <button className="h-11 w-11 flex items-center justify-center rounded-xl" style={{ background: "#1F2937" }}>
                  <Menu className="h-6 w-6" style={{ color: "#F9FAFB" }} />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0" style={{ background: "#000000", borderColor: "transparent" }}>
                <NavContent onNavigate={() => setOpen(false)} />
              </SheetContent>
            </Sheet>
            <span className="text-sm font-opensans" style={{ color: "#9CA3AF" }}>{user?.name}</span>
          </div>

          <div className="flex items-center gap-3 mr-4">
            <span className="font-montserrat font-bold text-lg" style={{ color: "#F9FAFB" }}>Admin</span>
            <div className="h-11 w-11 rounded-xl flex items-center justify-center" style={{ background: "rgba(37, 99, 235, 0.15)" }}>
              <Scissors className="h-6 w-6" style={{ color: "#2563EB" }} />
            </div>
          </div>
        </header>

        <main className="flex-1 p-5 md:p-8 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
