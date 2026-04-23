// Versão Final OneTwo - Force Deploy
import { useEffect, useLayoutEffect, lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AdminAuthProvider, useAdminAuth } from "@/contexts/AdminAuthContext";
import { isAdminLikePath, normalizePathname, resolveAdminPath } from "@/lib/emergency-route-recovery";
import { applyRoutePwaIdentity } from "@/lib/pwa-route-identity";
import WelcomePage from "./pages/WelcomePage";
import ClientHomePage from "./pages/ClientHomePage";
import LoginPage from "./pages/LoginPage";
import BookingPage from "./pages/BookingPage";
import MeusAgendamentos from "./pages/MeusAgendamentos";

// Lazy-loaded pages (reduces initial bundle)
const BarberShopDetailPage = lazy(() => import("./pages/BarberShopDetailPage"));
const BarberDashboard = lazy(() => import("./pages/BarberDashboard"));
const Perfil = lazy(() => import("./pages/Perfil"));
const PlanosPage = lazy(() => import("./pages/PlanosPage"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminAgenda = lazy(() => import("./pages/admin/AdminAgenda"));
const AdminFinanceiro = lazy(() => import("./pages/admin/AdminFinanceiro"));
const AdminRelatorios = lazy(() => import("./pages/admin/AdminRelatorios"));
const AdminConfiguracoes = lazy(() => import("./pages/admin/AdminConfiguracoes"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      gcTime: Infinity,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
  },
});
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
  const location = useLocation();

  if (isLoading) return null;
  if (!user && !hasStoredSession) return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
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
  const hasClientSession = Boolean(
    localStorage.getItem("onetwo_user") || localStorage.getItem("last_logged_user")
  );
  if (hasClientSession) {
    return <Navigate to="/cliente" replace />;
  }

  return <WelcomePage />;
}

function RoutePwaIdentitySync() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    applyRoutePwaIdentity(resolveAdminPath(location.pathname));
  }, [location.pathname]);

  useLayoutEffect(() => {
    const normalizedPath = resolveAdminPath(location.pathname);

    if (location.pathname !== normalizedPath) {
      navigate(normalizedPath + location.search + location.hash, { replace: true });
    }
  }, [location.pathname, location.search, location.hash, navigate]);

  return null;
}

function RouteFallback() {
  const location = useLocation();
  const { user, isLoading } = useAdminAuth();
  const hasStoredSession = Boolean(getStoredAdminSession());
  const normalizedPath = resolveAdminPath(location.pathname);

  if (location.pathname !== normalizedPath) {
    return <Navigate to={normalizedPath + location.search + location.hash} replace />;
  }

  if (isAdminLikePath(normalizedPath)) {
    if (isLoading) return null;

    return user || hasStoredSession
      ? <Navigate to="/admin" replace />
      : <Navigate to="/admin/login" state={{ from: normalizedPath }} replace />;
  }

  return <Navigate to="/" replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AdminAuthProvider>
          <RoutePwaIdentitySync />
          <ClientOnlyIOSGuide />
          <Suspense fallback={<div className="min-h-screen bg-background" aria-hidden />}>
            <Routes>
              {/* Admin routes */}
              <Route path="/admin/login" element={<AdminLoginEntry />} />
              <Route path="/admin" element={<ProtectedAdmin><AdminDashboard /></ProtectedAdmin>} />
              <Route path="/admin/agenda" element={<ProtectedAdmin><AdminAgenda /></ProtectedAdmin>} />
              <Route path="/admin/financeiro" element={<ProtectedAdmin><AdminFinanceiro /></ProtectedAdmin>} />
              <Route path="/admin/relatorios" element={<ProtectedAdmin><AdminRelatorios /></ProtectedAdmin>} />
              <Route path="/admin/configuracoes" element={<ProtectedAdmin><AdminConfiguracoes /></ProtectedAdmin>} />
              <Route path="/agenda" element={<Navigate to="/admin/agenda" replace />} />
              <Route path="/financeiro" element={<Navigate to="/admin/financeiro" replace />} />
              <Route path="/relatorios" element={<Navigate to="/admin/relatorios" replace />} />

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

              <Route path="*" element={<RouteFallback />} />
            </Routes>
          </Suspense>
        </AdminAuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
