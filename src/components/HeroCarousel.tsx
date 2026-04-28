import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useHeroSlides } from "@/hooks/useListings";
import { useI18n } from "@/lib/i18n";
import { motion, AnimatePresence } from "framer-motion";

const HeroCarousel = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const { data: slides = [] } = useHeroSlides();

  // Pick a random image per slide on each mount (page load)
  const randomImages = useMemo(() => {
    return slides.map((s: any) => {
      const pool: string[] = [
        ...(Array.isArray(s.image_alts) ? s.image_alts : []),
        ...(s.image ? [s.image] : []),
      ].filter(Boolean);
      const unique = Array.from(new Set(pool));
      if (!unique.length) return s.image as string;
      return unique[Math.floor(Math.random() * unique.length)];
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides.length]);

  useEffect(() => {
    if (!slides.length) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (!slides.length) {
    return <div className="relative w-full h-[60vh] min-h-[420px] mb-8 bg-muted animate-pulse" />;
  }

  const slide: any = slides[current % slides.length];
  const title = lang === "ar" ? slide.title_ar : slide.title_en;
  const subtitle = lang === "ar" ? slide.subtitle_ar : slide.subtitle_en;
  const image = randomImages[current % slides.length] || slide.image;

  return (
    <div
      className="relative w-full h-[60vh] min-h-[420px] overflow-hidden mb-8 cursor-pointer"
      onClick={() => slide.link && navigate(slide.link)}
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
          <img src={image} alt={title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-foreground/40" />
          <div className="absolute bottom-12 left-5 right-5">
            <h2 className="text-3xl font-bold text-primary-foreground mb-2 leading-tight drop-shadow-lg">
              {title}
            </h2>
            {subtitle && (
              <p className="text-base text-primary-foreground/90 drop-shadow">{subtitle}</p>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              setCurrent(i);
            }}
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
