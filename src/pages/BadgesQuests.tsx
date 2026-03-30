import { useNavigate } from "react-router-dom";
import { ArrowLeft, Award, Target, Lock, CheckCircle2, Star } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const BadgesQuests = () => {
  const navigate = useNavigate();
  const { lang } = useI18n();

  const badges = [
    { emoji: "🏛️", name: { en: "History Buff", ar: "عاشق التاريخ" }, earned: true, desc: { en: "Visited 3 heritage sites", ar: "زرت 3 مواقع تراثية" } },
    { emoji: "🎧", name: { en: "Audio Explorer", ar: "مستكشف صوتي" }, earned: true, desc: { en: "Completed 2 audio tours", ar: "أكملت جولتين صوتيتين" } },
    { emoji: "🌿", name: { en: "Eco Traveler", ar: "مسافر بيئي" }, earned: true, desc: { en: "Booked 3 eco stays", ar: "حجزت 3 إقامات بيئية" } },
    { emoji: "🍽️", name: { en: "Foodie", ar: "ذواق الطعام" }, earned: false, desc: { en: "Try 5 local food experiences", ar: "جرب 5 تجارب طعام محلية" } },
    { emoji: "🏜️", name: { en: "Desert Fox", ar: "ثعلب الصحراء" }, earned: false, desc: { en: "Complete a desert trip", ar: "أكمل رحلة صحراوية" } },
    { emoji: "🤝", name: { en: "Community Hero", ar: "بطل المجتمع" }, earned: false, desc: { en: "Donate to 5 causes", ar: "تبرع لـ5 قضايا" } },
  ];

  const quests = [
    {
      title: { en: "Nile Valley Explorer", ar: "مستكشف وادي النيل" },
      desc: { en: "Visit Luxor, Aswan, and Qena", ar: "زر الأقصر وأسوان وقنا" },
      progress: 2, total: 3, reward: "🏆",
    },
    {
      title: { en: "Slow Food Journey", ar: "رحلة الطعام البطيء" },
      desc: { en: "Try local cuisine in 4 different regions", ar: "جرب المطبخ المحلي في 4 مناطق مختلفة" },
      progress: 1, total: 4, reward: "🍽️",
    },
    {
      title: { en: "Storyteller", ar: "راوي القصص" },
      desc: { en: "Write 5 reviews about your experiences", ar: "اكتب 5 تقييمات عن تجاربك" },
      progress: 3, total: 5, reward: "✍️",
    },
  ];

  return (
    <div className="min-h-screen bg-surface pb-20">
      <header className="flex items-center gap-3 px-4 py-3 bg-background sticky top-0 z-40 border-b border-border">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-secondary">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground">
          {lang === "ar" ? "الشارات والمهام" : "Badges & Quests"}
        </h1>
      </header>

      <div className="px-4 pt-5">
        {/* Badges Summary */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-card shadow-card border border-border mb-5">
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
            <Award className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">
              {badges.filter((b) => b.earned).length}/{badges.length}
            </p>
            <p className="text-xs text-muted-foreground">
              {lang === "ar" ? "شارات مكتسبة" : "Badges Earned"}
            </p>
          </div>
        </div>

        {/* Badges Grid */}
        <h2 className="text-base font-bold text-foreground mb-3">
          {lang === "ar" ? "الشارات" : "Badges"}
        </h2>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {badges.map((badge, i) => (
            <div
              key={i}
              className={`p-3 rounded-xl text-center border ${
                badge.earned
                  ? "bg-card shadow-card border-border"
                  : "bg-muted/30 border-border/50 opacity-60"
              }`}
            >
              <span className="text-3xl block mb-1">{badge.emoji}</span>
              <p className="text-[11px] font-semibold text-foreground leading-tight">{badge.name[lang]}</p>
              <div className="flex items-center justify-center gap-0.5 mt-1">
                {badge.earned ? (
                  <CheckCircle2 className="w-3 h-3 text-primary" />
                ) : (
                  <Lock className="w-3 h-3 text-muted-foreground" />
                )}
                <span className="text-[9px] text-muted-foreground">
                  {badge.earned
                    ? lang === "ar" ? "مكتسبة" : "Earned"
                    : lang === "ar" ? "مقفلة" : "Locked"}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Active Quests */}
        <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          {lang === "ar" ? "المهام النشطة" : "Active Quests"}
        </h2>
        <div className="space-y-3 mb-6">
          {quests.map((quest, i) => (
            <div key={i} className="p-4 rounded-xl bg-card shadow-card border border-border">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-bold text-foreground">{quest.title[lang]}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{quest.desc[lang]}</p>
                </div>
                <span className="text-2xl">{quest.reward}</span>
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden mt-3">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${(quest.progress / quest.total) * 100}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5">
                {quest.progress}/{quest.total} {lang === "ar" ? "مكتمل" : "completed"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BadgesQuests;
