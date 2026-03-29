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
    <div className="relative flex min-h-screen flex-col bg-black">
      <div className="flex min-h-screen flex-col mx-auto w-full max-w-[500px]">
        {/* Hero Image - contain to show full image, with top breathing room */}
        <div className="relative w-full flex-1 min-h-[55vh] overflow-hidden bg-black pt-5">
          <img
            src={logoVitrine}
            alt="One Two Barbearia"
            className="absolute inset-0 h-full w-full object-contain pt-5"
          />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
        </div>

        {/* Content - below the image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col items-center px-6 pt-6 pb-10 gap-5"
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
    </div>
  );
}
