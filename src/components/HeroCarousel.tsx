import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { heroSlides } from "@/lib/sampleData";
import { useI18n } from "@/lib/i18n";
import { motion, AnimatePresence } from "framer-motion";

const HeroCarousel = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % heroSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const slide = heroSlides[current];

  return (
    <div
      className="relative w-full h-[60vh] min-h-[420px] overflow-hidden mb-8 cursor-pointer"
      onClick={() => navigate(slide.link)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <img
            src={slide.image}
            alt={slide.title[lang]}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-foreground/40" />
          <div className="absolute bottom-12 left-5 right-5">
            <h2 className="text-3xl font-bold text-primary-foreground mb-2 leading-tight drop-shadow-lg">
              {slide.title[lang]}
            </h2>
            <p className="text-base text-primary-foreground/90 drop-shadow">
              {slide.subtitle[lang]}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
            className={`h-1.5 rounded-full transition-all ${
              i === current ? "bg-primary-foreground w-6" : "bg-primary-foreground/50 w-1.5"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
