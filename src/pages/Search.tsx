import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Search as SearchIcon, X, ArrowLeft, Compass, Route as RouteIcon, CalendarDays,
  FileText, Headphones, ShoppingBag, BedDouble, Bus, HandHeart, Users, Palette,
  Building2, Store, MapPin, Map as MapIcon, Clock,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

type SearchRow = {
  item_type: string;
  item_id: string | null;
  slug: string | null;
  title_en: string | null;
  title_ar: string | null;
  subtitle: string | null;
  image: string | null;
  rank: number;
};

type TypeConfig = {
  route: string;
  icon: typeof SearchIcon;
  label: { en: string; ar: string };
};

/** One entry per item_type returned by public.global_search (mirrors the
 *  TYPE_CONFIG pattern used on the Wishlists page). */
const TYPE_CONFIG: Record<string, TypeConfig> = {
  experience: { route: "/experience", icon: Compass, label: { en: "Experiences", ar: "التجارب" } },
  trip: { route: "/trip", icon: RouteIcon, label: { en: "Trips", ar: "الرحلات" } },
  event: { route: "/event", icon: CalendarDays, label: { en: "Events", ar: "الفعاليات" } },
  audio_tour: { route: "/audio-tour", icon: Headphones, label: { en: "Audio tours", ar: "الجولات الصوتية" } },
  accommodation: { route: "/stay", icon: BedDouble, label: { en: "Stays", ar: "أماكن الإقامة" } },
  transport: { route: "/transport", icon: Bus, label: { en: "Transport", ar: "المواصلات" } },
  product: { route: "/product", icon: ShoppingBag, label: { en: "Products", ar: "المنتجات" } },
  cause: { route: "/cause", icon: HandHeart, label: { en: "Causes", ar: "القضايا" } },
  post: { route: "/post", icon: FileText, label: { en: "Articles", ar: "المقالات" } },
  person: { route: "/person", icon: Users, label: { en: "People", ar: "الأشخاص" } },
  culture_actor: { route: "/culture-actor", icon: Palette, label: { en: "Culture figures", ar: "رواد الثقافة" } },
  organization: { route: "/organization", icon: Building2, label: { en: "Organizations", ar: "المنظمات" } },
  provider: { route: "/provider", icon: Store, label: { en: "Providers", ar: "مقدمو الخدمات" } },
  city: { route: "/city", icon: MapPin, label: { en: "Cities", ar: "المدن" } },
  region: { route: "/region", icon: MapIcon, label: { en: "Regions", ar: "المناطق" } },
};

const ORDER = [
  "city", "region", "experience", "trip", "event", "audio_tour", "accommodation",
  "transport", "product", "cause", "post", "person", "culture_actor",
  "organization", "provider",
];

const RECENT_KEY = "sandal.recent-searches";

const readRecent = (): string[] => {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.filter((x) => typeof x === "string").slice(0, 8) : [];
  } catch {
    return [];
  }
};

