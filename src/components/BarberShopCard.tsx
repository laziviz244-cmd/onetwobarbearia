import { Star } from "lucide-react";
import { motion } from "framer-motion";

interface BarberShopCardProps {
  name: string;
  address: string;
  rating: number;
  reviewCount: number;
  image: string;
  onClick?: () => void;
}

export function BarberShopCard({ name, address, rating, reviewCount, image, onClick }: BarberShopCardProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onClick={onClick}
      className="flex gap-4 p-4 rounded-2xl surface-card w-full text-left transition-colors hover:surface-card-hover"
    >
      <img
        src={image}
        alt={name}
        className="h-20 w-20 rounded-xl object-cover flex-shrink-0"
      />
      <div className="flex flex-col justify-center gap-1 min-w-0">
        <h3 className="font-montserrat font-bold text-foreground truncate">{name}</h3>
        <p className="text-sm text-dimmed font-opensans truncate">{address}</p>
        <div className="flex items-center gap-1 mt-1">
          <Star className="h-3.5 w-3.5 fill-primary text-primary" />
          <span className="text-sm font-montserrat font-semibold text-foreground tabular-nums">{rating}</span>
          <span className="text-xs text-dimmed">({reviewCount})</span>
        </div>
      </div>
    </motion.button>
  );
}
