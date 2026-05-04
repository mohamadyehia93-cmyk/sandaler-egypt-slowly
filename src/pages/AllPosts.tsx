import { ArrowLeft, Bookmark, Mic, Film, Camera, MessageSquare, ChefHat, ClipboardList, Map, FileText, Search, SlidersHorizontal, X as XIcon, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { usePosts, useRegions } from "@/hooks/useListings";
import { contentTypeConfig } from "@/components/LatestPosts";
import CityBadge from "@/components/CityBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

type ContentSection = {
  id: string;
  label: { en: string; ar: string };
  icon: React.ElementType;
  color: string;
  filter: (p: any) => boolean;
};

const sections: ContentSection[] = [
  { id: "articles", label: { en: "Articles", ar: "مقالات" }, icon: FileText, color: "bg-primary", filter: (p) => !p.contentType || p.contentType === "article" },
  { id: "podcast", label: { en: "Podcasts", ar: "بودكاست" }, icon: Mic, color: "bg-purple-500", filter: (p) => p.contentType === "podcast" },
  { id: "documentary", label: { en: "Documentaries", ar: "وثائقيات" }, icon: Film, color: "bg-rose-500", filter: (p) => p.contentType === "documentary" },
  { id: "photo-series", label: { en: "Photo Series", ar: "سلسلة صور" }, icon: Camera, color: "bg-sky-500", filter: (p) => p.contentType === "photo-series" },
  { id: "interview", label: { en: "Interviews", ar: "مقابلات" }, icon: MessageSquare, color: "bg-amber-500", filter: (p) => p.contentType === "interview" },
  { id: "recipe-video", label: { en: "Recipe Videos", ar: "فيديوهات وصفات" }, icon: ChefHat, color: "bg-emerald-500", filter: (p) => p.contentType === "recipe-video" },
  { id: "field-report", label: { en: "Field Reports", ar: "تقارير ميدانية" }, icon: ClipboardList, color: "bg-orange-500", filter: (p) => p.contentType === "field-report" },
  { id: "walking-guide", label: { en: "Walking Guides", ar: "أدلة مشي" }, icon: Map, color: "bg-teal-500", filter: (p) => p.contentType === "walking-guide" },
];

const AllPosts = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [activeTheme, setActiveTheme] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const { data: dbPosts = [], isLoading } = usePosts();
  const { data: regions = [] } = useRegions();

  // Normalize DB posts into the shape this page expects
  const posts = useMemo(
    () =>
      (dbPosts as any[]).map((p) => ({
        id: p.slug || p.id,
        title: { en: p.title_en, ar: p.title_ar },
        image: p.image,
        regionId: p.region_id,
        cityId: p.city_id,
        category: { en: p.category ?? "General", ar: p.category ?? "عام" },
        author: { en: p.author_name_en ?? "", ar: p.author_name_ar ?? "" },
        readTime: p.read_time_minutes ?? 5,
        contentType: (p as any).content_type ?? null,
      })),
    [dbPosts]
  );

  const themes = useMemo(() => {
    const seen: Record<string, { en: string; ar: string }> = {};
    posts.forEach((p) => {
      if (p.category?.en && !seen[p.category.en]) seen[p.category.en] = p.category;
    });
    return Object.values(seen);
  }, [posts]);

  const filteredPosts = useMemo(
    () =>
      posts.filter((p) => {
        if (activeRegion && p.regionId !== activeRegion) return false;
        if (activeTheme && p.category?.en !== activeTheme) return false;
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (p.title.en ?? "").toLowerCase().includes(q) || (p.title.ar ?? "").includes(q);
      }),
    [search, activeRegion, activeTheme, posts]
  );

  const regionCounts = useMemo(() => {
    const c: Record<string, number> = {};
    posts.forEach((p) => {
      if (p.regionId) c[p.regionId] = (c[p.regionId] || 0) + 1;
    });
    return c;
  }, [posts]);

  return (
    <div className="min-h-screen bg-surface pb-8">
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-secondary">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">
            {lang === "ar" ? "المنشورات" : "Posts"}
          </h1>
          <span className="text-xs text-muted-foreground ms-auto">
            {filteredPosts.length} {lang === "ar" ? "منشور" : "posts"}
          </span>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={lang === "ar" ? "ابحث في المنشورات..." : "Search posts..."}
              className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 pb-3 flex items-center gap-2 flex-wrap">
          <Sheet>
            <SheetTrigger asChild>
              <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                {lang === "ar" ? "تصفية" : "Filters"}
                {(activeRegion || activeTheme) && (
                  <span className="ms-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary-foreground text-primary text-[10px] font-bold">
                    {(activeRegion ? 1 : 0) + (activeTheme ? 1 : 0)}
                  </span>
                )}
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="text-start">
                  {lang === "ar" ? "تصفية المنشورات" : "Filter Posts"}
                </SheetTitle>
              </SheetHeader>

              <div className="mt-4 space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase mb-2">
                    {lang === "ar" ? "المنطقة" : "Region"}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setActiveRegion(null)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                        !activeRegion ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border"
                      }`}
                    >
                      {lang === "ar" ? "الكل" : "All"}
                    </button>
                    {(regions as any[]).map((r) => {
                      const count = regionCounts[r.id] || 0;
                      if (count === 0) return null;
                      const active = activeRegion === r.id;
                      return (
                        <button
                          key={r.id}
                          onClick={() => setActiveRegion(r.id)}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                            active ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border"
                          }`}
                        >
                          <span>{r.emoji}</span>
                          <span>{lang === "ar" ? r.name_ar : r.name_en}</span>
                          {active && <Check className="w-3 h-3" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase mb-2">
                    {lang === "ar" ? "الموضوع" : "Theme"}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setActiveTheme(null)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                        !activeTheme ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border"
                      }`}
                    >
                      {lang === "ar" ? "الكل" : "All"}
                    </button>
                    {themes.map((th) => {
                      const active = activeTheme === th.en;
                      return (
                        <button
                          key={th.en}
                          onClick={() => setActiveTheme(th.en)}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                            active ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border"
                          }`}
                        >
                          <span>{th[lang]}</span>
                          {active && <Check className="w-3 h-3" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <SheetFooter className="mt-6 flex-row gap-2 sm:flex-row">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setActiveRegion(null);
                    setActiveTheme(null);
                  }}
                >
                  {lang === "ar" ? "مسح الكل" : "Clear all"}
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          {activeRegion && (
            <button
              onClick={() => setActiveRegion(null)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-secondary text-foreground text-xs font-semibold"
            >
              {(() => {
                const r = (regions as any[]).find((x) => x.id === activeRegion);
                return r ? `${r.emoji} ${lang === "ar" ? r.name_ar : r.name_en}` : "";
              })()}
              <XIcon className="w-3 h-3" />
            </button>
          )}
          {activeTheme && (
            <button
              onClick={() => setActiveTheme(null)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-secondary text-foreground text-xs font-semibold"
            >
              {themes.find((th) => th.en === activeTheme)?.[lang]}
              <XIcon className="w-3 h-3" />
            </button>
          )}
        </div>
      </header>

      <div className="pt-4">
        {isLoading ? (
          <div className="px-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          sections.map((section) => {
            const sPosts = filteredPosts.filter(section.filter);
            if (sPosts.length === 0) return null;
            const SIcon = section.icon;

            return (
              <section key={section.id} className="mb-8">
                <div className="flex items-end justify-between px-4 mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg ${section.color} flex items-center justify-center`}>
                      <SIcon className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-base font-bold text-foreground">{section.label[lang]}</h2>
                    <span className="text-xs text-muted-foreground">({sPosts.length})</span>
                  </div>
                </div>

                <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
                  {sPosts.map((p: any) => {
                    const ct = p.contentType ? contentTypeConfig[p.contentType as keyof typeof contentTypeConfig] : null;
                    const CtIcon = ct?.icon;
                    return (
                      <div
                        key={p.id}
                        onClick={() => navigate(`/post/${p.id}`)}
                        className="min-w-[240px] shrink-0 rounded-lg overflow-hidden shadow-card bg-card cursor-pointer active:scale-[0.98] transition-transform"
                      >
                        <div className="relative h-32">
                          <img src={p.image} alt={p.title[lang]} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <button
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-background/30 backdrop-blur-sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Bookmark className="w-3.5 h-3.5 text-white" />
                          </button>
                          {ct && CtIcon && (
                            <span className={`absolute top-2 left-2 inline-flex items-center gap-0.5 ${ct.color} text-white text-[10px] font-semibold px-1.5 py-0.5 rounded`}>
                              <CtIcon className="w-3 h-3" />
                              {ct.label[lang]}
                            </span>
                          )}
                          <div className="absolute bottom-2 left-2 right-2">
                            <span className="inline-block bg-primary text-primary-foreground text-[10px] font-semibold px-1.5 py-0.5 rounded mb-0.5">
                              {p.category[lang]}
                            </span>
                            {p.cityId && <CityBadge cityId={p.cityId} variant="overlay" />}
                          </div>
                        </div>
                        <div className="p-3">
                          <h3 className="text-sm font-bold text-foreground line-clamp-2 leading-tight">
                            {p.title[lang]}
                          </h3>
                          <p className="text-[11px] text-muted-foreground mt-1">
                            {p.author[lang]} · {p.readTime} {lang === "ar" ? "د" : "min"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })
        )}

        {!isLoading && filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {lang === "ar" ? "لا توجد نتائج" : "No posts found"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllPosts;
