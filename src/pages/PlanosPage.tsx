import { motion } from "framer-motion";
import { BottomNav } from "@/components/BottomNav";
import { staggerContainer, staggerItem } from "@/components/motion";

const plans = [
  {
    name: "PLANO BARBA",
    description: "4 Barbas",
    price: "75",
    whatsappPlan: "Plano Barba",
  },
  {
    name: "PLANO CORTES",
    description: "4 Cortes",
    price: "100",
    whatsappPlan: "Plano Cortes",
  },
  {
    name: "PLANO LUXO",
    description: "4 Barbas + 2 Cortes",
    price: "130",
    whatsappPlan: "Plano Luxo",
  },
  {
    name: "PLANO PRIME",
    description: "4 Barbas + 4 Cortes",
    price: "169",
    whatsappPlan: "Plano Prime",
  },
  {
    name: "PLANO 15NAL",
    description: "2 Cortes + 2 Barbas",
    price: "85",
    whatsappPlan: "Plano 15nal",
  },
];

export default function PlanosPage() {
  const handleWhatsApp = (planName: string) => {
    const msg = encodeURIComponent(
      `Olá! Quero assinar o ${planName} da OneTwo!`
    );
    window.open(`https://wa.me/5577981302545?text=${msg}`, "_blank");
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
            className="rounded-2xl p-5 relative overflow-hidden"
            style={{
              background: "#000000",
              border: "1.5px solid #C5A059",
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <h2
                className="font-montserrat font-extrabold text-base tracking-tight"
                style={{ color: "#FFFFFF" }}
              >
                {plan.name}
              </h2>
              <span
                className="font-montserrat font-extrabold text-xl"
                style={{ color: "#C5A059" }}
              >
                R$ {plan.price}
              </span>
            </div>

            <p
              className="text-sm font-opensans mb-4"
              style={{ color: "#FFFFFF", opacity: 0.7 }}
            >
              {plan.description}
            </p>

            <motion.button
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              onClick={() => handleWhatsApp(plan.whatsappPlan)}
              className="w-full py-3 rounded-2xl font-montserrat font-bold text-sm tracking-tight"
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

      <div className="px-6 mt-6">
        <p
          className="text-sm font-opensans text-center"
          style={{ color: "#C5A059" }}
        >
          + BENEFÍCIOS: Sobrancelha, Hidratação, Prioridade na Agenda e Brindes.
        </p>
      </div>

      <BottomNav />
    </div>
  );
}
