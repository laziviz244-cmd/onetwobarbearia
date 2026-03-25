import { motion } from "framer-motion";
import { BottomNav } from "@/components/BottomNav";
import { staggerContainer, staggerItem } from "@/components/motion";

const plans = [
  {
    name: "SÓCIO CABELO VIP",
    description: "Mantenha a régua perfeita o mês todo",
    benefits: [
      "Cortes de Cabelo ILIMITADOS",
      "Pezinho sempre limpo",
      "Café cortesia",
    ],
    price: "R$ 00,00",
    whatsappPlan: "Sócio Cabelo VIP",
  },
  {
    name: "SÓCIO COMPLETO PREMIUM",
    description: "O pacote definitivo para o cavalheiro moderno",
    benefits: [
      "Cabelo ILIMITADO",
      "Barba ILIMITADA",
      "Acabamento com navalha",
      "Café cortesia",
    ],
    price: "R$ 00,00",
    whatsappPlan: "Sócio Completo Premium",
  },
];

export default function PlanosPage() {
  const handleWhatsApp = (planName: string) => {
    const msg = encodeURIComponent(
      `Olá! Quero entrar para o Clube de Sócios ${planName} da OneTwo!`
    );
    window.open(`https://wa.me/5577999999999?text=${msg}`, "_blank");
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
        className="px-6 flex flex-col gap-5"
      >
        {plans.map((plan) => (
          <motion.div
            key={plan.name}
            variants={staggerItem}
            className="rounded-2xl p-6 relative overflow-hidden"
            style={{
              background: "hsl(0 0% 4%)",
              border: "1.5px solid #D4AF37",
              boxShadow: "0 0 20px hsl(45 60% 30% / 0.1)",
            }}
          >
            <h2
              className="font-montserrat font-extrabold text-lg tracking-tight"
              style={{ color: "#D4AF37" }}
            >
              {plan.name}
            </h2>
            <p className="text-sm text-dimmed font-opensans mt-1 mb-4">
              {plan.description}
            </p>

            <ul className="space-y-2 mb-5">
              {plan.benefits.map((b) => (
                <li key={b} className="flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: "#D4AF37" }}
                  />
                  <span className="text-sm font-opensans text-foreground">
                    {b}
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex items-baseline gap-1 mb-5">
              <span
                className="font-montserrat font-extrabold text-2xl"
                style={{ color: "#D4AF37" }}
              >
                {plan.price}
              </span>
              <span className="text-sm text-dimmed font-opensans">/mês</span>
            </div>

            <motion.button
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              onClick={() => handleWhatsApp(plan.whatsappPlan)}
              className="w-full py-3.5 rounded-2xl font-montserrat font-bold text-sm tracking-tight"
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

      <BottomNav />
    </div>
  );
}
