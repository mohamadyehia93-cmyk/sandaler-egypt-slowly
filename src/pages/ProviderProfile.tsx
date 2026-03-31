import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { providers, ProviderRole } from "@/lib/providerData";
import {
  ArrowLeft, Share2, MapPin, Star, CheckCircle, MessageSquare,
  Heart, Globe, Clock, ChevronRight, Users
} from "lucide-react";

const roleColorClass: Record<ProviderRole, string> = {
  "culture-actor": "bg-role-culture-actor",
  "service-provider": "bg-role-service-provider",
  "accommodation-host": "bg-role-host",
  "transport-provider": "bg-role-transport",
  "trip-organizer": "bg-role-trip-organizer",
  "product-seller": "bg-role-product-seller",
  "organization": "bg-role-organization",
  "ambassador": "bg-role-ambassador",
};

const roleTextClass: Record<ProviderRole, string> = {
  "culture-actor": "text-role-culture-actor",
  "service-provider": "text-role-service-provider",
  "accommodation-host": "text-role-host",
  "transport-provider": "text-role-transport",
  "trip-organizer": "text-role-trip-organizer",
  "product-seller": "text-role-product-seller",
  "organization": "text-role-organization",
  "ambassador": "text-role-ambassador",
};

const roleLabels: Record<ProviderRole, { en: string; ar: string }> = {
  "culture-actor": { en: "Culture Actor", ar: "فاعل ثقافي" },
  "service-provider": { en: "Service Provider", ar: "مقدم خدمة" },
  "accommodation-host": { en: "Accommodation Host", ar: "مضيف إقامة" },
  "transport-provider": { en: "Transport Provider", ar: "مقدم مواصلات" },
  "trip-organizer": { en: "Trip Organizer", ar: "منظم رحلات" },
  "product-seller": { en: "Product Seller", ar: "بائع منتجات" },
  "organization": { en: "Organization", ar: "مؤسسة" },
  "ambassador": { en: "Ambassador", ar: "سفير" },
};

const listingRoutes: Record<ProviderRole, string> = {
  "culture-actor": "/post",
  "service-provider": "/experience",
  "accommodation-host": "/stay",
  "transport-provider": "/transport",
  "trip-organizer": "/trip",
  "product-seller": "/product",
  "organization": "/cause",
  "ambassador": "/person",
};

const listingSectionLabels: Record<ProviderRole, { en: string; ar: string }> = {
  "culture-actor": { en: "Articles & Stories", ar: "مقالات وقصص" },
  "service-provider": { en: "Experiences", ar: "تجارب" },
  "accommodation-host": { en: "Properties", ar: "عقارات" },
  "transport-provider": { en: "Routes & Services", ar: "مسارات وخدمات" },
  "trip-organizer": { en: "Trips", ar: "رحلات" },
  "product-seller": { en: "Products", ar: "منتجات" },
  "organization": { en: "Programs & Causes", ar: "برامج وقضايا" },
  "ambassador": { en: "Verified Providers", ar: "مزودون موثقون" },
};

const ProviderProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useI18n();
  const [following, setFollowing] = useState(false);

  const provider = providers.find((p) => p.id === id) || providers[0];
  const color = roleColorClass[provider.role];
  const textColor = roleTextClass[provider.role];
  const roleLabel = roleLabels[provider.role];

  return (
    <div className="min-h-screen bg-surface pb-8">
      {/* Cover Image */}
      <div className="relative h-48">
        <img src={provider.coverImage} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-4 z-10">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-black/30 backdrop-blur flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <button className="w-8 h-8 rounded-full bg-black/30 backdrop-blur flex items-center justify-center">
            <Share2 className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Avatar + Name */}
      <div className="px-4 -mt-12 relative z-10">
        <div className="flex items-end gap-3">
          <img
            src={provider.avatar}
            alt={provider.name[lang]}
            className="w-20 h-20 rounded-2xl border-4 border-background object-cover shadow-card"
          />
          <div className="pb-1 flex-1">
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-bold text-foreground">{provider.name[lang]}</h1>
              {provider.verified && <CheckCircle className={`w-4 h-4 ${textColor}`} />}
            </div>
            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${color} text-white text-[10px] font-semibold`}>
              {roleLabel[lang]}
            </div>
          </div>
        </div>
      </div>

      {/* Tagline */}
      <p className="px-4 mt-2 text-sm text-muted-foreground italic">"{provider.tagline[lang]}"</p>

      {/* Action Buttons */}
      <div className="px-4 mt-4 flex gap-2">
        <button
          onClick={() => setFollowing(!following)}
          className={`flex-1 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5 transition-colors ${
            following
              ? "border-2 border-border text-foreground bg-card"
              : `${color} text-white`
          }`}
        >
          {following ? (
            <>
              <CheckCircle className="w-4 h-4" />
              {lang === "ar" ? "متابَع" : "Following"}
            </>
          ) : (
            <>
              <Heart className="w-4 h-4" />
              {lang === "ar" ? "متابعة" : "Follow"}
            </>
          )}
        </button>
        <button
          onClick={() => navigate("/inbox")}
          className="flex-1 py-2.5 rounded-xl border-2 border-border text-foreground font-semibold text-sm flex items-center justify-center gap-1.5 bg-card"
        >
          <MessageSquare className="w-4 h-4" />
          {lang === "ar" ? "رسالة" : "Message"}
        </button>
      </div>

      {/* Stats Row */}
      <div className="flex mx-4 mt-4 bg-card rounded-xl shadow-card overflow-hidden">
        {provider.stats.map((s, i) => (
          <div key={i} className={`flex-1 py-3 text-center ${i < provider.stats.length - 1 ? "border-r border-border" : ""}`}>
            <span className="text-lg font-bold text-foreground block">{s.value}</span>
            <span className="text-[10px] text-muted-foreground">{s.label[lang]}</span>
          </div>
        ))}
      </div>

      {/* Info Cards */}
      <div className="px-4 mt-4 space-y-3">
        {/* About */}
        <div className="bg-card rounded-xl shadow-card p-4">
          <h3 className="text-sm font-bold text-foreground mb-2">{lang === "ar" ? "نبذة" : "About"}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">{provider.bio[lang]}</p>
        </div>

        {/* Details Grid */}
        <div className="bg-card rounded-xl shadow-card p-4 space-y-3">
          <div className="flex items-center gap-3">
            <MapPin className={`w-4 h-4 ${textColor} shrink-0`} />
            <div>
              <p className="text-xs font-semibold text-foreground">{provider.city[lang]}</p>
              <p className="text-[10px] text-muted-foreground">{provider.region[lang]}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Globe className={`w-4 h-4 ${textColor} shrink-0`} />
            <p className="text-xs text-foreground">{provider.languages[lang]}</p>
          </div>
          <div className="flex items-center gap-3">
            <Clock className={`w-4 h-4 ${textColor} shrink-0`} />
            <p className="text-xs text-foreground">
              {provider.yearsActive} {lang === "ar" ? "سنوات خبرة" : "years experience"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Users className={`w-4 h-4 ${textColor} shrink-0`} />
            <p className="text-xs text-foreground">
              {provider.followers.toLocaleString()} {lang === "ar" ? "متابع" : "followers"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Star className={`w-4 h-4 text-warning shrink-0`} />
            <p className="text-xs text-foreground">
              {provider.rating} ({provider.reviewCount} {lang === "ar" ? "تقييم" : "reviews"})
            </p>
          </div>
        </div>

        {/* Specialties */}
        <div className="bg-card rounded-xl shadow-card p-4">
          <h3 className="text-sm font-bold text-foreground mb-2">{lang === "ar" ? "التخصصات" : "Specialties"}</h3>
          <div className="flex flex-wrap gap-2">
            {provider.specialties.map((s, i) => (
              <span key={i} className={`px-3 py-1 rounded-full text-[10px] font-semibold ${color} text-white`}>
                {s[lang]}
              </span>
            ))}
          </div>
        </div>

        {/* Listings */}
        {provider.listings.length > 0 && (
          <div className="bg-card rounded-xl shadow-card p-4">
            <h3 className="text-sm font-bold text-foreground mb-3">
              {listingSectionLabels[provider.role][lang]}
            </h3>
            <div className="space-y-3">
              {provider.listings.map((listing) => (
                <button
                  key={listing.id}
                  onClick={() => navigate(`${listingRoutes[provider.role]}/${listing.id}`)}
                  className="w-full flex items-center gap-3 text-start"
                >
                  <img
                    src={listing.image}
                    alt=""
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{listing.title[lang]}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {listing.rating && (
                        <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                          <Star className="w-3 h-3 text-warning fill-warning" /> {listing.rating}
                        </span>
                      )}
                      {listing.price && (
                        <span className="text-[10px] font-medium text-foreground">{listing.price}</span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderProfile;
