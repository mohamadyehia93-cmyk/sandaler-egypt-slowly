import { ArrowLeft, Heart, Share2, Users, Calendar, MapPin, ExternalLink, Gift, HandHeart, UserCheck, MessageCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { causes, regions } from "@/lib/sampleData";
import ProviderBioCard from "@/components/ProviderBioCard";
import DetailTestimonials from "@/components/DetailTestimonials";

const supportOptions = [
  { key: "gift", icon: Gift, label: { en: "Send a Gift", ar: "أرسل هدية" }, desc: { en: "Support through gift packages for the community", ar: "ادعم من خلال هدايا للمجتمع" }, color: "bg-amber-500/10 text-amber-600", path: "gift" },
  { key: "donate", icon: HandHeart, label: { en: "Donate", ar: "تبرّع" }, desc: { en: "Direct financial contribution to the cause", ar: "مساهمة مالية مباشرة للقضية" }, color: "bg-emerald-500/10 text-emerald-600", path: "donate" },
  { key: "volunteer", icon: UserCheck, label: { en: "Volunteer", ar: "تطوّع" }, desc: { en: "Give your time and skills on the ground", ar: "قدّم وقتك ومهاراتك على أرض الواقع" }, color: "bg-blue-500/10 text-blue-600", path: "volunteer" },
  { key: "consult", icon: MessageCircle, label: { en: "Consult", ar: "استشارة" }, desc: { en: "Offer professional expertise and guidance", ar: "قدّم خبرتك المهنية وإرشاداتك" }, color: "bg-purple-500/10 text-purple-600", path: "consult" },
];

const CauseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang, t } = useI18n();

  const cause = causes.find((c) => c.id === id) || causes[0];
  const region = regions.find((r) => r.id === cause.regionId);
  const progress = Math.round((cause.raised / cause.goal) * 100);

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Hero */}
      <div className="relative">
        <img src={cause.image} alt={cause.title[lang]} className="w-full h-64 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 p-2 rounded-full bg-background/80 backdrop-blur-sm">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="absolute top-4 right-4 flex gap-2">
          <button className="p-2 rounded-full bg-background/80 backdrop-blur-sm">
            <Share2 className="w-5 h-5 text-foreground" />
          </button>
          <button className="p-2 rounded-full bg-background/80 backdrop-blur-sm">
            <Heart className="w-5 h-5 text-foreground" />
          </button>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <span className="bg-primary/90 text-primary-foreground px-2.5 py-0.5 rounded-full text-xs font-medium mb-2 inline-block">
            {cause.category[lang]}
          </span>
          <h1 className="text-xl font-bold text-white">{cause.title[lang]}</h1>
        </div>
      </div>

      <div className="px-4 pt-4">
        {/* Meta */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-primary" /> {region ? t(region.nameKey) : ""}</span>
          <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {cause.supporters} {lang === "ar" ? "داعم" : "supporters"}</span>
        </div>

        {/* Progress */}
        <div className="bg-surface rounded-xl p-4 mb-6 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-bold text-primary-dark">{cause.raised.toLocaleString()} {t("common.egp")}</span>
            <span className="text-sm text-muted-foreground">{lang === "ar" ? "من" : "of"} {cause.goal.toLocaleString()} {t("common.egp")}</span>
          </div>
          <div className="w-full bg-border rounded-full h-2.5 mb-2">
            <div className="bg-primary h-2.5 rounded-full transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="text-primary font-semibold">{progress}% {lang === "ar" ? "مكتمل" : "funded"}</span>
            <span>{cause.supporters} {lang === "ar" ? "داعم" : "supporters"}</span>
          </div>
        </div>

        {/* About */}
        <h2 className="text-base font-bold text-primary-dark mb-3">{lang === "ar" ? "عن القضية" : "About This Cause"}</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{cause.description[lang]}</p>

        {/* Organization */}
        <h2 className="text-base font-bold text-primary-dark mb-3">{lang === "ar" ? "المنظمة" : "The Organization"}</h2>
        <div className="bg-surface rounded-xl p-4 mb-6 border border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center text-2xl">{cause.org.logo}</div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{cause.org.name[lang]}</p>
              <p className="text-xs text-muted-foreground">
                {lang === "ar" ? `تأسست ${cause.org.founded}` : `Founded ${cause.org.founded}`} · {cause.org.members} {lang === "ar" ? "عضو" : "members"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="text-[10px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full font-medium">✅ {lang === "ar" ? "موثّقة" : "Verified"}</span>
            <span className="text-[10px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full font-medium">📋 {lang === "ar" ? "مسجلة رسمياً" : "Registered NGO"}</span>
          </div>
        </div>

        {/* How to Support */}
        <h2 className="text-base font-bold text-primary-dark mb-3">{lang === "ar" ? "كيف تدعم" : "How to Support"}</h2>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {supportOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => navigate(`/cause/${id}/${opt.path}`)}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border shadow-card hover:border-primary transition-colors"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${opt.color}`}>
                <opt.icon className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold text-foreground">{opt.label[lang]}</span>
              <span className="text-[10px] text-muted-foreground text-center leading-tight">{opt.desc[lang]}</span>
            </button>
          ))}
        </div>

        {/* Impact */}
        <h2 className="text-base font-bold text-primary-dark mb-3">{lang === "ar" ? "الأثر" : "Impact So Far"}</h2>
        <div className="grid grid-cols-3 gap-2 mb-6">
          {[
            { value: cause.supporters, label: { en: "Supporters", ar: "داعم" } },
            { value: `${progress}%`, label: { en: "Funded", ar: "ممول" } },
            { value: cause.org.members, label: { en: "Team", ar: "فريق" } },
          ].map((stat, i) => (
            <div key={i} className="bg-surface rounded-lg p-3 text-center border border-border">
              <p className="text-lg font-bold text-primary-dark">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label[lang]}</p>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <DetailTestimonials />
      </div>

      {/* Sticky Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3 flex items-center justify-between z-50">
        <div>
          <span className="text-lg font-bold text-primary-dark">{progress}%</span>
          <span className="text-xs text-muted-foreground block">{lang === "ar" ? "مكتمل" : "funded"}</span>
        </div>
        <button className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-elevated">
          {lang === "ar" ? "ادعم الآن" : "Support Now"}
        </button>
      </div>
    </div>
  );
};

export default CauseDetail;
