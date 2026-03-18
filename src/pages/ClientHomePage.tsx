import { motion } from "framer-motion";
import { Search, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BarberShopCard } from "@/components/BarberShopCard";
import { BottomNav } from "@/components/BottomNav";
import { staggerContainer, staggerItem } from "@/components/motion";
import heroBarber from "@/assets/hero-barber.jpg";

const mockShops = [
  { id: "1", name: "Onetwo Barbershop", address: "Rua Augusta, 1200 - SP", rating: 4.9, reviewCount: 234 },
  { id: "2", name: "Barbearia Clássica", address: "Av. Paulista, 900 - SP", rating: 4.7, reviewCount: 189 },
  { id: "3", name: "Studio Premium Barber", address: "Rua Oscar Freire, 450 - SP", rating: 4.8, reviewCount: 312 },
];

const promos = [
  { title: "Corte + Barba", discount: "20% OFF", shop: "Onetwo Barbershop" },
  { title: "Primeiro corte", discount: "GRÁTIS", shop: "Studio Premium" },
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
              Encontre seu barbeiro
            </h1>
          </div>
          <div className="flex items-center gap-1 text-dimmed">
            <MapPin className="h-4 w-4" />
            <span className="text-xs font-opensans">São Paulo</span>
          </div>
        </div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-5 flex items-center gap-3 rounded-2xl surface-card px-4 py-3.5"
        >
          <Search className="h-5 w-5 text-dimmed" />
          <input
            type="text"
            placeholder="Buscar barbearia ou serviço..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-dimmed font-opensans outline-none"
          />
        </motion.div>
      </div>

      {/* Promos */}
      <div className="px-6 mt-6">
        <h2 className="font-montserrat font-bold text-lg text-foreground tracking-tighter mb-3">
          Promoções
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
          {promos.map((promo, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + i * 0.05 }}
              className="min-w-[200px] rounded-2xl bg-primary/10 border border-primary/20 p-4 flex-shrink-0"
            >
              <span className="text-xs font-montserrat font-bold text-primary">{promo.discount}</span>
              <h3 className="font-montserrat font-bold text-foreground mt-1">{promo.title}</h3>
              <p className="text-xs text-dimmed mt-1 font-opensans">{promo.shop}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Nearby shops */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="px-6 mt-8"
      >
        <h2 className="font-montserrat font-bold text-lg text-foreground tracking-tighter mb-3">
          Perto de você
        </h2>
        <div className="flex flex-col gap-3">
          {mockShops.map((shop) => (
            <motion.div key={shop.id} variants={staggerItem}>
              <BarberShopCard
                {...shop}
                image={heroBarber}
                onClick={() => navigate(`/barbearia/${shop.id}`)}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

      <BottomNav />
    </div>
  );
}
