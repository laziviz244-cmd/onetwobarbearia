import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import corteImg from "@/assets/corte.jpg";
import barbaImg from "@/assets/barba.jpg";
import nevouImg from "@/assets/nevou.jpg";
import luzesImg from "@/assets/luzes.jpg";

const galleryImages = [
  { id: 1, src: corteImg, alt: "Corte degradê OneTwo" },
  { id: 2, src: barbaImg, alt: "Barba estilizada OneTwo" },
  { id: 3, src: "/placeholder.svg", alt: "Ambiente premium OneTwo" },
  { id: 4, src: nevouImg, alt: "Platinado OneTwo" },
  { id: 5, src: luzesImg, alt: "Luzes OneTwo" },
];

export function PhotoGallery() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const handleDragEnd = (_: any, info: { offset: { x: number }; velocity: { x: number } }) => {
    const swipe = info.offset.x;
    if (swipe < -50) {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % galleryImages.length);
    } else if (swipe > 50) {
      setDirection(-1);
      setCurrent((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
    }
  };

  return (
    <div className="w-full">
      <h2 className="font-montserrat font-bold text-lg text-foreground tracking-tighter mb-4 px-6">
        Galeria
      </h2>

      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16/10" }}>
        <div
          className="absolute inset-0 rounded-2xl mx-6"
          style={{ border: "1.5px solid #C5A059" }}
        >
          <AnimatePresence initial={false} custom={direction}>
            <motion.img
              key={current}
              src={galleryImages[current].src}
              alt={galleryImages[current].alt}
              className="absolute inset-0 w-full h-full object-cover rounded-2xl"
              loading="lazy"
              custom={direction}
              initial={{ x: direction > 0 ? "100%" : "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction > 0 ? "-100%" : "100%", opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
            />
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation dots */}
      <div className="flex justify-center gap-2 mt-4">
        {galleryImages.map((_, i) => (
          <button
            key={i}
            onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
            className="w-2 h-2 rounded-full transition-all duration-300"
            style={{
              background: i === current ? "#C5A059" : "rgba(255, 255, 255, 0.5)",
              transform: i === current ? "scale(1.3)" : "scale(1)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
