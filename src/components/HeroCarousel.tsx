import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { heroSlides } from "@/lib/sampleData";
import { useI18n } from "@/lib/i18n";
import { motion, AnimatePresence } from "framer-motion";

const HeroCarousel = () => {
  const { lang } = useI18n();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % heroSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const slide = heroSlides[current];

  return (
    <div className="relative w-full h-52 overflow-hidden rounded-xl mx-4 mb-6" style={{ width: "calc(100% - 2rem)" }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0"
        >
          <img
            src={slide.image}
            alt={slide.title[lang]}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 gradient-overlay" />
          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-xl font-bold text-primary-foreground mb-1">
              {slide.title[lang]}
            </h2>
            <p className="text-sm text-primary-foreground/80">
              {slide.subtitle[lang]}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === current ? "bg-primary-foreground w-5" : "bg-primary-foreground/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