const Search = () => {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const urlQ = params.get("q") ?? "";

  const [input, setInput] = useState(urlQ);
  const [recent, setRecent] = useState<string[]>(() => readRecent());
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep the field in sync when the URL changes (back / forward / shared link).
  useEffect(() => {
    setInput(urlQ);
  }, [urlQ]);

  // Debounce (~250ms) the field into the URL so ?q= stays shareable.
  useEffect(() => {
    const next = input.trim();
    if (next === urlQ.trim()) return;
    const id = window.setTimeout(() => {
      setParams(next ? { q: next } : {}, { replace: true });
    }, 250);
    return () => window.clearTimeout(id);
  }, [input, urlQ, setParams]);

  const q = urlQ.trim();

  const { data: rows = [], isFetching, error } = useQuery({
    queryKey: ["global-search", q],
    enabled: q.length >= 2,
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("global_search", { _q: q, _limit: 60 });
      if (error) throw error;
      return (data ?? []) as SearchRow[];
    },
  });

  // Remember successful searches locally.
  useEffect(() => {
    if (q.length < 2 || rows.length === 0) return;
    setRecent((prev) => {
      const next = [q, ...prev.filter((x) => x.toLowerCase() !== q.toLowerCase())].slice(0, 8);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        /* storage unavailable — recent searches are optional */
      }
      return next;
    });
  }, [q, rows.length]);

  const grouped = useMemo(() => {
    const map = new Map<string, SearchRow[]>();
    for (const r of rows) {
      if (!TYPE_CONFIG[r.item_type]) continue;
      const list = map.get(r.item_type) ?? [];
      list.push(r);
      map.set(r.item_type, list);
    }
    return map;
  }, [rows]);

  const hrefFor = useCallback((r: SearchRow) => {
    const cfg = TYPE_CONFIG[r.item_type];
    return `${cfg.route}/${r.slug || r.item_id}`;
  }, []);

  const clearRecent = () => {
    setRecent([]);
    try {
      localStorage.removeItem(RECENT_KEY);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="min-h-screen bg-surface pb-20" dir={isAr ? "rtl" : "ltr"}>
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="flex items-center gap-2 px-3 py-3">
          <button
            onClick={() => navigate(-1)}
            aria-label={isAr ? "رجوع" : "Back"}
            className="p-2 rounded-full hover:bg-secondary text-foreground shrink-0"
          >
            <ArrowLeft className={`w-5 h-5 ${isAr ? "rotate-180" : ""}`} />
          </button>
          <div className="relative flex-1">
            <SearchIcon
              className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${isAr ? "right-3" : "left-3"}`}
            />
            <input
              ref={inputRef}
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              type="search"
              enterKeyHint="search"
              placeholder={isAr ? "ابحث عن تجارب، أماكن، أشخاص…" : "Search experiences, places, people…"}
              aria-label={isAr ? "بحث" : "Search"}
              className={`w-full h-10 rounded-xl bg-secondary text-sm text-foreground placeholder:text-muted-foreground border-none outline-none focus:ring-2 focus:ring-primary/40 ${
                isAr ? "pr-9 pl-9" : "pl-9 pr-9"
              }`}
            />
            {input && (
              <button
                onClick={() => {
                  setInput("");
                  setParams({}, { replace: true });
                  inputRef.current?.focus();
                }}
                aria-label={isAr ? "مسح" : "Clear"}
                className={`absolute top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-background ${isAr ? "left-2" : "right-2"}`}
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
        {q.length >= 2 && !isFetching && !error && (
          <p className="px-4 pb-2 text-xs text-muted-foreground">
            {isAr
              ? `${rows.length} نتيجة عن «${q}»`
              : `${rows.length} result${rows.length === 1 ? "" : "s"} for “${q}”`}
          </p>
        )}
      </header>

      {/* Idle — nothing typed yet */}
      {q.length < 2 && (
        <div className="px-4 py-6">
          {recent.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Clock className="w-4 h-4 text-primary" />
                  {isAr ? "بحث سابق" : "Recent searches"}
                </h2>
                <button onClick={clearRecent} className="text-xs text-muted-foreground">
                  {isAr ? "مسح" : "Clear"}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recent.map((term) => (
                  <button
                    key={term}
                    onClick={() => setInput(term)}
                    className="px-3 py-1.5 rounded-full bg-card border border-border text-xs text-foreground"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </section>
          )}
          <div className="flex flex-col items-center text-center py-10">
            <SearchIcon className="w-14 h-14 text-muted-foreground/30 mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-1">
              {isAr ? "ابحث في كل ما في صندل" : "Search everything on Sandal"}
            </h2>
            <p className="text-sm text-muted-foreground max-w-xs">
              {isAr
                ? "تجارب، رحلات، فعاليات، أماكن إقامة، منتجات، مقالات، أشخاص ومدن — بالعربية أو الإنجليزية."
                : "Experiences, trips, events, stays, products, articles, people and cities — in Arabic or English."}
            </p>
          </div>
        </div>
      )}

      {q.length >= 2 && isFetching && (
        <div className="px-4 py-4 space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      )}

      {q.length >= 2 && !isFetching && error && (
        <div className="px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            {isAr ? "تعذّر تنفيذ البحث. حاول مرة أخرى." : "Search failed. Please try again."}
          </p>
        </div>
      )}

      {q.length >= 2 && !isFetching && !error && rows.length === 0 && (
        <div className="flex flex-col items-center text-center px-6 py-16">
          <SearchIcon className="w-14 h-14 text-muted-foreground/30 mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-1">
            {isAr ? "لا نتائج" : "No results"}
          </h2>
          <p className="text-sm text-muted-foreground mb-5 max-w-xs">
            {isAr
              ? `لم نجد شيئًا يطابق «${q}». جرّب كلمة أقصر أو بلغة أخرى.`
              : `Nothing matched “${q}”. Try a shorter word or the other language.`}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-xl px-5 py-2.5 text-sm font-semibold"
          >
            <Compass className="w-4 h-4" />
            {isAr ? "ابدأ الاستكشاف" : "Start exploring"}
          </Link>
        </div>
      )}

      {q.length >= 2 && !isFetching && !error && rows.length > 0 && (
        <div className="px-4 py-4 space-y-6">
          {ORDER.filter((type) => (grouped.get(type)?.length ?? 0) > 0).map((type) => {
            const cfg = TYPE_CONFIG[type];
            const Icon = cfg.icon;
            const list = grouped.get(type) ?? [];
            return (
              <section key={type}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-semibold text-foreground">
                    {isAr ? cfg.label.ar : cfg.label.en}
                  </h2>
                  <span className="text-xs text-muted-foreground">({list.length})</span>
                </div>
                <div className="space-y-2.5">
                  {list.map((r) => {
                    const title = (isAr ? r.title_ar : r.title_en) || r.title_en || r.title_ar || "";
                    return (
                      <Link
                        key={`${type}-${r.item_id ?? r.slug}`}
                        to={hrefFor(r)}
                        className="flex items-center gap-3 bg-card rounded-xl border border-border p-2.5"
                      >
                        <img
                          src={r.image || "/placeholder.svg"}
                          alt={title}
                          loading="lazy"
                          className="w-16 h-16 rounded-lg object-cover bg-muted shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground line-clamp-2">{title}</p>
                          {r.subtitle && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{r.subtitle}</p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default Search;
