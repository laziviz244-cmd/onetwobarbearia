import { motion } from "framer-motion";
import { ReactNode } from "react";

interface MotionTapProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const MotionTap = ({ children, className, onClick }: MotionTapProps) => (
  <motion.div
    whileTap={{ scale: 0.96 }}
    transition={{ type: "spring", stiffness: 400, damping: 25 }}
    className={className}
    onClick={onClick}
  >
    {children}
  </motion.div>
);

export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export const pageTransition = {
  initial: { opacity: 0, x: 10 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -10, transition: { duration: 0.2 } },
};
