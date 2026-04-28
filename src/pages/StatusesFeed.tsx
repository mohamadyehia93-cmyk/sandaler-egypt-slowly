import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Sparkles, Link as LinkIcon, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import BottomNav from "@/components/BottomNav";

const todayUTC = () => new Date().toISOString().slice(0, 10);

const roleTextClass: Record<string, string> = {
  "culture-actor": "text-role-culture-actor",
  "service-provider": "text-role-service-provider",
  "accommodation-host": "text-role-host",
  "transport-provider": "text-role-transport",
  "trip-organizer": "text-role-trip-organizer",
  "product-seller": "text-role-product-seller",
  organization: "text-role-organization",
  ambassador: "text-role-ambassador",
  narrator: "text-role-narrator",
  "subject-expert": "text-role-subject-expert",
  "whos-who": "text-primary",
};

const roleLabels: Record<string, { en: string; ar: string }> = {
  "culture-actor": { en: "Culture Actor", ar: "فاعل ثقافي" },
  "service-provider": { en: "Service Provider", ar: "مقدّم خدمة" },
  "accommodation-host": { en: "Host", ar: "مضيف" },
  "transport-provider": { en: "Transport", ar: "مواصلات" },
  "trip-organizer": { en: "Trip Organizer", ar: "منظّم رحلات" },
  "product-seller": { en: "Seller", ar: "بائع" },
  organization: { en: "Organization", ar: "منظمة" },
  ambassador: { en: "Ambassador", ar: "سفير" },
  narrator: { en: "Narrator", ar: "راوي" },
  "subject-expert": { en: "Expert", ar: "خبير" },
  "whos-who": { en: "Local", ar: "شخصية" },
};

const FILTERS = [
  { id: "all", en: "All", ar: "الكل" },
  { id: "culture-actor", en: "Culture", ar: "ثقافة" },
  { id: "service-provider", en: "Services", ar: "خدمات" },
  { id: "accommodation-host", en: "Hosts", ar: "إقامة" },
  { id: "trip-organizer", en: "Trips", ar: "رحلات" },
  { id: "product-seller", en: "Sellers", ar: "بائعون" },
  { id: "organization", en: "Orgs", ar: "منظمات" },
];

const StatusesFeed = () => {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");

  const { data: statuses = [], isLoading } = useQuery({
    queryKey: ["statuses_feed", todayUTC()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("provider_statuses")
        .select("*")
        .eq("status_date", todayUTC())
        .order("updated_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
  });

  const userIds = useMemo(
    () => Array.from(new Set(statuses.map((s: any) => s.user_id).filter(Boolean))),
    [statuses]
  );

  const { data: providers = [] } = useQuery({
    queryKey: ["statuses_feed_providers", userIds],
    enabled: userIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("providers")
        .select("user_id, name_en, name_ar, avatar, slug, role, city_en, city_ar")
        .in("user_id", userIds);
      if (error) throw error;
      return data || [];
    },
  });

  const providerByUser = useMemo(() => {
    const map = new Map<string, any>();
    providers.forEach((p: any) => map.set(p.user_id, p));
    return map;
  }, [providers]);

  const enriched = useMemo(() => {
    return statuses
      .map((s: any) => ({ status: s, provider: s.user_id ? providerByUser.get(s.user_id) : null }))
      .filter(({ status, provider }) => {
        if (filter === "all") return true;
        return provider?.role === filter && !!status; // hide sample-only when filtering by role
      });
  }, [statuses, providerByUser, filter]);

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="min-h-screen bg-surface pb-24">
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            aria-label={isAr ? "رجوع" : "Back"}
            className="p-1.5 rounded-full hover:bg-secondary"
          >
            <ArrowLeft className={`w-5 h-5 text-foreground ${isAr ? "rotate-180" : ""}`} />
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-bold text-foreground">
              {isAr ? "حالات اليوم" : "Today's Statuses"}
            </h1>
          </div>
        </div>
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto no-scrollbar">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition ${
                filter === f.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-foreground border-border"
              }`}
            >
              {isAr ? f.ar : f.en}
            </button>
          ))}
        </div>
      </header>

      <main className="px-4 py-4 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : enriched.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-12">
            {isAr ? "لا توجد حالات اليوم بعد." : "No statuses today yet."}
          </p>
        ) : (
          enriched.map(({ status, provider }) => {
            const accent = provider ? roleTextClass[provider.role] || "text-primary" : "text-primary";
            const name = provider
              ? isAr
                ? provider.name_ar
                : provider.name_en
              : isAr
              ? "مستخدم"
              : "User";
            const roleLbl = provider ? roleLabels[provider.role] : null;
            const city = provider ? (isAr ? provider.city_ar : provider.city_en) : null;
            const goToProfile = () => {
              if (provider?.slug) navigate(`/provider/${provider.slug}`);
            };
            return (
              <article
                key={status.id}
                className="bg-card rounded-xl shadow-card p-4 text-start"
              >
                <header className="flex items-center gap-3 mb-2">
                  <button
                    onClick={goToProfile}
                    className="shrink-0"
                    aria-label={name}
                  >
                    {provider?.avatar ? (
                      <img
                        src={provider.avatar}
                        alt={name}
                        className="w-10 h-10 rounded-full object-cover border border-border"
                      />
                    ) : (
                      <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs font-bold ${accent}`}>
                        {(name || "?").slice(0, 1)}
                      </div>
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={goToProfile}
                      className="block text-sm font-bold text-foreground truncate text-start"
                    >
                      {name}
                    </button>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      {roleLbl && (
                        <span className={`font-semibold ${accent}`}>
                          {isAr ? roleLbl.ar : roleLbl.en}
                        </span>
                      )}
                      {city && <span>· {city}</span>}
                      <span>
                        ·{" "}
                        {new Date(status.updated_at).toLocaleTimeString(
                          isAr ? "ar-EG" : "en-US",
                          { hour: "2-digit", minute: "2-digit" }
                        )}
                      </span>
                    </div>
                  </div>
                </header>
                <p
                  dir="auto"
                  className="text-sm text-foreground whitespace-pre-wrap text-start"
                >
                  {status.text}
                </p>
                {status.image_url && (
                  <img
                    src={status.image_url}
                    alt={isAr ? "صورة الحالة" : "Status image"}
                    className="w-full max-h-64 object-cover rounded-lg mt-2"
                  />
                )}
                {status.link_url && (
                  <a
                    href={status.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    dir="ltr"
                    className={`inline-flex items-center gap-1 text-xs font-medium ${accent} break-all mt-2`}
                  >
                    <LinkIcon className="w-3 h-3 flex-shrink-0" />
                    <span className="break-all">{status.link_url}</span>
                  </a>
                )}
              </article>
            );
          })
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default StatusesFeed;
