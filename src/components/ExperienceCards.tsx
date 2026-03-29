import { useState } from "react";
import { Heart } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { experiences, experienceThemes, ExperienceTheme } from "@/lib/sampleData";
import SectionHeader from "./SectionHeader";
import { useNavigate } from "react-router-dom";

const ExperienceCards = () => {
  const { lang, t } = useI18n();
  const navigate = useNavigate();
  const [activeTheme, setActiveTheme] = useState<ExperienceTheme | "all">("all");

  const filtered = activeTheme === "all"
    ? experiences
    : experiences.filter((e) => e.theme === activeTheme);

  return (
    <SectionHeader titleKey="section.experiences" onSeeAll={() => {}}>
      {/* Theme filter pills */}
      <div className="flex gap-2 px-4 mb-3 overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setActiveTheme("all")}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTheme === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground"
          }`}
        >
          {lang === "ar" ? "الكل" : "All"}
        </button>
        {experienceThemes.map((th) => (
          <button
            key={th.key}
            onClick={() => setActiveTheme(th.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTheme === th.key
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            {th.emoji} {th.label[lang]}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
        {filtered.map((e) => (
          <button
            key={e.id}
            onClick={() => navigate(`/experience/${e.id}`)}
            className="min-w-[200px] rounded-lg overflow-hidden shadow-card bg-card text-start"
          >
            <div className="relative h-32">
              <img src={e.image} alt={e.title[lang]} className="w-full h-full object-cover" />
              <button className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 backdrop-blur-sm">
                <Heart className="w-4 h-4 text-foreground" />
              </button>
              <span className="absolute bottom-2 left-2 bg-primary/90 text-primary-foreground text-[9px] font-semibold px-1.5 py-0.5 rounded-full">
                {experienceThemes.find((th) => th.key === e.theme)?.label[lang]}
              </span>
            </div>
            <div className="p-3">
              <h3 className="text-sm font-semibold text-foreground line-clamp-2 mb-1">{e.title[lang]}</h3>
              <p className="text-xs text-muted-foreground mb-2">{e.region[lang]} · {e.date}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-primary-dark">
                  {e.price === 0 ? t("common.free") : `${e.price} ${t("common.egp")}`}
                </span>
                <span className="text-xs text-muted-foreground">⭐ {e.rating}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </SectionHeader>
  );
};

export default ExperienceCards;
