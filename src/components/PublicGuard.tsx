import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { isPublicAccess } from "@/lib/isPublicAccess";
import MaintenanceModal from "./MaintenanceModal";

const BLOCKED_ROUTES = ["/agendar", "/perfil", "/meus-agendamentos", "/dashboard", "/cliente"];

export default function PublicGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMaintenance, setShowMaintenance] = useState(false);

  useEffect(() => {
    if (!isPublicAccess()) return;
    if (BLOCKED_ROUTES.some((r) => location.pathname.startsWith(r))) {
      setShowMaintenance(true);
      navigate("/", { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <>
      {children}
      <MaintenanceModal open={showMaintenance} onClose={() => setShowMaintenance(false)} />
    </>
  );
}
