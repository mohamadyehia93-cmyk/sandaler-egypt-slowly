import { ArrowLeft, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import ProgramCauseCard from "@/components/ProgramCauseCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/lib/i18n";
import { useCauses, usePrograms, useRegions } from "@/hooks/useListings";
import { mergeProgramsCauses, type FeedKind, type ProgramCauseItem } from "@/lib/programsCauses";

type ThemeKey = "heritage" | "community" | "environment" | "education";

const THEME_META: Record<ThemeKey, { en: string; ar: string; emoji: string }> = {
  heritage: { en: "Heritage & Culture", ar: "التراث والثقافة", emoji: "🏺" },
  community: { en: "Community & Health", ar: "المجتمع والصحة", emoji: "🤝" },
  environment: { en: "Environment & Sustainability", ar: "البيئة والاستدامة", emoji: "🌱" },
  education: { en: "Education & Learning", ar: "التعليم والتعلّم", emoji: "📚" },
};

const THEME_ORDER: ThemeKey[] = ["heritage", "community", "environment", "education"];

/** Themes are derived from whatever category/type text the row carries — nothing invented. */
const classify = (item: ProgramCauseItem): ThemeKey => {
  const text = `${item.category ?? ""} ${item.title}`.toLowerCase();
  if (text.includes("heritage") || text.includes("culture")) return "heritage";
  if (text.includes("environment") || text.includes("sustain") || text.includes("climate")) return "environment";
  if (text.includes("education") || text.includes("school") || text.includes("learn") || text.includes("teen")) return "education";
  return "community";
};

const AllCauses = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [kindFilter, setKindFilter] = useState<FeedKind | "all">("all");
  const [search, setSearch] = useState("");
  const { data: causes = [], isLoading } = useCauses();
  const { data: programs = [], isLoading: loadingPrograms } = usePrograms();
  const { data: regions = [] } = useRegions();

  const all = useMemo(
    () => mergeProgramsCauses(programs as any[], causes as any[], lang),
    [programs, causes, lang]
  );

  const filtered = useMemo(
    () =>
      all.filter((item) => {
        if (kindFilter !== "all" && item.kind !== kindFilter) return false;
        if (activeRegion && item.regionId !== activeRegion) return false;
        if (!search.trim()) return true;
        return item.title.toLowerCase().includes(search.toLowerCase());
      }),
    [all, kindFilter, activeRegion, search]
  );

  const grouped = useMemo(() => {
    const g: Record<ThemeKey, ProgramCauseItem[]> = { heritage: [], community: [], environment: [], education: [] };
    filtered.forEach((item) => g[classify(item)].push(item));
    return g;
  }, [filtered]);

  const regionCounts = useMemo(() => {
    const c: Record<string, number> = {};
    all.forEach((x) => {
      if (x.regionId) c[x.regionId] = (c[x.regionId] || 0) + 1;
    });
    return c;
  }, [all]);

  const kindTabs: { key: FeedKind | "all"; label: string }[] = [
    { key: "all", label: lang === "ar" ? "الكل" : "All" },
    { key: "program", label: lang === "ar" ? "برامج" : "Programs" },
    { key: "cause", label: lang === "ar" ? "قضايا" : "Causes" },
  ];

  const loading = isLoading || loadingPrograms;

  return (
    <div className="min-h-screen bg-surface pb-8">
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-secondary">
            <ArrowLeft className="w-5 h-5 text-foreground rtl:rotate-180" />
          </button>
          <h1 className="text-lg font-bold text-foreground">
            {lang === "ar" ? "البرامج والقضايا" : "Programs & Causes"}
          </h1>
          <span className="text-xs text-muted-foreground ms-auto">
            {filtered.length} {lang === "ar" ? "عنصر" : "items"}
          </span>
        </div>

        <p className="px-4 pb-2 text-[11px] leading-relaxed text-muted-foreground">
          {lang === "ar"
            ? "البرامج مبادرات محددة المدة تديرها منظمة أو مقدّم خدمة ويمكنك الانضمام إليها. القضايا مواضيع أوسع تعرّفك بالقضية والجهات العاملة عليها."
            : "Programs are time-bound initiatives run by an organisation you can join. Causes are broader entries introducing an issue and who works on it."}
        </p>

        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={lang === "ar" ? "ابحث في البرامج والقضايا..." : "Search programs & causes..."}
              className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 pb-3">
          {kindTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setKindFilter(tab.key)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                kindFilter === tab.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-foreground border border-border"
              }`}
            >
              {tab.label}
            </button>
          ))}

          <select
            value={activeRegion ?? ""}
            onChange={(e) => setActiveRegion(e.target.value || null)}
            className="ms-auto rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground outline-none"
          >
            <option value="">{lang === "ar" ? "كل المناطق" : "All Regions"}</option>
            {(regions as any[]).map((r) => {
              if (!regionCounts[r.id]) return null;
              return (
                <option key={r.id} value={r.id}>
                  {r.emoji} {lang === "ar" ? (r.name_ar || r.name_en) : r.name_en}
                </option>
              );
            })}
          </select>
        </div>
      </header>

      <div className="pt-4">
        {loading ? (
          <div className="px-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          THEME_ORDER.map((themeKey) => {
            const items = grouped[themeKey];
            if (items.length === 0) return null;
            const meta = THEME_META[themeKey];
            return (
              <section key={themeKey} className="mb-8">
                <div className="flex items-center gap-2 px-4 mb-3">
                  <span className="text-xl">{meta.emoji}</span>
                  <h2 className="text-base font-bold text-foreground">{lang === "ar" ? meta.ar : meta.en}</h2>
                  <span className="text-xs text-muted-foreground">({items.length})</span>
                </div>
                <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
                  {items.map((item) => (
                    <ProgramCauseCard
                      key={`${item.kind}-${item.id}`}
                      item={item}
                      className="min-w-[240px] max-w-[240px] shrink-0"
                    />
                  ))}
                </div>
              </section>
            );
          })
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">{lang === "ar" ? "لا توجد نتائج" : "No results found"}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllCauses;
