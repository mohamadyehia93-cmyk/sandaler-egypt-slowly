import { Star, Quote } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import SectionHeader from "./SectionHeader";

const testimonials = [
  {
    id: "t1",
    name: { en: "Sarah M.", ar: "سارة م." },
    visitorId: "sarah-m",
    location: { en: "London, UK", ar: "لندن، المملكة المتحدة" },
    text: { en: "Sandal showed me an Egypt I never knew existed. The bird watching tour on Lake Manzala was absolutely magical!", ar: "صندل أرتني مصر لم أكن أعرف بوجودها. جولة مراقبة الطيور على بحيرة المنزلة كانت ساحرة!" },
    rating: 5,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
    experience: { en: "Bird Watching in Manzala", ar: "مراقبة الطيور في المنزلة" },
  },
  {
    id: "t2",
    name: { en: "Ahmed K.", ar: "أحمد ك." },
    visitorId: "ahmed-k",
    location: { en: "Dubai, UAE", ar: "دبي، الإمارات" },
    text: { en: "Cooking with Grandma Fatma in Rosetta was the highlight of my trip. Authentic, warm, unforgettable.", ar: "الطبخ مع جدة فاطمة في رشيد كان أجمل لحظات رحلتي. أصيل ودافئ ولا يُنسى." },
    rating: 5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    experience: { en: "Cooking with Grandma", ar: "الطبخ مع جدتي" },
  },
  {
    id: "t3",
    name: { en: "Maria L.", ar: "ماريا ل." },
    visitorId: "maria-l",
    location: { en: "Rome, Italy", ar: "روما، إيطاليا" },
    text: { en: "The sandboarding in Siwa was thrilling! Omar is the best guide — so knowledgeable about the desert.", ar: "التزلج على الرمال في سيوة كان مثيراً! عمر أفضل مرشد — يعرف الصحراء جيداً." },
    rating: 5,
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80",
    experience: { en: "Desert Sandboarding", ar: "التزلج على الرمال" },
  },
];

const Testimonials = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();

  return (
    <SectionHeader titleKey="section.testimonials">
      <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
        {testimonials.map((t) => (
          <div key={t.id} className="min-w-[280px] max-w-[280px] bg-card rounded-xl p-4 shadow-card border border-border">
            <Quote className="w-5 h-5 text-primary/40 mb-2" />
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-3">"{t.text[lang]}"</p>
            <div className="flex items-center gap-1 mb-3">
              {Array.from({ length: t.rating }).map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/visitor/${t.visitorId}`)}>
              <img src={t.image} alt={t.name[lang]} className="w-9 h-9 rounded-full object-cover" />
              <div>
                <p className="text-xs font-semibold text-foreground hover:text-primary transition-colors">{t.name[lang]}</p>
                <p className="text-[10px] text-muted-foreground">{t.location[lang]}</p>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-border">
              <span className="text-[10px] text-primary font-medium">{t.experience[lang]}</span>
            </div>
          </div>
        ))}
      </div>
    </SectionHeader>
  );
};

export default Testimonials;
