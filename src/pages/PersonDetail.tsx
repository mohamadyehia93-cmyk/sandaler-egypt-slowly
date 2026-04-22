import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, Globe, Award, Heart, Sparkles, MessageCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { whosWho, regions, experiences } from "@/lib/sampleData";
import BottomNav from "@/components/BottomNav";
import FollowButton from "@/components/FollowButton";

const PersonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang, t } = useI18n();

  const person = whosWho.find((p) => p.id === id);
  if (!person) return <div className="p-8 text-center text-muted-foreground">Person not found</div>;

  const region = regions.find((r) => r.id === person.regionId);
  const relatedExperiences = experiences.filter(
    (e) => e.regionId === person.regionId && e.cityId === person.cityId
  ).slice(0, 3);

  return (
    <div className="min-h-screen bg-surface pb-20">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 bg-background sticky top-0 z-40">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-secondary">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground">{person.name[lang]}</h1>
      </header>

      {/* Profile hero */}
      <div className="relative">
        <div
          className="h-40 w-full"
          style={{ background: `linear-gradient(135deg, ${region?.color || "hsl(var(--primary))"}60, ${region?.color || "hsl(var(--primary))"}20)` }}
        />
        <div className="px-4 -mt-16 relative z-10">
          <img
            src={person.image}
            alt={person.name[lang]}
            className="w-28 h-28 rounded-2xl object-cover border-4 border-background shadow-elevated"
          />
        </div>
      </div>

      {/* Name & role */}
      <div className="px-4 pt-3 pb-2">
        <h2 className="text-xl font-bold text-foreground">{person.name[lang]}</h2>
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary mt-1">
          <Award className="w-4 h-4" /> {person.role[lang]}
        </span>
        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
          <MapPin className="w-3.5 h-3.5" />
          <span>{region?.emoji} {t(region?.nameKey || "")}</span>
          <span>·</span>
          <span>{person.yearsActive}+ {lang === "ar" ? "سنة خبرة" : "years"}</span>
        </div>
      </div>

      {/* Bio */}
      <div className="px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground mb-2">{lang === "ar" ? "نبذة" : "About"}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{person.bio[lang]}</p>
      </div>

      {/* Info cards */}
      <div className="px-4 space-y-3">
        {/* Interests */}
        <div className="bg-card rounded-xl p-4 shadow-card border border-border">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">{lang === "ar" ? "الاهتمامات" : "Interests"}</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {person.interests[lang].map((interest, i) => (
              <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium">
                {interest}
              </span>
            ))}
          </div>
        </div>

        {/* Favorite Places */}
        <div className="bg-card rounded-xl p-4 shadow-card border border-border">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-4 h-4 text-destructive" />
            <h3 className="text-sm font-semibold text-foreground">{lang === "ar" ? "الأماكن المفضلة" : "Favorite Places"}</h3>
          </div>
          <div className="space-y-2">
            {person.favoritePlaces[lang].map((place, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>{place}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Meeting Times */}
        <div className="bg-card rounded-xl p-4 shadow-card border border-border">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">{lang === "ar" ? "أوقات اللقاء" : "Best Times to Meet"}</h3>
          </div>
          <p className="text-sm text-muted-foreground">{person.meetingTimes[lang]}</p>
        </div>

        {/* Languages */}
        <div className="bg-card rounded-xl p-4 shadow-card border border-border">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">{lang === "ar" ? "اللغات" : "Languages"}</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {person.languages[lang].map((language, i) => (
              <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-secondary text-foreground font-medium">
                {language}
              </span>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-card rounded-xl p-4 shadow-card border border-border">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">{lang === "ar" ? "تواصل" : "Contact"}</h3>
          </div>
          <button
            onClick={() => navigate(`/inbox?personId=${person.id}&name=${encodeURIComponent(person.name.en)}&nameAr=${encodeURIComponent(person.name.ar)}&image=${encodeURIComponent(person.image)}`)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            {lang === "ar" ? "أرسل رسالة" : "Send Message"}
          </button>
        </div>
      </div>

      {/* Related Experiences */}
      {relatedExperiences.length > 0 && (
        <div className="px-4 pt-5 pb-2">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            {lang === "ar" ? "تجارب في المنطقة" : "Experiences Nearby"}
          </h3>
          <div className="space-y-3">
            {relatedExperiences.map((e) => (
              <div
                key={e.id}
                onClick={() => navigate(`/experience/${e.id}`)}
                className="flex gap-3 bg-card rounded-xl overflow-hidden shadow-card border border-border cursor-pointer"
              >
                <img src={e.image} alt={e.title[lang]} className="w-24 h-20 object-cover" />
                <div className="py-2 pr-3 flex-1 flex flex-col justify-center">
                  <h4 className="text-xs font-semibold text-foreground line-clamp-2">{e.title[lang]}</h4>
                  <span className="text-xs font-bold text-primary mt-1">
                    {e.price === 0 ? (lang === "ar" ? "مجاني" : "Free") : `${e.price} ${lang === "ar" ? "ج.م" : "EGP"}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default PersonDetail;
