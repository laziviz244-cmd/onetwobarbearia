import { motion } from "framer-motion";
import { Calendar, Users, DollarSign, Clock, ChevronRight, Bell, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { staggerContainer, staggerItem } from "@/components/motion";
import logoOnetwo from "@/assets/logo-onetwo.png";

const todayAppointments = [
  { time: "09:00", client: "Carlos M.", service: "Corte + Barba", status: "concluído" },
  { time: "10:00", client: "João P.", service: "Degradê", status: "atual" },
  { time: "11:00", client: "André S.", service: "Corte Masculino", status: "pendente" },
  { time: "14:00", client: "Felipe R.", service: "Barba", status: "pendente" },
  { time: "15:00", client: "Marcos L.", service: "Corte + Barba", status: "pendente" },
];

const stats = [
  { icon: Calendar, label: "Agendamentos", value: "12", sub: "hoje" },
  { icon: Users, label: "Clientes", value: "8", sub: "novos esta semana" },
  { icon: DollarSign, label: "Faturamento", value: "R$ 1.240", sub: "hoje" },
];

export default function BarberDashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-10">
      {/* Header */}
      <div className="px-6 pt-12 flex items-center justify-between">
        <div>
          <p className="text-sm text-dimmed font-opensans">Olá, Thiago 👋</p>
          <h1 className="font-montserrat font-bold text-2xl text-foreground tracking-tighter">
            Sua agenda tem 5 agendamentos hoje.
          </h1>
        </div>
        <div className="flex gap-2">
          <button className="h-10 w-10 flex items-center justify-center rounded-full surface-card">
            <Bell className="h-5 w-5 text-foreground" />
          </button>
          <button className="h-10 w-10 flex items-center justify-center rounded-full surface-card">
            <Settings className="h-5 w-5 text-foreground" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="px-6 mt-6 grid grid-cols-3 gap-3"
      >
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={staggerItem}
            className="rounded-2xl surface-card p-4 flex flex-col gap-1"
          >
            <stat.icon className="h-5 w-5 text-primary mb-1" />
            <span className="font-montserrat font-bold text-xl text-foreground tabular-nums">
              {stat.value}
            </span>
            <span className="text-[10px] text-dimmed font-opensans leading-tight">{stat.sub}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Today's agenda */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="px-6 mt-8"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-montserrat font-bold text-lg text-foreground tracking-tighter">
            Agenda do dia
          </h2>
          <button className="text-xs text-primary font-opensans font-semibold flex items-center gap-0.5">
            Ver tudo <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        <div className="relative flex flex-col gap-2">
          {/* Current time indicator */}
          <div className="absolute left-[52px] top-[88px] right-0 h-[1px] bg-primary z-10">
            <div className="absolute -left-1.5 -top-1 h-2.5 w-2.5 rounded-full bg-primary" />
          </div>

          {todayAppointments.map((apt, i) => (
            <motion.div
              key={i}
              variants={staggerItem}
              className={`flex items-center gap-4 rounded-2xl p-4 transition-colors ${
                apt.status === "atual"
                  ? "surface-card surface-card-hover glow-primary"
                  : "surface-card"
              } ${apt.status === "concluído" ? "opacity-50" : ""}`}
            >
              <span className="text-sm font-opensans font-semibold tabular-nums text-dimmed w-12 flex-shrink-0">
                {apt.time}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-opensans font-semibold text-foreground text-sm truncate">
                  {apt.client}
                </p>
                <p className="text-xs text-dimmed font-opensans">{apt.service}</p>
              </div>
              <div className="flex items-center gap-2">
                {apt.status === "atual" && (
                  <span className="text-[10px] font-montserrat font-bold text-primary px-2 py-1 rounded-full bg-primary/10">
                    AGORA
                  </span>
                )}
                {apt.status === "concluído" && (
                  <span className="text-[10px] font-opensans text-dimmed">Concluído</span>
                )}
                <ChevronRight className="h-4 w-4 text-dimmed" />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick action */}
      <div className="px-6 mt-8">
        <motion.button
          whileTap={{ scale: 0.96 }}
          className="w-full rounded-2xl surface-card py-4 font-montserrat font-semibold text-foreground flex items-center justify-center gap-2"
        >
          <Clock className="h-5 w-5 text-primary" />
          Adicionar agendamento manual
        </motion.button>
      </div>

      {/* Back to client view */}
      <div className="px-6 mt-4">
        <button
          onClick={() => navigate("/")}
          className="text-xs text-dimmed font-opensans w-full text-center py-2"
        >
          ← Voltar ao início
        </button>
      </div>
    </div>
  );
}
