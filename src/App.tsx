// Versão Final OneTwo - Force Deploy
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AdminAuthProvider, useAdminAuth } from "@/contexts/AdminAuthContext";
import { applyRoutePwaIdentity } from "@/lib/pwa-route-identity";
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
const ADMIN_SESSION_KEY = "barber_admin_session";

function getStoredAdminSession() {
  if (typeof window === "undefined") return null;

  const stored = window.localStorage.getItem(ADMIN_SESSION_KEY);
  if (!stored) return null;

  try {
    const parsed = JSON.parse(window.atob(stored));
    if (parsed.exp > Date.now()) {
      return parsed;
    }
  } catch {
    // ignore invalid session payloads
  }

  window.localStorage.removeItem(ADMIN_SESSION_KEY);
  return null;
}

function ProtectedAdmin({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAdminAuth();
  const hasStoredSession = Boolean(getStoredAdminSession());

  if (isLoading) return null;
  if (!user && !hasStoredSession) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

function RedirectLoggedAdmin({ children }: { children: React.ReactNode }) {
  const { user } = useAdminAuth();

  if (user || getStoredAdminSession()) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}

function AdminLoginEntry() {
  const { user, isLoading } = useAdminAuth();
  const hasStoredSession = Boolean(getStoredAdminSession());

  if (isLoading && hasStoredSession) return null;
  if (user || hasStoredSession) return <Navigate to="/admin" replace />;

  return <AdminLogin />;
}

function SmartRedirect() {
  // If client has a saved session, skip vitrine/login → go straight to /cliente
  const hasClientSession = Boolean(
    localStorage.getItem("onetwo_user") || localStorage.getItem("last_logged_user")
  );
  if (hasClientSession) {
    return <Navigate to="/cliente" replace />;
  }

  return (
    <RedirectLoggedAdmin>
      <WelcomePage />
    </RedirectLoggedAdmin>
  );
}

function RoutePwaIdentitySync() {
  const location = useLocation();

  useEffect(() => {
    applyRoutePwaIdentity(location.pathname);
  }, [location.pathname]);

  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AdminAuthProvider>
          <RoutePwaIdentitySync />
          <Routes>
            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLoginEntry />} />
            <Route path="/admin" element={<ProtectedAdmin><AdminDashboard /></ProtectedAdmin>} />
            <Route path="/admin/agenda" element={<ProtectedAdmin><AdminAgenda /></ProtectedAdmin>} />
            <Route path="/admin/financeiro" element={<ProtectedAdmin><AdminFinanceiro /></ProtectedAdmin>} />
            <Route path="/admin/relatorios" element={<ProtectedAdmin><AdminRelatorios /></ProtectedAdmin>} />

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

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AdminAuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
