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
          {[
            { title: "Corte + Barba", discount: "20% OFF" },
            { title: "Primeiro corte", discount: "GRÁTIS" },
          ].map((promo, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + i * 0.05 }}
              className="min-w-[200px] rounded-2xl bg-primary/10 border border-primary/20 p-4 flex-shrink-0"
            >
              <span className="text-xs font-montserrat font-bold text-primary">{promo.discount}</span>
              <h3 className="font-montserrat font-bold text-foreground mt-1">{promo.title}</h3>
              <p className="text-xs text-dimmed mt-1 font-opensans">Barbearia OneTwo</p>
            </motion.div>
          ))}
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

      <BottomNav />
    </div>
  );
}
