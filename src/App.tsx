// Versão Final OneTwo - Force Deploy
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import WelcomePage from "./pages/WelcomePage";
import ClientHomePage from "./pages/ClientHomePage";
import BarberShopDetailPage from "./pages/BarberShopDetailPage";
import BookingPage from "./pages/BookingPage";
import BarberDashboard from "./pages/BarberDashboard";
import MeusAgendamentos from "./pages/MeusAgendamentos";
import Perfil from "./pages/Perfil";
import PlanosPage from "./pages/PlanosPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/cliente" element={<ClientHomePage />} />
          <Route path="/barbearia/:id" element={<BarberShopDetailPage />} />
          <Route path="/agendar" element={<BookingPage />} />
          <Route path="/planos" element={<PlanosPage />} />
          <Route path="/dashboard" element={<BarberDashboard />} />
          <Route path="/meus-agendamentos" element={<MeusAgendamentos />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
