import { Home, Calendar, User, Plus } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const TrophySolidIcon = ({ className, isActive }: { className?: string; isActive?: boolean }) => (
  <svg
    className={className}
    width="20"
    height="20"
    viewBox="0 0 576 512"
  >
    <defs>
      <linearGradient id="navTrophyGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={isActive ? "#D4AF37" : "#8B7355"} />
        <stop offset="50%" stopColor={isActive ? "#B8860B" : "#6B5B3E"} />
        <stop offset="100%" stopColor={isActive ? "#D4AF37" : "#8B7355"} />
      </linearGradient>
    </defs>
    <path
      fill="url(#navTrophyGold)"
      d="M400 0H176c-26.5 0-48.1 21.8-47.1 48.2c.2 5.3 .4 10.6 .7 15.8H24C10.7 64 0 74.7 0 88c0 92.6 33.5 157 78.5 200.7c44.3 43.1 98.3 64.8 138.1 75.8c23.4 6.5 39.4 26 39.4 45.6c0 20.9-17 37.9-37.9 37.9H192c-17.7 0-32 14.3-32 32s14.3 32 32 32H384c17.7 0 32-14.3 32-32s-14.3-32-32-32h-26.1c-20.9 0-37.9-17-37.9-37.9c0-19.6 15.9-39.2 39.4-45.6c39.9-11 93.9-32.7 138.2-75.8C542.5 245 576 180.6 576 88c0-13.3-10.7-24-24-24H446.4c.3-5.2 .5-10.4 .7-15.8C448.1 21.8 426.5 0 400 0zM48.9 112h84.4c9.1 90.1 29.2 150.3 51.9 190.6c-24.9-11-53.4-30.5-78.1-54.9C72 213.9 48.9 157.4 48.9 112zM469.1 247.7c-24.7 24.4-53.1 43.8-78 54.9c22.6-40.3 42.8-100.5 51.9-190.6h84.1c0 45.4-23.1 101.9-57.9 135.7z"
    />
  </svg>
);

const navItems = [
  { icon: Home, path: "/cliente", label: "Início" },
  { id: "planos", path: "/planos", label: "Planos", isTrophy: true },
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

          if (item.isCenter) {
            const Icon = item.icon!;
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

          if (item.isTrophy) {
            return (
              <motion.button
                key={item.path}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center gap-1 px-3 py-1"
              >
                <TrophySolidIcon className="h-5 w-5 transition-colors" isActive={isActive} />
                <span
                  className={`text-[10px] font-opensans font-semibold`}
                  style={{ color: isActive ? "#D4AF37" : undefined }}
                >
                  {!isActive && <span className="text-dimmed">{item.label}</span>}
                  {isActive && item.label}
                </span>
              </motion.button>
            );
          }

          const Icon = item.icon!;
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
