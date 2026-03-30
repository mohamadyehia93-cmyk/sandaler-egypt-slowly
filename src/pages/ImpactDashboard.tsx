import { useNavigate } from "react-router-dom";
import { ArrowLeft, Leaf, Users, Heart, TrendingUp, Droplets, TreePine, Footprints } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const ImpactDashboard = () => {
  const navigate = useNavigate();
  const { lang } = useI18n();

  const impactStats = [
    {
      icon: Leaf,
      value: "12.4 kg",
      label: { en: "CO₂ Saved", ar: "CO₂ تم توفيره" },
      desc: { en: "vs conventional tourism", ar: "مقارنة بالسياحة التقليدية" },
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      icon: Users,
      value: "8",
      label: { en: "Communities Supported", ar: "مجتمعات مدعومة" },
      desc: { en: "Through your bookings", ar: "من خلال حجوزاتك" },
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      icon: Heart,
      value: "450",
      label: { en: "EGP to Local Causes", ar: "ج.م للقضايا المحلية" },
      desc: { en: "Direct community impact", ar: "تأثير مباشر على المجتمع" },
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
    {
      icon: Footprints,
      value: "38 km",
      label: { en: "Walked Locally", ar: "مشي محلي" },
      desc: { en: "Slow travel distance", ar: "مسافة السفر البطيء" },
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  const monthlyBreakdown = [
    { month: { en: "Jan", ar: "يناير" }, co2: 2.1, community: 120 },
    { month: { en: "Feb", ar: "فبراير" }, co2: 3.4, community: 80 },
    { month: { en: "Mar", ar: "مارس" }, co2: 1.8, community: 100 },
    { month: { en: "Apr", ar: "أبريل" }, co2: 5.1, community: 150 },
  ];

  const causes = [
    { name: { en: "Siwa Clean Water Project", ar: "مشروع مياه نظيفة بسيوة" }, amount: "200 EGP", icon: Droplets },
    { name: { en: "Fayoum Reforestation", ar: "تشجير الفيوم" }, amount: "150 EGP", icon: TreePine },
    { name: { en: "Nubian Heritage Fund", ar: "صندوق التراث النوبي" }, amount: "100 EGP", icon: Heart },
  ];

  const maxCo2 = Math.max(...monthlyBreakdown.map((m) => m.co2));

  return (
    <div className="min-h-screen bg-surface pb-20">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 bg-background sticky top-0 z-40 border-b border-border">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-secondary">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground">
          {lang === "ar" ? "لوحة التأثير" : "Impact Dashboard"}
        </h1>
      </header>

      <div className="px-4 pt-5">
        {/* Hero Banner */}
        <div className="rounded-xl bg-gradient-to-br from-primary to-primary-dark p-5 mb-6 text-primary-foreground">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm font-semibold">
              {lang === "ar" ? "تأثيرك كمسافر" : "Your Travel Impact"}
            </span>
          </div>
          <p className="text-2xl font-bold mb-1">
            {lang === "ar" ? "أنت تصنع فرقاً" : "You're Making a Difference"}
          </p>
          <p className="text-xs opacity-80">
            {lang === "ar"
              ? "كل رحلة مع صندل تدعم المجتمعات المحلية وتحافظ على البيئة"
              : "Every trip with Sandal supports local communities and protects the environment"}
          </p>
        </div>

        {/* Impact Stats Grid */}
        <h2 className="text-base font-bold text-foreground mb-3">
          {lang === "ar" ? "ملخص التأثير" : "Impact Summary"}
        </h2>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {impactStats.map((stat, i) => (
            <div key={i} className="p-4 rounded-xl bg-card shadow-card border border-border">
              <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs font-medium text-foreground mt-0.5">{stat.label[lang]}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{stat.desc[lang]}</p>
            </div>
          ))}
        </div>

        {/* Monthly CO₂ Chart */}
        <h2 className="text-base font-bold text-foreground mb-3">
          {lang === "ar" ? "CO₂ الموفر شهرياً" : "Monthly CO₂ Saved"}
        </h2>
        <div className="bg-card rounded-xl shadow-card border border-border p-4 mb-6">
          <div className="flex items-end gap-3 h-32">
            {monthlyBreakdown.map((m, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-medium text-foreground">{m.co2}kg</span>
                <div
                  className="w-full rounded-t-md bg-primary/80"
                  style={{ height: `${(m.co2 / maxCo2) * 100}%` }}
                />
                <span className="text-[10px] text-muted-foreground">{m.month[lang]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Causes Supported */}
        <h2 className="text-base font-bold text-foreground mb-3">
          {lang === "ar" ? "القضايا التي دعمتها" : "Causes You've Supported"}
        </h2>
        <div className="space-y-2 mb-6">
          {causes.map((cause, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-card shadow-card border border-border">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <cause.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{cause.name[lang]}</p>
                <p className="text-xs text-muted-foreground">
                  {lang === "ar" ? "مساهمتك" : "Your contribution"}
                </p>
              </div>
              <span className="text-sm font-bold text-primary">{cause.amount}</span>
            </div>
          ))}
        </div>

        {/* Sustainability Tier */}
        <div className="rounded-xl bg-card shadow-card border border-border p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-foreground">
              {lang === "ar" ? "مستوى الاستدامة" : "Sustainability Tier"}
            </h2>
            <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
              {lang === "ar" ? "🌿 مستكشف أخضر" : "🌿 Green Explorer"}
            </span>
          </div>
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: "62%" }} />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[10px] text-muted-foreground">62%</span>
            <span className="text-[10px] text-muted-foreground">
              {lang === "ar" ? "المستوى التالي: حارس الأرض" : "Next: Earth Guardian"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImpactDashboard;
