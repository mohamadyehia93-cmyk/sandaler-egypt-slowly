import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { usePartners } from "@/hooks/useListings";
import SectionHeader from "./SectionHeader";
import { Skeleton } from "./ui/skeleton";

const Partners = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const { data: partners, isLoading } = usePartners();

  return (
    <SectionHeader titleKey="section.partners">
      <div className="grid grid-cols-3 gap-3 px-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[80px] rounded-xl" />
            ))
          : (partners ?? []).map((p: any) => {
              const isUrl = typeof p.logo === "string" && /^(https?:|\/)/.test(p.logo);
              const name = lang === "ar" ? p.name_ar : p.name_en;
              return (
                <div
                  key={p.id}
                  onClick={() => navigate(`/partner/${p.slug || p.id}`)}
                  className="bg-card rounded-xl p-3 shadow-card border border-border flex flex-col items-center text-center gap-1.5 cursor-pointer"
                >
                  {isUrl ? (
                    <img
                      src={p.logo}
                      alt={name}
                      loading="lazy"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl leading-none">{p.logo || "🏛️"}</span>
                  )}
                  <h3 className="text-[11px] font-semibold text-foreground leading-tight line-clamp-2">
                    {name}
                  </h3>
                  <span className="text-[9px] text-muted-foreground">
                    {lang === "ar" ? p.type_ar : p.type_en}
                  </span>
                </div>
              );
            })}
      </div>
    </SectionHeader>
  );
};

export default Partners;
