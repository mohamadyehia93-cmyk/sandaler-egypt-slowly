import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Globe, MapPin, Users, Target, Handshake, Mail, ExternalLink, Calendar, Award } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { partnersData } from "@/lib/sampleData";
import NotFoundView from "@/components/NotFound";

const PartnerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useI18n();

  const partner = partnersData.find((p) => p.id === id);
  if (!partner) return <NotFoundView context="partner" />;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero */}
      <div className="relative h-44">
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, ${partner.color}90, ${partner.color}30)` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 p-2 rounded-full bg-background/80 backdrop-blur-sm z-10"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Logo & Name */}
      <div className="px-4 -mt-16 relative z-10">
        <div className="w-20 h-20 rounded-2xl bg-card border-4 border-background shadow-elevated flex items-center justify-center text-4xl">
          {partner.logo}
        </div>
        <div className="mt-3">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary mb-2">
            <Handshake className="w-3 h-3" />
            {partner.type[lang]}
          </span>
          <h1 className="text-xl font-bold text-foreground">{partner.name[lang]}</h1>
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" />
            <span>{partner.location[lang]}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 mt-5 grid grid-cols-3 gap-3">
        <div className="bg-card rounded-xl p-3 border border-border text-center">
          <Calendar className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">{partner.since}</p>
          <p className="text-[10px] text-muted-foreground">{lang === "ar" ? "شريك منذ" : "Partner since"}</p>
        </div>
        <div className="bg-card rounded-xl p-3 border border-border text-center">
          <Users className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">{partner.impactNumber}</p>
          <p className="text-[10px] text-muted-foreground">{partner.impactLabel[lang]}</p>
        </div>
        <div className="bg-card rounded-xl p-3 border border-border text-center">
          <Award className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">{partner.projects}</p>
          <p className="text-[10px] text-muted-foreground">{lang === "ar" ? "مشروع" : "Projects"}</p>
        </div>
      </div>

      {/* About */}
      <div className="px-4 mt-5">
        <h2 className="text-sm font-semibold text-foreground mb-2">
          {lang === "ar" ? "نبذة" : "About"}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{partner.about[lang]}</p>
      </div>

      {/* Mission */}
      <div className="px-4 mt-5">
        <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
          <Target className="w-5 h-5 text-primary mb-2" />
          <h3 className="text-sm font-semibold text-foreground mb-1">
            {lang === "ar" ? "المهمة" : "Mission"}
          </h3>
          <p className="text-sm italic text-muted-foreground leading-relaxed">"{partner.mission[lang]}"</p>
        </div>
      </div>

      {/* Focus Areas */}
      <div className="px-4 mt-5">
        <h2 className="text-sm font-semibold text-foreground mb-3">
          {lang === "ar" ? "مجالات التركيز" : "Focus Areas"}
        </h2>
        <div className="flex flex-wrap gap-2">
          {partner.focusAreas[lang].map((area, i) => (
            <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-secondary text-foreground font-medium">
              {area}
            </span>
          ))}
        </div>
      </div>

      {/* Key Contributions */}
      <div className="px-4 mt-5">
        <h2 className="text-sm font-semibold text-foreground mb-3">
          {lang === "ar" ? "المساهمات الرئيسية" : "Key Contributions"}
        </h2>
        <div className="space-y-2">
          {partner.contributions[lang].map((item, i) => (
            <div key={i} className="flex items-start gap-2.5 bg-card rounded-lg p-3 border border-border">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">{i + 1}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="px-4 mt-5 space-y-3">
        <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm">
          <Globe className="w-4 h-4" />
          {lang === "ar" ? "زيارة الموقع" : "Visit Website"}
        </button>
        <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-card border border-border shadow-card text-sm font-semibold text-foreground">
          <Mail className="w-4 h-4 text-primary" />
          {lang === "ar" ? "تواصل معنا" : "Contact Partner"}
        </button>
      </div>
    </div>
  );
};

export default PartnerDetail;
