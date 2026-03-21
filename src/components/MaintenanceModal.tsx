import { motion, AnimatePresence } from "framer-motion";
import { Construction } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function MaintenanceModal({ open, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md px-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl surface-card border border-primary/20 p-8 text-center"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Construction className="h-7 w-7 text-primary" />
            </div>
            <h2 className="font-montserrat font-bold text-lg text-foreground mb-2">
              Área de Agendamento
            </h2>
            <p className="font-opensans text-sm text-subtle leading-relaxed">
              Em manutenção para atualizações personalizadas.
              <br />
              Aguarde a liberação do desenvolvedor.
            </p>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={onClose}
              className="mt-6 w-full rounded-2xl btn-primary-glow py-3 font-montserrat font-bold text-primary-foreground"
            >
              Entendi
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
