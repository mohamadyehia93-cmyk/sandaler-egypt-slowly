import { useI18n } from "@/lib/i18n";
import SectionHeader from "./SectionHeader";

const partners = [
  { id: "pa1", name: { en: "UNDP Egypt", ar: "برنامج الأمم المتحدة الإنمائي مصر" }, type: { en: "Development Partner", ar: "شريك تنمية" }, logo: "🇺🇳" },
  { id: "pa2", name: { en: "Ministry of Tourism", ar: "وزارة السياحة" }, type: { en: "Government", ar: "حكومي" }, logo: "🏛️" },
  { id: "pa3", name: { en: "EcoTravel Egypt", ar: "إيكو ترافيل مصر" }, type: { en: "Tour Operator", ar: "منظم رحلات" }, logo: "🌿" },
  { id: "pa4", name: { en: "Artisan Collective", ar: "تجمع الحرفيين" }, type: { en: "Community Partner", ar: "شريك مجتمعي" }, logo: "🤝" },
  { id: "pa5", name: { en: "National Geographic Arabia", ar: "ناشيونال جيوغرافيك العربية" }, type: { en: "Media Partner", ar: "شريك إعلامي" }, logo: "📸" },
  { id: "pa6", name: { en: "Cairo University", ar: "جامعة القاهرة" }, type: { en: "Academic Partner", ar: "شريك أكاديمي" }, logo: "🎓" },
];

const Partners = () => {
  const { lang } = useI18n();

  return (
    <SectionHeader titleKey="section.partners" onSeeAll={() => {}}>
      <div className="grid grid-cols-3 gap-3 px-4">
        {partners.map((p) => (
          <div key={p.id} className="bg-card rounded-xl p-3 shadow-card border border-border flex flex-col items-center text-center gap-1.5">
            <span className="text-3xl">{p.logo}</span>
            <h3 className="text-[11px] font-semibold text-foreground leading-tight line-clamp-2">{p.name[lang]}</h3>
            <span className="text-[9px] text-muted-foreground">{p.type[lang]}</span>
          </div>
        ))}
      </div>
    </SectionHeader>
  );
};

export default Partners;
