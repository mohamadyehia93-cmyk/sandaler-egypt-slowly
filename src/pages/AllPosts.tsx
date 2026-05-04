import { ArrowLeft, Bookmark, Mic, Film, Camera, MessageSquare, ChefHat, ClipboardList, Map, FileText, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { latestPosts, regions } from "@/lib/sampleData";
import { contentTypeConfig } from "@/components/LatestPosts";
import CityBadge from "@/components/CityBadge";
import { useState, useMemo } from "react";

type ContentSection = {
  id: string;
  label: { en: string; ar: string };
  icon: React.ElementType;
  color: string;
  filter: (p: any) => boolean;
};

const sections: ContentSection[] = [
  { id: "articles", label: { en: "Articles", ar: "مقالات" }, icon: FileText, color: "bg-primary", filter: (p) => !p.contentType },
  { id: "podcast", label: { en: "Podcasts", ar: "بودكاست" }, icon: Mic, color: "bg-purple-500", filter: (p) => p.contentType === "podcast" },
  { id: "documentary", label: { en: "Documentaries", ar: "وثائقيات" }, icon: Film, color: "bg-rose-500", filter: (p) => p.contentType === "documentary" },
  { id: "photo-series", label: { en: "Photo Series", ar: "سلسلة صور" }, icon: Camera, color: "bg-sky-500", filter: (p) => p.contentType === "photo-series" },
  { id: "interview", label: { en: "Interviews", ar: "مقابلات" }, icon: MessageSquare, color: "bg-amber-500", filter: (p) => p.contentType === "interview" },
  { id: "recipe-video", label: { en: "Recipe Videos", ar: "فيديوهات وصفات" }, icon: ChefHat, color: "bg-emerald-500", filter: (p) => p.contentType === "recipe-video" },
  { id: "field-report", label: { en: "Field Reports", ar: "تقارير ميدانية" }, icon: ClipboardList, color: "bg-orange-500", filter: (p) => p.contentType === "field-report" },
  { id: "walking-guide", label: { en: "Walking Guides", ar: "أدلة مشي" }, icon: Map, color: "bg-teal-500", filter: (p) => p.contentType === "walking-guide" },
];

const AllPosts = () => {
  const { lang, t } = useI18n();
  const navigate = useNavigate();
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [activeTheme, setActiveTheme] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const themes = useMemo(() => {
    const seen: Record<string, { en: string; ar: string }> = {};
    latestPosts.forEach((p: any) => {
      if (p.category?.en && !seen[p.category.en]) seen[p.category.en] = p.category;
    });
    return Object.values(seen);
  }, []);

  const filteredPosts = useMemo(
    () =>
      latestPosts.filter((p: any) => {
        if (activeRegion && p.regionId !== activeRegion) return false;
        if (activeTheme && p.category?.en !== activeTheme) return false;
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return p.title.en.toLowerCase().includes(q) || p.title.ar.includes(q);
      }),
    [search, activeRegion, activeTheme]
  );

  const regionCounts = useMemo(() => {
    const c: Record<string, number> = {};
    latestPosts.forEach((p: any) => {
      if (p.regionId) c[p.regionId] = (c[p.regionId] || 0) + 1;
    });
    return c;
  }, []);

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

        {/* Region filter dropdown */}
        <div className="px-4 pb-3 flex gap-2">
          <select
            value={activeRegion ?? ""}
            onChange={(e) => setActiveRegion(e.target.value || null)}
            className="w-auto px-4 py-2 rounded-full bg-primary text-primary-foreground border border-primary text-xs font-semibold outline-none cursor-pointer appearance-none bg-no-repeat bg-[right_0.75rem_center] pe-8"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
            }}
          >
            <option value="" className="bg-card text-foreground">
              {lang === "ar" ? "كل المناطق" : "All Regions"}
            </option>
            {regions.map((r) => {
              const count = regionCounts[r.id] || 0;
              if (count === 0) return null;
              return (
                <option key={r.id} value={r.id} className="bg-card text-foreground">
                  {r.emoji} {t(r.nameKey)}
                </option>
              );
            })}
          </select>

          <select
            value={activeTheme ?? ""}
            onChange={(e) => setActiveTheme(e.target.value || null)}
            className="w-auto px-4 py-2 rounded-full bg-card text-foreground border border-border text-xs font-semibold outline-none cursor-pointer appearance-none bg-no-repeat bg-[right_0.75rem_center] pe-8"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='hsl(var(--foreground))' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
            }}
          >
            <option value="">
              {lang === "ar" ? "كل المواضيع" : "All Themes"}
            </option>
            {themes.map((th) => (
              <option key={th.en} value={th.en}>
                {th[lang]}
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="pt-4">
        {sections.map((section) => {
          const posts = filteredPosts.filter(section.filter);
          if (posts.length === 0) return null;
          const SIcon = section.icon;

          return (
            <section key={section.id} className="mb-8">
              <div className="flex items-end justify-between px-4 mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg ${section.color} flex items-center justify-center`}>
                    <SIcon className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-base font-bold text-foreground">{section.label[lang]}</h2>
                  <span className="text-xs text-muted-foreground">({posts.length})</span>
                </div>
              </div>

              <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
                {posts.map((p: any) => {
                  const ct = p.contentType ? contentTypeConfig[p.contentType] : null;
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
        })}

        {filteredPosts.length === 0 && (
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
