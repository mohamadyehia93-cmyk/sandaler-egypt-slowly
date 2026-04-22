import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import {
  ArrowLeft, Share2, MapPin, Users, Calendar, CheckCircle, ShieldCheck,
  Mail, Globe, Heart, Sparkles, Target, ChevronRight, UserPlus, UserCheck,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { causes, regions } from "@/lib/sampleData";
import ProviderStatusView from "@/components/ProviderStatusView";
import DailyStatusCard from "@/components/DailyStatusCard";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

const OrganizationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang, t } = useI18n();
  const { user } = useAuth();
  const [following, setFollowing] = useState(false);

  const handleFollow = () => {
    setFollowing((f) => !f);
    toast({
      title: !following
        ? lang === "ar" ? "تتابع المنظمة الآن" : "Now following"
        : lang === "ar" ? "تم إلغاء المتابعة" : "Unfollowed",
    });
  };

  const cause = causes.find((c) => c.id === id) || causes[0];
  const region = regions.find((r) => r.id === cause.regionId);
  const org = cause.org;

  // Other programs by the same organization (matched by name)
  const otherPrograms = causes.filter(
    (c) => c.org.name.en === org.name.en && c.id !== cause.id
  );
  const allPrograms = [cause, ...otherPrograms];

  const totalRaised = allPrograms.reduce((s, c) => s + c.raised, 0);
  const totalGoal = allPrograms.reduce((s, c) => s + c.goal, 0);
  const totalSupporters = allPrograms.reduce((s, c) => s + c.supporters, 0);
  const fundedPct = totalGoal ? Math.round((totalRaised / totalGoal) * 100) : 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Cover */}
      <div className="relative h-44 bg-gradient-to-br from-primary/30 to-primary/10">
        <img
          src={cause.image}
          alt=""
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 start-4 p-2 rounded-full bg-background/80 backdrop-blur-sm z-10"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <button
          className="absolute top-4 end-4 p-2 rounded-full bg-background/80 backdrop-blur-sm z-10"
          aria-label="Share"
        >
          <Share2 className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Header card */}
      <div className="px-4 -mt-14 relative z-10">
        <div className="bg-card rounded-2xl shadow-elevated p-4">
          <div className="flex items-start gap-3">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl shrink-0">
              {org.logo}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-base font-bold text-foreground truncate">
                  {org.name[lang]}
                </h1>
                <CheckCircle className="w-4 h-4 text-primary shrink-0" />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {cause.category[lang]}
              </p>
              {region && (
                <div className="flex items-center gap-1 mt-1.5 text-[11px] text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span>{t(region.nameKey)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-3">
            <span className="text-[10px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full font-medium">
              ✅ {lang === "ar" ? "موثّقة" : "Verified"}
            </span>
            <span className="text-[10px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full font-medium">
              📋 {lang === "ar" ? "مسجلة رسمياً" : "Registered NGO"}
            </span>
            <span className="text-[10px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full font-medium">
              🛡️ {lang === "ar" ? "شفافية مالية" : "Transparent Finance"}
            </span>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => navigate(`/cause/${cause.id}`)}
              className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-1.5"
            >
              <Heart className="w-4 h-4" />
              {lang === "ar" ? "ادعم" : "Support"}
            </button>
            <button
              onClick={() => navigate("/inbox")}
              className="flex-1 py-2.5 rounded-xl border-2 border-border bg-card text-foreground font-semibold text-sm flex items-center justify-center gap-1.5"
            >
              <Mail className="w-4 h-4" />
              {lang === "ar" ? "تواصل" : "Contact"}
            </button>
            <button
              onClick={handleFollow}
              aria-pressed={following}
              className={`flex-1 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5 border-2 ${
                following
                  ? "bg-primary/10 border-primary text-primary"
                  : "border-border bg-card text-foreground"
              }`}
            >
              {following ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              {following
                ? lang === "ar" ? "متابَع" : "Following"
                : lang === "ar" ? "متابعة" : "Follow"}
            </button>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="px-4 mt-3 grid grid-cols-3 gap-2">
        <div className="bg-card rounded-xl border border-border p-3 text-center">
          <Calendar className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="text-sm font-bold text-foreground">{org.founded}</p>
          <p className="text-[10px] text-muted-foreground">
            {lang === "ar" ? "تأسست" : "Founded"}
          </p>
        </div>
        <div className="bg-card rounded-xl border border-border p-3 text-center">
          <Users className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="text-sm font-bold text-foreground">{org.members}</p>
          <p className="text-[10px] text-muted-foreground">
            {lang === "ar" ? "فريق" : "Team"}
          </p>
        </div>
        <div className="bg-card rounded-xl border border-border p-3 text-center">
          <Heart className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="text-sm font-bold text-foreground">{totalSupporters}</p>
          <p className="text-[10px] text-muted-foreground">
            {lang === "ar" ? "داعم" : "Supporters"}
          </p>
        </div>
      </div>

      {/* Today's Status */}
      <div className="px-4 mt-4">
        {user ? (
          <DailyStatusCard
            sampleId={`org-${cause.id}`}
            accentBg="bg-primary"
            accentText="text-primary"
          />
        ) : (
          <ProviderStatusView sampleId={`org-${cause.id}`} accentText="text-primary" />
        )}
      </div>

      {/* Mission */}
      <div className="px-4 mt-5">
        <h2 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          {lang === "ar" ? "رسالتنا" : "Our Mission"}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {cause.description[lang]}
        </p>
      </div>

      {/* Impact summary */}
      <div className="px-4 mt-5">
        <h2 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          {lang === "ar" ? "أثرنا حتى الآن" : "Our Impact"}
        </h2>
        <div className="bg-surface rounded-xl border border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-base font-bold text-primary-dark">
              {totalRaised.toLocaleString()} {t("common.egp")}
            </span>
            <span className="text-xs text-muted-foreground">
              {lang === "ar" ? "من" : "of"} {totalGoal.toLocaleString()}{" "}
              {t("common.egp")}
            </span>
          </div>
          <div className="w-full bg-border rounded-full h-2 mb-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${Math.min(fundedPct, 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-primary font-semibold">
            {fundedPct}% {lang === "ar" ? "تم تمويله عبر جميع البرامج" : "funded across all programs"}
          </p>
        </div>
      </div>

      {/* Programs */}
      <div className="px-4 mt-5">
        <h2 className="text-sm font-bold text-foreground mb-3">
          {lang === "ar"
            ? `البرامج (${allPrograms.length})`
            : `Programs (${allPrograms.length})`}
        </h2>
        <div className="space-y-2">
          {allPrograms.map((c) => {
            const pct = Math.round((c.raised / c.goal) * 100);
            return (
              <button
                key={c.id}
                onClick={() => navigate(`/cause/${c.id}`)}
                className="w-full flex items-center gap-3 bg-card rounded-xl border border-border p-3 text-start"
              >
                <img
                  src={c.image}
                  alt=""
                  className="w-14 h-14 rounded-lg object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground line-clamp-1">
                    {c.title[lang]}
                  </p>
                  <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                    {c.summary[lang]}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 bg-border rounded-full h-1">
                      <div
                        className="bg-primary h-1 rounded-full"
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-primary font-semibold">
                      {pct}%
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 rtl:rotate-180" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Trust & Transparency */}
      <div className="px-4 mt-5">
        <h2 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          {lang === "ar" ? "الثقة والشفافية" : "Trust & Transparency"}
        </h2>
        <div className="bg-card rounded-xl border border-border divide-y divide-border">
          {[
            { en: "Registered with the Ministry of Social Solidarity", ar: "مسجلة لدى وزارة التضامن الاجتماعي" },
            { en: "Annual financial reports published", ar: "تقارير مالية سنوية منشورة" },
            { en: "Independently audited", ar: "مدقق حساباتها مستقل" },
          ].map((row, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2.5">
              <CheckCircle className="w-4 h-4 text-primary shrink-0" />
              <p className="text-xs text-foreground">{row[lang]}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="px-4 mt-5">
        <h2 className="text-sm font-bold text-foreground mb-2">
          {lang === "ar" ? "تواصل معنا" : "Get in Touch"}
        </h2>
        <div className="bg-card rounded-xl border border-border divide-y divide-border">
          <div className="flex items-center gap-3 px-3 py-3">
            <Mail className="w-4 h-4 text-primary shrink-0" />
            <p className="text-xs text-foreground">
              {org.name.en.toLowerCase().replace(/\s+/g, ".")}@example.org
            </p>
          </div>
          <div className="flex items-center gap-3 px-3 py-3">
            <Globe className="w-4 h-4 text-primary shrink-0" />
            <p className="text-xs text-foreground">www.example.org</p>
          </div>
          {region && (
            <div className="flex items-center gap-3 px-3 py-3">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <p className="text-xs text-foreground">{t(region.nameKey)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizationDetail;
