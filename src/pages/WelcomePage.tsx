import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import logoVitrine from "@/assets/logo-vitrine.jpg";

export default function WelcomePage() {
  const navigate = useNavigate();

  const handleAction = () => {
    const user = localStorage.getItem("onetwo_user");
    if (user) {
      navigate("/cliente", { replace: true });
      return;
    }
    // Try to auto-login last device user
    const lastUser = localStorage.getItem("last_logged_user");
    if (lastUser) {
      // Re-authenticate last user automatically
      const userData = {
        username: lastUser,
        token: btoa(`${lastUser}:${Date.now()}`),
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem("onetwo_user", JSON.stringify(userData));
      navigate("/cliente", { replace: true });
      return;
    }
    navigate("/perfil");
  };

  return (
    <div className="relative h-[100dvh] bg-black overflow-hidden">
      {/* Full-screen hero image */}
      <img
        src={logoVitrine}
        alt="One Two Barbearia"
        className="absolute inset-0 w-full h-full object-cover object-top"
      />

      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" style={{ top: '50%' }} />

      {/* Content pinned to bottom */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="absolute bottom-0 left-0 right-0 flex flex-col items-center px-6 pb-8 gap-3"
      >
        <p className="text-center font-opensans font-light text-sm tracking-wide text-primary">
          Barbeiro Educador &nbsp;|&nbsp; +1000 atendimentos
        </p>

        <motion.button
          whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          onClick={handleAction}
          className="w-full max-w-sm rounded-2xl btn-primary-glow py-4 font-montserrat font-bold text-primary-foreground text-lg tracking-tight"
        >
          Agendar agora
        </motion.button>

        <p className="text-xs text-dimmed font-opensans">
          Já tem conta?{" "}
          <button onClick={() => navigate("/login")} className="text-primary font-semibold">
            Entrar
          </button>
        </p>
      </motion.div>
    </div>
  );
}
