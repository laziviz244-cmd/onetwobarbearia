import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import logoOnetwo from "@/assets/logo-onetwo.png";
import heroBarber from "@/assets/hero-barber.jpg";
import { isPublicAccess } from "@/lib/isPublicAccess";
import MaintenanceModal from "@/components/MaintenanceModal";

export default function WelcomePage() {
  const navigate = useNavigate();
  const [showMaintenance, setShowMaintenance] = useState(false);

  const handleNavigate = (path: string) => {
    if (isPublicAccess()) {
      setShowMaintenance(true);
    } else {
      navigate(path);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      {/* Hero Image */}
      <div className="relative h-[60vh] overflow-hidden">
        <img
          src={heroBarber}
          alt="Barbearia premium"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background" />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative -mt-20 flex flex-1 flex-col items-center px-6 pb-10"
      >
        <img src={logoOnetwo} alt="Onetwo" className="h-12 w-auto mb-6" />

        <div className="flex w-full max-w-sm flex-col gap-3">
          <p className="text-center font-opensans font-light text-sm tracking-wide text-primary">
            Barbeiro Educador &nbsp;|&nbsp; +1000 atendimentos
          </p>
          <motion.button
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={() => handleNavigate("/cliente")}
            className="w-full rounded-2xl btn-primary-glow py-4 font-montserrat font-bold text-primary-foreground text-lg tracking-tight"
          >
            Agendar agora
          </motion.button>
        </div>

        <p className="mt-6 text-xs text-dimmed font-opensans">
          Já tem conta?{" "}
          <button onClick={() => handleNavigate("/cliente")} className="text-primary font-semibold">
            Entrar
          </button>
        </p>
      </motion.div>

      <MaintenanceModal open={showMaintenance} onClose={() => setShowMaintenance(false)} />
    </div>
  );
}