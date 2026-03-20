import { motion } from "framer-motion";
import { User } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";

export default function Perfil() {
  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <header className="px-6 pt-12 pb-6">
        <motion.h1
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-2xl font-montserrat font-bold"
        >
          Meu Perfil
        </motion.h1>
      </header>

      <main className="px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="surface-card rounded-2xl p-8 flex flex-col items-center gap-4"
        >
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-7 h-7 text-primary" />
          </div>
          <p className="text-center text-subtle font-opensans text-sm leading-relaxed">
            Em breve você poderá gerenciar seu perfil aqui.
          </p>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
}
