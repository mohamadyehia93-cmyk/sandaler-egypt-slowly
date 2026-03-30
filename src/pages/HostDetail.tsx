import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Star, Home, Heart, MessageCircle, Share2, UserPlus, UserCheck, Shield, Calendar, Globe } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { hosts, accommodation, regions } from "@/lib/sampleData";

const HostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useI18n();
  const [following, setFollowing] = useState(false);

  const host = hosts.find((h) => h.id === id);
  if (!host) return <div className="p-8 text-center text-muted-foreground">Host not found</div>;

  const region = regions.find((r) => r.id === host.regionId);
  const hostListings = accommodation.filter((a) => a.hostId === host.id);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero gradient */}
      <div className="relative h-52">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${region?.color || "hsl(var(--primary))"}90, ${region?.color || "hsl(var(--primary))"}30)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 p-2 rounded-full bg-background/80 backdrop-blur-sm z-10"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <button className="absolute top-4 right-4 p-2 rounded-full bg-background/80 backdrop-blur-sm z-10">
          <Share2 className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Avatar & Name */}
      <div className="px-4 -mt-20 relative z-10">
        <img
          src={host.image}
          alt={host.name[lang]}
          className="w-28 h-28 rounded-2xl object-cover border-4 border-background shadow-elevated"
        />
        <div className="mt-3">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary mb-2">
            <Home className="w-3 h-3" />
            {lang === "ar" ? "مضيف" : "Host"}
          </span>
          <h1 className="text-xl font-bold text-foreground">{host.name[lang]}</h1>
          {region && (
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              <span>{region.emoji} {host.location[lang]}</span>
            </div>
          )}
        </div>

        {/* Follow Button */}
        <button
          onClick={() => setFollowing(!following)}
          className={`mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            following
              ? "bg-secondary text-foreground border border-border"
              : "bg-primary text-primary-foreground"
          }`}
        >
          {following ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          {following ? (lang === "ar" ? "متابَع" : "Following") : (lang === "ar" ? "متابعة" : "Follow")}
        </button>
      </div>

      {/* Stats */}
      <div className="px-4 mt-5 grid grid-cols-3 gap-3">
        <div className="bg-card rounded-xl p-3 border border-border text-center">
          <Star className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">{host.rating}</p>
          <p className="text-[10px] text-muted-foreground">{lang === "ar" ? "التقييم" : "Rating"}</p>
        </div>
        <div className="bg-card rounded-xl p-3 border border-border text-center">
          <Shield className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">{host.totalReviews}</p>
          <p className="text-[10px] text-muted-foreground">{lang === "ar" ? "تقييمات" : "Reviews"}</p>
        </div>
        <div className="bg-card rounded-xl p-3 border border-border text-center">
          <Calendar className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">{host.yearsHosting}</p>
          <p className="text-[10px] text-muted-foreground">{lang === "ar" ? "سنة استضافة" : "Yrs hosting"}</p>
        </div>
      </div>

      {/* Bio */}
      <div className="px-4 mt-5">
        <h2 className="text-sm font-semibold text-foreground mb-2">
          {lang === "ar" ? "نبذة" : "About"}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{host.bio[lang]}</p>
      </div>

      {/* Languages */}
      <div className="px-4 mt-5">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">
            {lang === "ar" ? "اللغات" : "Languages"}
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {host.languages[lang].map((language, i) => (
            <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-secondary text-foreground font-medium">
              {language}
            </span>
          ))}
        </div>
      </div>

      {/* Hosting Philosophy */}
      <div className="px-4 mt-5">
        <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
          <Heart className="w-5 h-5 text-primary mb-2" />
          <h3 className="text-sm font-semibold text-foreground mb-1">
            {lang === "ar" ? "فلسفة الاستضافة" : "Hosting Philosophy"}
          </h3>
          <p className="text-sm italic text-muted-foreground leading-relaxed">"{host.philosophy[lang]}"</p>
        </div>
      </div>

      {/* Contact */}
      <div className="px-4 mt-5">
        <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-card border border-border shadow-card text-sm font-semibold text-foreground">
          <MessageCircle className="w-4 h-4 text-primary" />
          {lang === "ar" ? "تواصل مع المضيف" : "Message Host"}
        </button>
      </div>

      {/* Listings */}
      {hostListings.length > 0 && (
        <div className="px-4 mt-6">
          <h2 className="text-sm font-semibold text-foreground mb-3">
            {lang === "ar" ? "أماكن الإقامة" : "Listings"}
          </h2>
          <div className="space-y-3">
            {hostListings.map((place) => (
              <div
                key={place.id}
                onClick={() => navigate(`/stay/${place.id}`)}
                className="flex gap-3 rounded-xl bg-card shadow-card border border-border overflow-hidden cursor-pointer"
              >
                <img
                  src={place.image}
                  alt={place.title[lang]}
                  className="w-24 h-20 object-cover flex-shrink-0"
                />
                <div className="py-2.5 pe-3 flex flex-col justify-center flex-1">
                  <span className="text-[10px] font-medium text-primary mb-0.5">{place.type[lang]}</span>
                  <h3 className="text-xs font-semibold text-foreground line-clamp-2">{place.title[lang]}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 text-primary fill-primary" />
                      <span className="text-[10px] font-medium text-foreground">{place.rating}</span>
                    </div>
                    <span className="text-[10px] font-bold text-primary">{place.price} {lang === "ar" ? "ج.م" : "EGP"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HostDetail;
