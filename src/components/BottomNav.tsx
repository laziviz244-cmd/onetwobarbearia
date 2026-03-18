import { Home, Calendar, User, Search, Plus } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const navItems = [
  { icon: Home, path: "/cliente", label: "Início" },
  { icon: Search, path: "/busca", label: "Buscar" },
  { icon: Plus, path: "/agendar", label: "Agendar", isCenter: true },
  { icon: Calendar, path: "/meus-agendamentos", label: "Agenda" },
  { icon: User, path: "/perfil", label: "Perfil" },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-foreground/10 bg-background/80 backdrop-blur-xl">
      <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          if (item.isCenter) {
            return (
              <motion.button
                key={item.path}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                onClick={() => navigate(item.path)}
                className="relative -mt-5 flex h-14 w-14 items-center justify-center rounded-full btn-primary-glow"
              >
                <Icon className="h-6 w-6 text-primary-foreground" strokeWidth={2.5} />
                <span className="absolute -inset-1 rounded-full border-2 border-primary/30 animate-pulse-blue" />
              </motion.button>
            );
          }

          return (
            <motion.button
              key={item.path}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center gap-1 px-3 py-1"
            >
              <Icon
                className={`h-5 w-5 transition-colors ${isActive ? "text-primary" : "text-subtle"}`}
                strokeWidth={isActive ? 2.5 : 1.5}
              />
              <span className={`text-[10px] font-opensans ${isActive ? "text-foreground" : "text-dimmed"}`}>
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
