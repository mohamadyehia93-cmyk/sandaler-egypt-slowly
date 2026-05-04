import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fetchByIdOrSlug } from "@/lib/fetchByIdOrSlug";
import { Skeleton } from "@/components/ui/skeleton";
import ProviderStatusView from "@/components/ProviderStatusView";
import FollowButton from "@/components/FollowButton";
import {
import NotFoundView from "@/components/NotFound";
  ArrowLeft, Share2, MapPin, Star, CheckCircle, MessageSquare,
  Heart, Globe, Clock, ChevronRight, Users
} from "lucide-react";

type ProviderRole =
  | "culture-actor" | "service-provider" | "accommodation-host"
  | "transport-provider" | "trip-organizer" | "product-seller"
  | "organization" | "ambassador";

const roleColorClass: Record<string, string> = {
  "culture-actor": "bg-role-culture-actor",
  "service-provider": "bg-role-service-provider",
  "accommodation-host": "bg-role-host",
  "transport-provider": "bg-role-transport",
  "trip-organizer": "bg-role-trip-organizer",
  "product-seller": "bg-role-product-seller",
  "organization": "bg-role-organization",
  "ambassador": "bg-role-ambassador",
};

const roleTextClass: Record<string, string> = {
  "culture-actor": "text-role-culture-actor",
  "service-provider": "text-role-service-provider",
  "accommodation-host": "text-role-host",
  "transport-provider": "text-role-transport",
  "trip-organizer": "text-role-trip-organizer",
  "product-seller": "text-role-product-seller",
  "organization": "text-role-organization",
  "ambassador": "text-role-ambassador",
};

const roleLabels: Record<string, { en: string; ar: string }> = {
  "culture-actor": { en: "Culture Actor", ar: "فاعل ثقافي" },
  "service-provider": { en: "Service Provider", ar: "مقدم خدمة" },
  "accommodation-host": { en: "Accommodation Host", ar: "مضيف إقامة" },
  "transport-provider": { en: "Transport Provider", ar: "مقدم مواصلات" },
  "trip-organizer": { en: "Trip Organizer", ar: "منظم رحلات" },
  "product-seller": { en: "Product Seller", ar: "بائع منتجات" },
  "organization": { en: "Organization", ar: "مؤسسة" },
  "ambassador": { en: "Ambassador", ar: "سفير" },
};

const listingRoutes: Record<string, string> = {
  "culture-actor": "/post",
  "service-provider": "/experience",
  "accommodation-host": "/stay",
  "transport-provider": "/transport",
  "trip-organizer": "/trip",
  "product-seller": "/product",
  "organization": "/cause",
  "ambassador": "/person",
};

const listingSectionLabels: Record<string, { en: string; ar: string }> = {
  "culture-actor": { en: "Articles & Stories", ar: "مقالات وقصص" },
  "service-provider": { en: "Experiences", ar: "تجارب" },
  "accommodation-host": { en: "Properties", ar: "عقارات" },
  "transport-provider": { en: "Routes & Services", ar: "مسارات وخدمات" },
  "trip-organizer": { en: "Trips", ar: "رحلات" },
  "product-seller": { en: "Products", ar: "منتجات" },
  "organization": { en: "Programs & Causes", ar: "برامج وقضايا" },
  "ambassador": { en: "Verified Providers", ar: "مزودون موثقون" },
};

// Map role to the table + column that links listings back
const listingSource: Record<string, { table: string; column: string; titleEn: string; titleAr: string; imageCol: string; ratingCol?: string; priceCol?: string }> = {
  "service-provider": { table: "experiences", column: "provider_id", titleEn: "title_en", titleAr: "title_ar", imageCol: "image", ratingCol: "rating", priceCol: "price" },
  "accommodation-host": { table: "accommodations", column: "host_id", titleEn: "name_en", titleAr: "name_ar", imageCol: "image", ratingCol: "rating", priceCol: "price_per_night" },
  "transport-provider": { table: "transport", column: "provider_id", titleEn: "name_en", titleAr: "name_ar", imageCol: "image", ratingCol: "rating", priceCol: "price" },
  "trip-organizer": { table: "trips", column: "organizer_id", titleEn: "title_en", titleAr: "title_ar", imageCol: "image", ratingCol: "rating", priceCol: "price" },
  "product-seller": { table: "products", column: "seller_id", titleEn: "name_en", titleAr: "name_ar", imageCol: "image", ratingCol: "rating", priceCol: "price" },
};

const ProviderProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useI18n();
  const [following, setFollowing] = useState(false);

  const { data: provider, isLoading } = useQuery({
    queryKey: ["provider", id],
    queryFn: async () => {
      // Try UUID first, then slug
      const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const col = UUID_RE.test(id!) ? "id" : "slug";
      const { data, error } = await (supabase as any)
        .from("providers")
        .select("*")
        .eq(col, id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch listings for this provider
  const source = provider ? listingSource[provider.role] : null;
  const { data: listings } = useQuery({
    queryKey: ["provider-listings", provider?.id, provider?.role],
    queryFn: async () => {
      if (!source || !provider) return [];
      const { data, error } = await (supabase as any)
        .from(source.table)
        .select("*")
        .eq(source.column, provider.id)
        .eq("status", "published")
        .limit(5);
      if (error) throw error;
      return data || [];
    },
    enabled: !!provider && !!source,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface p-4 space-y-4">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!provider) return <NotFoundView context="person" />;

  const name = lang === "ar" ? provider.name_ar : provider.name_en;
  const bio = lang === "ar" ? provider.bio_ar : provider.bio_en;
  const city = lang === "ar" ? provider.city_ar : provider.city_en;
  const region = lang === "ar" ? provider.region_ar : provider.region_en;
  const tagline = lang === "ar" ? provider.tagline_ar : provider.tagline_en;
  const specialties: { en: string; ar: string }[] = provider.specialties || [];
  const color = roleColorClass[provider.role] || "bg-primary";
  const textColor = roleTextClass[provider.role] || "text-primary";
  const roleLabel = roleLabels[provider.role] || { en: "Provider", ar: "مقدم خدمة" };

  return (
    <div className="min-h-screen bg-surface pb-8">
      {/* Cover Image */}
      <div className="relative h-48">
        <img src={provider.cover_image || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
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
            src={provider.avatar || "/placeholder.svg"}
            alt={name}
            className="w-20 h-20 rounded-2xl border-4 border-background object-cover shadow-card"
          />
          <div className="pb-1 flex-1">
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-bold text-foreground">{name}</h1>
              {provider.verified && <CheckCircle className={`w-4 h-4 ${textColor}`} />}
            </div>
            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${color} text-white text-[10px] font-semibold`}>
              {roleLabel[lang]}
            </div>
          </div>
        </div>
      </div>

      {/* Tagline */}
      {tagline && <p className="px-4 mt-2 text-sm text-muted-foreground italic">"{tagline}"</p>}

      {/* Action Buttons */}
      <div className="px-4 mt-4 flex gap-2">
        <FollowButton
          targetType="provider"
          targetId={provider.id}
          variant="primary"
          className="flex-1"
        />
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
        <div className="flex-1 py-3 text-center border-r border-border">
          <span className="text-lg font-bold text-foreground block">{provider.followers || 0}</span>
          <span className="text-[10px] text-muted-foreground">{lang === "ar" ? "متابع" : "Followers"}</span>
        </div>
        <div className="flex-1 py-3 text-center border-r border-border">
          <span className="text-lg font-bold text-foreground block">{provider.rating || 0}</span>
          <span className="text-[10px] text-muted-foreground">{lang === "ar" ? "تقييم" : "Rating"}</span>
        </div>
        <div className="flex-1 py-3 text-center">
          <span className="text-lg font-bold text-foreground block">{provider.years_active || 0}</span>
          <span className="text-[10px] text-muted-foreground">{lang === "ar" ? "سنوات" : "Years"}</span>
        </div>
      </div>

      {/* Info Cards */}
      <div className="px-4 mt-4 space-y-3">
        {/* Today's Status */}
        {provider.user_id && (
          <ProviderStatusView userId={provider.user_id} accentText={textColor} />
        )}

        {/* About */}
        {bio && (
          <div className="bg-card rounded-xl shadow-card p-4">
            <h3 className="text-sm font-bold text-foreground mb-2">{lang === "ar" ? "نبذة" : "About"}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{bio}</p>
          </div>
        )}

        {/* Details Grid */}
        <div className="bg-card rounded-xl shadow-card p-4 space-y-3">
          {city && (
            <div className="flex items-center gap-3">
              <MapPin className={`w-4 h-4 ${textColor} shrink-0`} />
              <div>
                <p className="text-xs font-semibold text-foreground">{city}</p>
                {region && <p className="text-[10px] text-muted-foreground">{region}</p>}
              </div>
            </div>
          )}
          {provider.languages && (
            <div className="flex items-center gap-3">
              <Globe className={`w-4 h-4 ${textColor} shrink-0`} />
              <p className="text-xs text-foreground">{provider.languages}</p>
            </div>
          )}
          {provider.years_active > 0 && (
            <div className="flex items-center gap-3">
              <Clock className={`w-4 h-4 ${textColor} shrink-0`} />
              <p className="text-xs text-foreground">
                {provider.years_active} {lang === "ar" ? "سنوات خبرة" : "years experience"}
              </p>
            </div>
          )}
          {(provider.followers || 0) > 0 && (
            <div className="flex items-center gap-3">
              <Users className={`w-4 h-4 ${textColor} shrink-0`} />
              <p className="text-xs text-foreground">
                {provider.followers?.toLocaleString()} {lang === "ar" ? "متابع" : "followers"}
              </p>
            </div>
          )}
          {(provider.rating || 0) > 0 && (
            <div className="flex items-center gap-3">
              <Star className="w-4 h-4 text-warning shrink-0" />
              <p className="text-xs text-foreground">
                {provider.rating} ({provider.review_count || 0} {lang === "ar" ? "تقييم" : "reviews"})
              </p>
            </div>
          )}
        </div>

        {/* Specialties */}
        {specialties.length > 0 && (
          <div className="bg-card rounded-xl shadow-card p-4">
            <h3 className="text-sm font-bold text-foreground mb-2">{lang === "ar" ? "التخصصات" : "Specialties"}</h3>
            <div className="flex flex-wrap gap-2">
              {specialties.map((s, i) => (
                <span key={i} className={`px-3 py-1 rounded-full text-[10px] font-semibold ${color} text-white`}>
                  {s[lang]}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Listings from DB */}
        {listings && listings.length > 0 && source && (
          <div className="bg-card rounded-xl shadow-card p-4">
            <h3 className="text-sm font-bold text-foreground mb-3">
              {(listingSectionLabels[provider.role] || { en: "Listings", ar: "العروض" })[lang]}
            </h3>
            <div className="space-y-3">
              {listings.map((listing: any) => (
                <button
                  key={listing.id}
                  onClick={() => navigate(`${listingRoutes[provider.role] || "/experience"}/${listing.slug || listing.id}`)}
                  className="w-full flex items-center gap-3 text-start"
                >
                  <img
                    src={listing[source.imageCol] || "/placeholder.svg"}
                    alt=""
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {lang === "ar" ? listing[source.titleAr] : listing[source.titleEn]}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {source.ratingCol && listing[source.ratingCol] > 0 && (
                        <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                          <Star className="w-3 h-3 text-warning fill-warning" /> {listing[source.ratingCol]}
                        </span>
                      )}
                      {source.priceCol && listing[source.priceCol] > 0 && (
                        <span className="text-[10px] font-medium text-foreground">{listing[source.priceCol]} EGP</span>
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
