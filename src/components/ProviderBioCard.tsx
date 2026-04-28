import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ProviderBioCardProps {
  providerId?: string;
  roleLabel?: { en: string; ar: string };
}

const roleLabels: Record<string, { en: string; ar: string }> = {
  "culture-actor": { en: "Culture Actor", ar: "فاعل ثقافي" },
  "service-provider": { en: "Experience Host", ar: "مضيف التجربة" },
  "accommodation-host": { en: "Your Host", ar: "مضيفك" },
  "transport-provider": { en: "Transport Provider", ar: "مقدم النقل" },
  "trip-organizer": { en: "Trip Organizer", ar: "منظم الرحلة" },
  "product-seller": { en: "Artisan / Seller", ar: "الحرفي / البائع" },
  "organization": { en: "Organization", ar: "المنظمة" },
  "ambassador": { en: "Ambassador", ar: "السفير" },
};

const ProviderBioCard = ({ providerId, roleLabel }: ProviderBioCardProps) => {
  const navigate = useNavigate();
  const { lang } = useI18n();

  const { data: provider, isLoading } = useQuery({
    queryKey: ["provider", providerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("providers")
        .select("*")
        .eq("id", providerId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!providerId,
  });

  if (!providerId) return null;
  if (isLoading) {
    return (
      <div className="mx-4 mt-6 rounded-xl bg-card border border-border p-4">
        <div className="flex items-start gap-3">
          <Skeleton className="w-14 h-14 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }
  if (!provider) return null;

  const name = lang === "ar" ? provider.name_ar : provider.name_en;
  const bio = lang === "ar" ? provider.bio_ar : provider.bio_en;
  const city = lang === "ar" ? provider.city_ar : provider.city_en;
  const region = lang === "ar" ? provider.region_ar : provider.region_en;
  const tagline = lang === "ar" ? provider.tagline_ar : provider.tagline_en;
  const specialties: { en: string; ar: string }[] = provider.specialties || [];
  const label = roleLabel || roleLabels[provider.role] || { en: "Provider", ar: "مقدم الخدمة" };

  return (
    <div className="mx-4 mt-6 rounded-xl bg-card border border-border p-4 shadow-sm">
      <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
        {label[lang]}
      </h2>
      <div className="flex items-start gap-3">
        <img
          src={provider.avatar || "/placeholder.svg"}
          alt={name}
          className="w-14 h-14 rounded-full object-cover flex-shrink-0 border-2 border-primary/20 cursor-pointer"
          onClick={() => navigate(`/provider/${provider.id}`)}
        />
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-bold text-foreground cursor-pointer hover:text-primary transition-colors"
            onClick={() => navigate(`/provider/${provider.id}`)}
          >
            {name}
          </p>
          {city && (
            <p className="text-[11px] text-primary font-medium">
              {city}{region ? ` · ${region}` : ""}
            </p>
          )}
          {bio && (
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-3">
              {bio}
            </p>
          )}
          {specialties.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {specialties.slice(0, 3).map((s, i) => (
                <span key={i} className="text-[9px] bg-primary/10 text-primary font-medium px-1.5 py-0.5 rounded-full">
                  {s[lang]}
                </span>
              ))}
            </div>
          )}
          {tagline && (
            <p className="text-[11px] italic text-muted-foreground mt-2 border-s-2 border-primary/30 ps-2">
              "{tagline}"
            </p>
          )}
        </div>
      </div>
      <button
        onClick={() => navigate(`/provider/${provider.id}`)}
        className="w-full mt-3 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/15 rounded-lg py-2 transition-colors flex items-center justify-center gap-1"
      >
        {lang === "ar" ? "عرض الملف الشخصي" : "View Full Profile"}
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default ProviderBioCard;
