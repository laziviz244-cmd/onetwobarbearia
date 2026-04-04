import { motion } from "framer-motion";
import { BottomNav } from "@/components/BottomNav";
import { staggerContainer, staggerItem } from "@/components/motion";

const plans = [
  {
    name: "PLANO BARBA",
    description: "4 Barbas",
    price: "75",
    whatsappMsg: "Olá, gostaria de assinar o PLANO BARBA",
  },
  {
    name: "PLANO CORTES",
    description: "4 Cortes",
    price: "100",
    whatsappMsg: "Olá, gostaria de assinar o PLANO CORTES",
  },
  {
    name: "PLANO LUXO",
    description: "4 Barbas + 2 Cortes",
    price: "130",
    whatsappMsg: "Olá, gostaria de assinar o PLANO LUXO",
  },
  {
    name: "PLANO PRIME",
    description: "4 Barbas + 4 Cortes",
    price: "149",
    whatsappMsg: "Olá, gostaria de assinar o PLANO PRIME",
  },
  {
    name: "PLANO 15NAL",
    description: "2 Cortes + 2 Barbas",
    price: "85",
    whatsappMsg: "Olá, gostaria de assinar o PLANO 15NAL",
  },
];

export default function PlanosPage() {
  const handleWhatsApp = (msg: string) => {
    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/5577981302545?text=${encoded}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-6 pt-12 pb-4">
        <h1 className="font-montserrat font-bold text-2xl text-foreground tracking-tighter">
          Planos de Assinatura
        </h1>
        <p className="text-sm text-dimmed font-opensans mt-1">
          Escolha o plano ideal e aproveite sem limites
        </p>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="px-6 flex flex-col gap-4"
      >
        {plans.map((plan) => (
          <motion.div
            key={plan.name}
            variants={staggerItem}
            className="rounded-2xl p-6 relative overflow-hidden"
            style={{
              background: "#000000",
              border: "1.5px solid #C5A059",
              boxShadow: "0 0 18px hsla(43, 70%, 45%, 0.15), 0 0 40px hsla(43, 70%, 45%, 0.06)",
            }}
          >
            {/* Title */}
            <h2
              className="font-montserrat font-extrabold text-lg tracking-tight uppercase"
              style={{ color: "#FFFFFF" }}
            >
              {plan.name}
            </h2>

            {/* Description */}
            <p
              className="text-sm font-opensans mt-1"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              {plan.description}
            </p>

            {/* Price centered */}
            <div className="flex items-center justify-center my-5">
              <span
                className="font-montserrat font-extrabold text-4xl"
                style={{ color: "#FFFFFF" }}
              >
                R$ {plan.price}
              </span>
            </div>

            {/* WhatsApp button — green filled */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              onClick={() => handleWhatsApp(plan.whatsappMsg)}
              className="w-full py-3.5 rounded-xl font-montserrat font-bold text-sm tracking-tight"
              style={{
                background: "#25D366",
                color: "#FFFFFF",
              }}
            >
              ASSINAR VIA WHATSAPP
            </motion.button>
          </motion.div>
        ))}
      </motion.div>

      {/* Benefits */}
      <div className="px-6 mt-8 text-center">
        <p
          className="font-montserrat font-bold text-sm mb-2"
          style={{ color: "#C5A059" }}
        >
          + BENEFÍCIOS PARA ASSINANTES
        </p>
        <p className="text-sm font-opensans" style={{ color: "#FFFFFF" }}>
          Sobrancelha, Hidratação, Prioridade na Agenda e Brindes.
        </p>
      </div>

      <BottomNav />
    </div>
  );
}
