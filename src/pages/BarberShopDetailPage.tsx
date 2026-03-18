import { motion } from "framer-motion";
import { ArrowLeft, Star, MapPin, Clock, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ServiceCard } from "@/components/ServiceCard";
import { staggerContainer, staggerItem } from "@/components/motion";
import heroBarber from "@/assets/hero-barber.jpg";
import { useState } from "react";

const services = [
  { id: "1", title: "Corte Masculino", duration: 30, price: 45 },
  { id: "2", title: "Barba", duration: 20, price: 30 },
  { id: "3", title: "Corte + Barba", duration: 45, price: 65 },
  { id: "4", title: "Degradê", duration: 40, price: 55 },
  { id: "5", title: "Hidratação", duration: 25, price: 35 },
  { id: "6", title: "Pigmentação", duration: 60, price: 80 },
];

const barbers = [
  { id: "1", name: "Thiago", specialty: "Degradê specialist" },
  { id: "2", name: "Lucas", specialty: "Barba artística" },
  { id: "3", name: "Rafael", specialty: "Corte clássico" },
];

export default function BarberShopDetailPage() {
  const navigate = useNavigate();
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const toggleService = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const total = services
    .filter((s) => selectedServices.includes(s.id))
    .reduce((acc, s) => acc + s.price, 0);

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Hero */}
      <div className="relative h-56">
        <img src={heroBarber} alt="Barbearia" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 to-background" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-12 left-4 flex h-10 w-10 items-center justify-center rounded-full surface-card backdrop-blur-md"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
      </div>

      {/* Info */}
      <div className="px-6 -mt-8 relative">
        <h1 className="font-montserrat font-bold text-2xl text-foreground tracking-tighter">
          Onetwo Barbershop
        </h1>
        <div className="flex items-center gap-4 mt-2 text-sm text-dimmed font-opensans">
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-primary text-primary" /> 4.9
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> Rua Augusta, 1200
          </span>
        </div>
        <div className="flex items-center gap-4 mt-2 text-sm text-dimmed font-opensans">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> 09:00 - 20:00
          </span>
          <span className="flex items-center gap-1">
            <Phone className="h-3.5 w-3.5" /> (11) 99999-0000
          </span>
        </div>
      </div>

      {/* Barbers */}
      <div className="px-6 mt-8">
        <h2 className="font-montserrat font-bold text-lg text-foreground tracking-tighter mb-3">
          Profissionais
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {barbers.map((b) => (
            <div
              key={b.id}
              className="flex flex-col items-center gap-2 min-w-[80px]"
            >
              <div className="h-16 w-16 rounded-full surface-card flex items-center justify-center font-montserrat font-bold text-primary text-lg">
                {b.name[0]}
              </div>
              <span className="text-xs text-foreground font-opensans font-semibold">{b.name}</span>
              <span className="text-[10px] text-dimmed font-opensans">{b.specialty}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Services */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="px-6 mt-8"
      >
        <h2 className="font-montserrat font-bold text-lg text-foreground tracking-tighter mb-3">
          Serviços
        </h2>
        <div className="flex flex-col gap-3">
          {services.map((service) => (
            <motion.div key={service.id} variants={staggerItem}>
              <ServiceCard
                {...service}
                selected={selectedServices.includes(service.id)}
                onSelect={() => toggleService(service.id)}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Floating CTA */}
      {selectedServices.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent"
        >
          <motion.button
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={() => navigate("/agendar")}
            className="w-full rounded-2xl btn-primary-glow py-4 font-montserrat font-bold text-primary-foreground text-lg tracking-tight flex items-center justify-center gap-2"
          >
            Agendar · R$ {total.toFixed(2)}
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
