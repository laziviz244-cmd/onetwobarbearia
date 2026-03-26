/* refreshed */
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { staggerContainer, staggerItem } from "@/components/motion";
import { useState } from "react";
import corteImg from "@/assets/corte.jpg";
import barbaImg from "@/assets/barba.jpg";
import nevouImg from "@/assets/nevou.jpg";
import luzesImg from "@/assets/luzes.jpg";
import corte2Img from "@/assets/corte_2.jpg";
import barba2Img from "@/assets/barba_2.jpg";
import combo4Img from "@/assets/conbo_4.jpg";
import peImg from "@/assets/pe.jpg";

const services = [
  { id: "1", name: "Corte", price: "R$ 30,00", image: corte2Img },
  { id: "2", name: "Barba", price: "R$ 25,00", image: barba2Img },
  { id: "3", name: "Combo Corte + Barba", price: "R$ 50,00", image: combo4Img },
  { id: "4", name: "Nevou", price: "R$ 80,00", image: nevouImg },
  { id: "5", name: "Luzes", price: "R$ 70,00", image: luzesImg },
  { id: "6", name: "Pezinho", price: "R$ 10,00", image: peImg },
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
          <a
            href="https://www.google.com/maps/search/?api=1&query=Rua+Potiragua+406+Camaca+Itapetinga+BA"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-end gap-0.5 no-underline"
            style={{ color: "inherit", textDecoration: "none" }}
          >
            <span className="text-[10px] font-opensans text-foreground">
              Clique e veja nossa localização
            </span>
            <span className="flex items-center gap-1 text-dimmed">
              <MapPin className="h-4 w-4" />
              <span className="text-xs font-opensans">Itapetinga</span>
            </span>
          </a>
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
            className="min-w-[200px] rounded-2xl p-4 flex-shrink-0 cursor-pointer flex flex-col items-center"
            style={{
              background: "hsl(0 0% 4%)",
              border: "1px solid hsl(43 70% 45% / 0.5)",
            }}
            onClick={() => navigate("/planos")}
          >
            <span
              className="text-[10px] font-montserrat font-bold tracking-[0.15em] uppercase mb-3 whitespace-nowrap"
              style={{ color: "hsl(43 80% 55%)" }}
            >
              Assinatura OneTwo
            </span>

            {/* 3D Metallic Emblem */}
            <div className="relative w-32 h-32 mb-1 group">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: "conic-gradient(from 0deg, hsl(45 100% 60%), hsl(40 80% 40%), hsl(48 100% 70%), hsl(42 70% 38%), hsl(45 100% 60%))",
                  padding: "5px",
                }}
              >
                <div
                  className="w-full h-full rounded-full flex flex-col items-center justify-center relative overflow-hidden"
                  style={{
                    background: "radial-gradient(ellipse at 30% 20%, hsl(45 80% 55%), hsl(43 60% 38%) 50%, hsl(40 50% 30%) 100%)",
                    boxShadow: "inset 0 3px 8px hsl(45 100% 70% / 0.4), inset 0 -3px 8px hsl(0 0% 0% / 0.6), 0 6px 24px hsl(0 0% 0% / 0.7)",
                  }}
                >
                  <div
                    className="absolute inset-0 rounded-full opacity-15"
                    style={{
                      background: "repeating-linear-gradient(90deg, transparent, transparent 2px, hsl(45 40% 65% / 0.2) 2px, hsl(45 40% 65% / 0.2) 3px)",
                    }}
                  />
                  <div className="absolute inset-0 rounded-full overflow-hidden">
                    <div
                      className="absolute -inset-full animate-shimmer-gold"
                      style={{
                        background: "linear-gradient(90deg, transparent 20%, hsl(45 100% 80% / 0.5) 45%, hsl(45 100% 95% / 0.7) 50%, hsl(45 100% 80% / 0.5) 55%, transparent 80%)",
                        animationIterationCount: "infinite",
                        animationDuration: "5s",
                      }}
                    />
                  </div>
                  {/* Solid Trophy icon */}
                  <svg
                    className="relative"
                    width="40"
                    height="40"
                    viewBox="0 0 576 512"
                    style={{
                      filter: "drop-shadow(0 3px 6px hsl(0 0% 0% / 0.7))",
                    }}
                  >
                    <defs>
                      <linearGradient id="trophyGold" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#B8860B" />
                        <stop offset="40%" stopColor="#FFD700" />
                        <stop offset="60%" stopColor="#DAA520" />
                        <stop offset="100%" stopColor="#FFD700" />
                      </linearGradient>
                    </defs>
                    <path
                      fill="url(#trophyGold)"
                      d="M400 0H176c-26.5 0-48.1 21.8-47.1 48.2c.2 5.3 .4 10.6 .7 15.8H24C10.7 64 0 74.7 0 88c0 92.6 33.5 157 78.5 200.7c44.3 43.1 98.3 64.8 138.1 75.8c23.4 6.5 39.4 26 39.4 45.6c0 20.9-17 37.9-37.9 37.9H192c-17.7 0-32 14.3-32 32s14.3 32 32 32H384c17.7 0 32-14.3 32-32s-14.3-32-32-32h-26.1c-20.9 0-37.9-17-37.9-37.9c0-19.6 15.9-39.2 39.4-45.6c39.9-11 93.9-32.7 138.2-75.8C542.5 245 576 180.6 576 88c0-13.3-10.7-24-24-24H446.4c.3-5.2 .5-10.4 .7-15.8C448.1 21.8 426.5 0 400 0zM48.9 112h84.4c9.1 90.1 29.2 150.3 51.9 190.6c-24.9-11-53.4-30.5-78.1-54.9C72 213.9 48.9 157.4 48.9 112zM469.1 247.7c-24.7 24.4-53.1 43.8-78 54.9c22.6-40.3 42.8-100.5 51.9-190.6h84.1c0 45.4-23.1 101.9-57.9 135.7z"
                    />
                  </svg>
                </div>
              </div>
              <div
                className="absolute -inset-2 rounded-full pointer-events-none"
                style={{
                  boxShadow: "0 0 30px hsl(45 90% 55% / 0.25), 0 0 60px hsl(45 80% 45% / 0.12)",
                }}
              />
            </div>

            <span
              className="text-[14px] font-montserrat font-bold mt-2"
              style={{
                color: "#F5F5F5",
              }}
            >
              Cortes Ilimitados
            </span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="min-w-[200px] rounded-2xl p-4 flex-shrink-0 cursor-pointer flex flex-col items-center"
            style={{
              background: "hsl(0 0% 4%)",
              border: "1px solid hsl(43 70% 45% / 0.5)",
            }}
            onClick={() => setShowLoyalty(true)}
          >
            <span
              className="text-[10px] font-montserrat font-bold tracking-[0.15em] uppercase mb-3"
              style={{ color: "hsl(43 80% 55%)" }}
            >
              Membro VIP OneTwo
            </span>

            {/* 3D Metallic Emblem */}
            <div className="relative w-32 h-32 mb-1 group">
              {/* Outer polished bevel */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: "conic-gradient(from 0deg, hsl(45 100% 60%), hsl(40 80% 40%), hsl(48 100% 70%), hsl(42 70% 38%), hsl(45 100% 60%))",
                  padding: "5px",
                }}
              >
                {/* Inner brushed metal center */}
                <div
                  className="w-full h-full rounded-full flex flex-col items-center justify-center relative overflow-hidden"
                  style={{
                    background: "radial-gradient(ellipse at 30% 20%, hsl(45 80% 55%), hsl(43 60% 38%) 50%, hsl(40 50% 30%) 100%)",
                    boxShadow: "inset 0 3px 8px hsl(45 100% 70% / 0.4), inset 0 -3px 8px hsl(0 0% 0% / 0.6), 0 6px 24px hsl(0 0% 0% / 0.7)",
                  }}
                >
                  {/* Brushed metal texture */}
                  <div
                    className="absolute inset-0 rounded-full opacity-15"
                    style={{
                      background: "repeating-linear-gradient(90deg, transparent, transparent 2px, hsl(45 40% 65% / 0.2) 2px, hsl(45 40% 65% / 0.2) 3px)",
                    }}
                  />

                  {/* Shimmer sweep */}
                  <div className="absolute inset-0 rounded-full overflow-hidden">
                    <div
                      className="absolute -inset-full animate-shimmer-gold"
                      style={{
                        background: "linear-gradient(90deg, transparent 20%, hsl(45 100% 80% / 0.5) 45%, hsl(45 100% 95% / 0.7) 50%, hsl(45 100% 80% / 0.5) 55%, transparent 80%)",
                        animationIterationCount: "infinite",
                        animationDuration: "5s",
                      }}
                    />
                  </div>

                  {/* Embossed text */}
                  <span
                    className="relative font-montserrat font-extrabold text-[14px] leading-tight text-center"
                    style={{
                      color: "hsl(0 0% 5%)",
                      textShadow: "0 1.5px 1px hsl(45 80% 60% / 0.7), 0 -1px 1px hsl(0 0% 0% / 0.4)",
                    }}
                  >
                    Meu
                  </span>
                  <span
                    className="relative font-montserrat font-extrabold text-[12px] leading-tight text-center"
                    style={{
                      color: "hsl(0 0% 5%)",
                      textShadow: "0 1.5px 1px hsl(45 80% 60% / 0.7), 0 -1px 1px hsl(0 0% 0% / 0.4)",
                    }}
                  >
                    Corte Grátis
                  </span>
                </div>
              </div>

              {/* Outer glow */}
              <div
                className="absolute -inset-2 rounded-full pointer-events-none"
                style={{
                  boxShadow: "0 0 30px hsl(45 90% 55% / 0.25), 0 0 60px hsl(45 80% 45% / 0.12)",
                }}
              />
            </div>
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
              onClick={() => navigate(`/agendar?servico=${encodeURIComponent(service.name)}`)}
              className="flex flex-col rounded-2xl surface-card overflow-hidden text-left"
            >
              <div className="w-full aspect-square bg-muted/30 flex items-center justify-center overflow-hidden">
                {service.image ? (
                  <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-dimmed text-xs font-opensans">Foto</span>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-montserrat font-bold text-foreground text-sm">{service.name}</h3>
                <span className="font-montserrat font-bold text-primary text-xs tabular-nums">
                  {service.price}
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
                const loyaltyCount = parseInt(localStorage.getItem("onetwo_loyalty") || "0", 10);
                const filled = i < Math.min(loyaltyCount, 9);
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

            {/* Rule text */}
            <p className="text-center text-sm font-montserrat mb-2">
              <span className="text-foreground">A cada 9 cortes, o 10º é </span>
              <span className="font-bold" style={{ color: "hsl(43 80% 55%)" }}>por nossa conta!</span>
            </p>

            {/* Progress text */}
            <p className="text-center text-sm font-montserrat text-foreground">
              Faltam apenas <span className="font-bold text-primary">{Math.max(9 - parseInt(localStorage.getItem("onetwo_loyalty") || "0", 10), 0)} cortes</span> para o seu corte grátis!
            </p>

            {/* Progress bar */}
            <div className="mt-4 w-full h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(45 20% 15%)" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((parseInt(localStorage.getItem("onetwo_loyalty") || "0", 10) / 9) * 100, 100)}%` }}
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
              <span style={{ color: "#d4ff00" }}>agende o seu corte agora!</span>
            </button>
          </motion.div>
        </motion.div>
      )}

      <BottomNav />
    </div>
  );
}
