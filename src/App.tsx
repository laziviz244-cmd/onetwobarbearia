// Versão Final OneTwo - Force Deploy
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AdminAuthProvider, useAdminAuth } from "@/contexts/AdminAuthContext";
import WelcomePage from "./pages/WelcomePage";
import ClientHomePage from "./pages/ClientHomePage";
import LoginPage from "./pages/LoginPage";
import BarberShopDetailPage from "./pages/BarberShopDetailPage";
import BookingPage from "./pages/BookingPage";
import BarberDashboard from "./pages/BarberDashboard";
import MeusAgendamentos from "./pages/MeusAgendamentos";
import Perfil from "./pages/Perfil";
import PlanosPage from "./pages/PlanosPage";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminAgenda from "./pages/admin/AdminAgenda";
import AdminFinanceiro from "./pages/admin/AdminFinanceiro";
import AdminRelatorios from "./pages/admin/AdminRelatorios";

const queryClient = new QueryClient();

function ProtectedAdmin({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAdminAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

// Redirect to admin if barber session exists and user lands on client home
function SmartRedirect() {
  const stored = localStorage.getItem("barber_admin_session");
  if (stored) {
    try {
      const parsed = JSON.parse(atob(stored));
      if (parsed.exp > Date.now()) {
        return <Navigate to="/admin" replace />;
      }
    } catch { /* invalid session, continue to welcome */ }
  }
  return <WelcomePage />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AdminAuthProvider>
          <Routes>
            <Route path="/" element={<SmartRedirect />} />
            <Route path="/vitrine" element={<WelcomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/cliente" element={<ClientHomePage />} />
            <Route path="/barbearia/:id" element={<BarberShopDetailPage />} />
            <Route path="/agendar" element={<BookingPage />} />
            <Route path="/planos" element={<PlanosPage />} />
            <Route path="/dashboard" element={<BarberDashboard />} />
            <Route path="/meus-agendamentos" element={<MeusAgendamentos />} />
            <Route path="/perfil" element={<Perfil />} />

            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<ProtectedAdmin><AdminDashboard /></ProtectedAdmin>} />
            <Route path="/admin/agenda" element={<ProtectedAdmin><AdminAgenda /></ProtectedAdmin>} />
            <Route path="/admin/financeiro" element={<ProtectedAdmin><AdminFinanceiro /></ProtectedAdmin>} />
            <Route path="/admin/relatorios" element={<ProtectedAdmin><AdminRelatorios /></ProtectedAdmin>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AdminAuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
