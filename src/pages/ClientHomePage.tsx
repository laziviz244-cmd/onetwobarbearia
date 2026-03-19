import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { staggerContainer, staggerItem } from "@/components/motion";
import { useState } from "react";

const services = [
  { id: "1", name: "Degradê", price: 45 },
  { id: "2", name: "Moicano", price: 40 },
  { id: "3", name: "Barba", price: 35 },
  { id: "4", name: "Social", price: 30 },
];

export default function ClientHomePage() {
  const navigate = useNavigate();
  const [showLoyalty, setShowLoyalty] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-6 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-dimmed font-opensans">Olá 👋</p>
            <h1 className="font-montserrat font-bold text-2xl text-foreground tracking-tighter">
              Bem-vindo à Barbearia OneTwo
            </h1>
          </div>
          <div className="flex items-center gap-1 text-dimmed">
            <MapPin className="h-4 w-4" />
            <span className="text-xs font-opensans">Itapetinga</span>
          </div>
        </div>
      </div>

      {/* Promos */}
      <div className="px-6 mt-2">
        <h2 className="font-montserrat font-bold text-lg text-foreground tracking-tighter mb-3">
          Promoções
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="min-w-[200px] rounded-2xl bg-primary/10 border border-primary/20 p-4 flex-shrink-0 cursor-pointer"
            onClick={() => navigate("/agendar")}
          >
            <span className="text-xs font-montserrat font-bold text-primary">20% OFF</span>
            <h3 className="font-montserrat font-bold text-foreground mt-1">Corte + Barba</h3>
            <p className="text-xs text-dimmed mt-1 font-opensans">Barbearia OneTwo</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="min-w-[200px] rounded-2xl bg-primary/10 border border-primary/20 p-4 flex-shrink-0 cursor-pointer"
            onClick={() => setShowLoyalty(true)}
          >
            <span className="text-xs font-montserrat font-bold text-primary">FIDELIDADE</span>
            <h3 className="font-montserrat font-bold text-foreground mt-1">Fidelidade OneTwo</h3>
            <p className="text-xs text-dimmed mt-1 font-opensans">A cada 9 cortes, o 10º é por nossa conta!</p>
          </motion.div>
        </div>
      </div>

      {/* Nossos Serviços */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="px-6 mt-8"
      >
        <h2 className="font-montserrat font-bold text-lg text-foreground tracking-tighter mb-4">
          Nossos Serviços
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {services.map((service) => (
            <motion.button
              key={service.id}
              variants={staggerItem}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              onClick={() => navigate("/agendar")}
              className="flex flex-col rounded-2xl surface-card overflow-hidden text-left"
            >
              <div className="w-full aspect-square bg-muted/30 flex items-center justify-center">
                <span className="text-dimmed text-xs font-opensans">Foto</span>
              </div>
              <div className="p-3">
                <h3 className="font-montserrat font-bold text-foreground">{service.name}</h3>
                <span className="font-montserrat font-bold text-primary text-sm tabular-nums">
                  R$ {service.price.toFixed(2)}
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Loyalty Modal */}
      {showLoyalty && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => { setShowLoyalty(false); navigate("/agendar"); }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="w-full max-w-sm rounded-2xl p-6 relative overflow-hidden"
            style={{
              background: "linear-gradient(160deg, hsl(0 0% 10%), hsl(0 0% 5%))",
              border: "1px solid hsl(45 60% 40% / 0.3)",
              boxShadow: "0 0 40px hsl(45 60% 30% / 0.08), inset 0 1px 0 hsl(45 60% 50% / 0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative corner accents */}
            <div className="absolute top-0 left-0 w-12 h-12 border-t border-l rounded-tl-2xl" style={{ borderColor: "hsl(45 60% 50% / 0.3)" }} />
            <div className="absolute top-0 right-0 w-12 h-12 border-t border-r rounded-tr-2xl" style={{ borderColor: "hsl(45 60% 50% / 0.3)" }} />
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b border-l rounded-bl-2xl" style={{ borderColor: "hsl(45 60% 50% / 0.3)" }} />
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b border-r rounded-br-2xl" style={{ borderColor: "hsl(45 60% 50% / 0.3)" }} />

            <h2 className="font-montserrat font-bold text-xl text-foreground text-center mb-0.5 tracking-tight">
              Meu Cartão Fidelidade
            </h2>
            <p className="text-[11px] text-center font-montserrat tracking-[0.2em] uppercase mb-6" style={{ color: "hsl(45 50% 60%)" }}>
              Barbearia OneTwo
            </p>

            {/* Scissors Grid */}
            <div className="grid grid-cols-5 gap-3 mb-6">
              {Array.from({ length: 10 }).map((_, i) => {
                const filled = i < 4;
                return (
                  <div
                    key={i}
                    className="aspect-square rounded-full flex items-center justify-center relative"
                    style={{
                      background: filled
                        ? "linear-gradient(145deg, hsl(43 70% 58%), hsl(38 80% 42%), hsl(43 70% 55%))"
                        : "transparent",
                      border: filled
                        ? "1.5px solid hsl(43 60% 60%)"
                        : "1.5px solid hsl(45 40% 35% / 0.5)",
                      boxShadow: filled
                        ? "0 0 12px hsl(43 70% 50% / 0.3), inset 0 1px 2px hsl(43 80% 70% / 0.3)"
                        : "none",
                    }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={filled ? "hsl(0 0% 8%)" : "hsl(45 30% 40% / 0.5)"}
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="6" cy="6" r="3" />
                      <path d="M8.12 8.12 12 12" />
                      <path d="M20 4 8.12 15.88" />
                      <circle cx="6" cy="18" r="3" />
                      <path d="M14.8 14.8 20 20" />
                      <path d="M8.12 8.12 12 12" />
                    </svg>
                  </div>
                );
              })}
            </div>

            {/* Progress text */}
            <p className="text-center text-sm font-montserrat text-foreground">
              Faltam apenas <span className="font-bold text-primary">5 cortes</span> para o seu corte grátis!
            </p>

            {/* Progress bar */}
            <div className="mt-4 w-full h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(45 20% 15%)" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "40%" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, hsl(43 70% 45%), hsl(43 80% 58%))" }}
              />
            </div>

            <button
              onClick={() => { setShowLoyalty(false); navigate("/agendar"); }}
              className="mt-6 w-full py-3 rounded-2xl bg-primary text-primary-foreground font-montserrat font-bold text-sm tracking-tight"
            >
              Não perca tempo e{" "}
              <span style={{ color: "#d4ff00" }}>agende já o seu corte!</span>
            </button>
          </motion.div>
        </motion.div>
      )}

      <BottomNav />
    </div>
  );
}
