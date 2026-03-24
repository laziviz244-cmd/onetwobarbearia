import { motion } from "framer-motion";
import { Wrench } from "lucide-react";

export default function MaintenanceOverlay() {
  // Skip overlay inside Lovable editor (preview URLs)
  const isEditor =
    typeof window !== "undefined" &&
    (window.location.hostname.includes("preview") ||
      window.location.hostname === "localhost");

  if (isEditor) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background px-6"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
        className="flex h-24 w-24 items-center justify-center rounded-full bg-primary mb-6"
      >
        <Wrench className="h-10 w-10 text-primary-foreground" />
      </motion.div>

      <h1 className="font-montserrat font-bold text-2xl text-foreground tracking-tighter text-center">
        Estamos preparando algo incrível!
      </h1>
      <p className="text-muted-foreground font-opensans mt-3 text-center max-w-xs">
        O agendamento online está passando por atualizações personalizadas para você. Volte em breve!
      </p>
    </motion.div>
  );
}
