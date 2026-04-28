import { ArrowLeft, Bookmark, Mic, Film, Camera, MessageSquare, ChefHat, ClipboardList, Map, FileText, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { latestPosts } from "@/lib/sampleData";
import { contentTypeConfig } from "@/components/LatestPosts";
import CityBadge from "@/components/CityBadge";
import { useState } from "react";

type ContentSection = {
  id: string;
  label: { en: string; ar: string };
  icon: React.ElementType;
  color: string;
  filter: (p: { contentType?: string }) => boolean;
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
  const { lang } = useI18n();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filteredPosts = latestPosts.filter((p) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return p.title.en.toLowerCase().includes(q) || p.title.ar.includes(q);
    }
    return true;
  });

  const visibleSections = activeSection
    ? sections.filter((s) => s.id === activeSection)
    : sections;

  return (
    <div className="min-h-screen bg-surface pb-8">
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-secondary">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">
            {lang === "ar" ? "جميع المنشورات" : "All Posts"}
          </h1>
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

        {/* Section Tabs */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setActiveSection(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-colors ${
              !activeSection ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border"
            }`}
          >
            {lang === "ar" ? "الكل" : "All"}
          </button>
          {sections.map((s) => {
            const count = filteredPosts.filter(s.filter).length;
            if (count === 0) return null;
            const SIcon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(activeSection === s.id ? null : s.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-colors flex items-center gap-1.5 ${
                  activeSection === s.id ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border"
                }`}
              >
                <SIcon className="w-3 h-3" />
                {s.label[lang]}
                <span className="opacity-60">({count})</span>
              </button>
            );
          })}
        </div>
      </header>

      <div className="px-4 pt-4">
        {visibleSections.map((section) => {
          const posts = filteredPosts.filter(section.filter);
          if (posts.length === 0) return null;
          const SIcon = section.icon;

          return (
            <div key={section.id} className="mb-8">
              {/* Section Header */}
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-7 h-7 rounded-lg ${section.color} flex items-center justify-center`}>
                  <SIcon className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-base font-bold text-foreground">{section.label[lang]}</h2>
                <span className="text-xs text-muted-foreground">({posts.length})</span>
              </div>

              {/* Posts Grid */}
              <div className="grid grid-cols-2 gap-3">
                {posts.map((p) => {
                  const pMeta = p as { contentType?: string };
                  const ct = pMeta.contentType ? contentTypeConfig[pMeta.contentType] : null;
                  const CtIcon = ct?.icon;
                  return (
                    <div
                      key={p.id}
                      onClick={() => navigate(`/post/${p.id}`)}
                      className="rounded-xl overflow-hidden bg-card shadow-card border border-border cursor-pointer active:scale-[0.97] transition-transform"
                    >
                      <div className="relative h-28">
                        <img src={p.image} alt={p.title[lang]} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <button
                          className="absolute top-1.5 right-1.5 p-1 rounded-full bg-background/20 backdrop-blur-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Bookmark className="w-3 h-3 text-white" />
                        </button>
                        {ct && CtIcon && (
                          <span className={`absolute top-1.5 left-1.5 inline-flex items-center gap-0.5 ${ct.color} text-white text-[8px] font-semibold px-1.5 py-0.5 rounded`}>
                            <CtIcon className="w-2.5 h-2.5" />
                            {ct.label[lang]}
                          </span>
                        )}
                        <div className="absolute bottom-1.5 left-1.5 right-1.5">
                          <span className="inline-block bg-primary text-primary-foreground text-[8px] font-semibold px-1.5 py-0.5 rounded mb-0.5">
                            {p.category[lang]}
                          </span>
                          {p.cityId && <CityBadge cityId={p.cityId} variant="overlay" />}
                        </div>
                      </div>
                      <div className="p-2.5">
                        <h3 className="text-xs font-bold text-foreground line-clamp-2 leading-tight">{p.title[lang]}</h3>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {p.author[lang]} · {p.readTime} {lang === "ar" ? "د" : "min"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
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
