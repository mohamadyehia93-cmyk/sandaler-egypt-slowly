import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { providers, Provider } from "@/lib/providerData";
import { ChevronRight } from "lucide-react";

interface ProviderBioCardProps {
  providerId?: string;
  /** Override label, e.g. "Trip Organizer" */
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

  if (!providerId) return null;
  const provider = providers.find((p) => p.id === providerId);
  if (!provider) return null;

  const label = roleLabel || roleLabels[provider.role] || { en: "Provider", ar: "مقدم الخدمة" };

  return (
    <div className="mx-4 mt-6 rounded-xl bg-card border border-border p-4 shadow-sm">
      <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
        {label[lang]}
      </h2>
      <div className="flex items-start gap-3">
        <img
          src={provider.avatar}
          alt={provider.name[lang]}
          className="w-14 h-14 rounded-full object-cover flex-shrink-0 border-2 border-primary/20 cursor-pointer"
          onClick={() => navigate(`/provider/${provider.id}`)}
        />
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-bold text-foreground cursor-pointer hover:text-primary transition-colors"
            onClick={() => navigate(`/provider/${provider.id}`)}
          >
            {provider.name[lang]}
          </p>
          <p className="text-[11px] text-primary font-medium">
            {provider.city[lang]} · {provider.region[lang]}
          </p>
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-3">
            {provider.bio[lang]}
          </p>
          {provider.specialties && provider.specialties.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {provider.specialties.slice(0, 3).map((s, i) => (
                <span key={i} className="text-[9px] bg-primary/10 text-primary font-medium px-1.5 py-0.5 rounded-full">
                  {s[lang]}
                </span>
              ))}
            </div>
          )}
          {provider.tagline && (
            <p className="text-[11px] italic text-muted-foreground mt-2 border-s-2 border-primary/30 ps-2">
              "{provider.tagline[lang]}"
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