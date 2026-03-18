import { motion } from "framer-motion";

interface ServiceCardProps {
  title: string;
  duration: number;
  price: number;
  selected?: boolean;
  onSelect?: () => void;
}

export function ServiceCard({ title, duration, price, selected, onSelect }: ServiceCardProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onClick={onSelect}
      className={`group relative flex w-full items-center justify-between p-5 rounded-2xl surface-card transition-colors duration-300 text-left ${
        selected ? "surface-card-hover glow-primary" : ""
      }`}
    >
      <div className="flex flex-col gap-1">
        <h3 className="font-montserrat font-bold text-lg text-foreground">{title}</h3>
        <span className="font-opensans text-sm text-dimmed">{duration} min</span>
      </div>
      <div className="flex flex-col items-end gap-2">
        <span className="font-montserrat font-bold text-primary tabular-nums">
          R$ {price.toFixed(2)}
        </span>
        <div
          className={`h-2 w-2 rounded-full bg-primary transition-opacity ${
            selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        />
      </div>
    </motion.button>
  );
}
