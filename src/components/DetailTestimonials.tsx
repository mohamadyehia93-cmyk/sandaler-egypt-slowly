import { Star, Quote } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";

const reviews = [
  {
    id: "r1",
    name: { en: "Sarah M.", ar: "سارة م." },
    visitorId: "sarah-m",
    text: { en: "An incredible experience! Our guide was so knowledgeable and passionate. Highly recommend.", ar: "تجربة مذهلة! مرشدنا كان على دراية كبيرة وشغوف. أنصح بها بشدة." },
    rating: 5,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
    date: { en: "2 weeks ago", ar: "منذ أسبوعين" },
  },
  {
    id: "r2",
    name: { en: "Ahmed K.", ar: "أحمد ك." },
    visitorId: "ahmed-k",
    text: { en: "Authentic and unforgettable. The local food was the best part. Will definitely come back!", ar: "أصيلة ولا تُنسى. الطعام المحلي كان أفضل جزء. سأعود بالتأكيد!" },
    rating: 5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    date: { en: "1 month ago", ar: "منذ شهر" },
  },
  {
    id: "r3",
    name: { en: "Maria L.", ar: "ماريا ل." },
    visitorId: "maria-l",
    text: { en: "Well organized and great value for money. The scenery was breathtaking.", ar: "منظمة جيداً وقيمة ممتازة مقابل السعر. المناظر كانت خلابة." },
    rating: 4,
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80",
    date: { en: "3 weeks ago", ar: "منذ ٣ أسابيع" },
  },
];

const DetailTestimonials = () => {
  const { lang, t } = useI18n();
  const navigate = useNavigate();

  return (
    <div className="mb-6">
      <h2 className="text-base font-bold text-primary-dark mb-3">
        {t("section.testimonials")}
      </h2>
      <div className="flex gap-3 overflow-x-auto hide-scrollbar -mx-4 px-4">
        {reviews.map((r) => (
          <div key={r.id} className="min-w-[240px] max-w-[240px] bg-surface rounded-xl p-3 border border-border">
            <Quote className="w-4 h-4 text-primary/40 mb-1.5" />
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mb-2">
              "{r.text[lang]}"
            </p>
            <div className="flex items-center gap-0.5 mb-2">
              {Array.from({ length: r.rating }).map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
              ))}
              {Array.from({ length: 5 - r.rating }).map((_, i) => (
                <Star key={i} className="w-3 h-3 text-muted-foreground/30" />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <img src={r.image} alt={r.name[lang]} className="w-7 h-7 rounded-full object-cover" />
              <div>
                <p className="text-[11px] font-semibold text-foreground">{r.name[lang]}</p>
                <p className="text-[10px] text-muted-foreground">{r.date[lang]}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DetailTestimonials;
