import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, Search, Layers } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { SEO } from "@/components/SEO";
import { fetchCollectionExperts, collectionEntries } from "@/lib/collectionExpert";

const AllCollections = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [discipline, setDiscipline] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["collections", "public"],
    queryFn: async () => {
      const { data: rows, error } = await supabase
        .from("collections")
        .select(
          "id, slug, expert_id, title_en, title_ar, abstract_en, abstract_ar, discipline, region_id, cover_image, entries, created_at"
        )
        .eq("status", "published")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const experts = await fetchCollectionExperts((rows ?? []).map((r) => r.expert_id));
      return { rows: rows ?? [], experts };
    },
  });

  const rows = data?.rows ?? [];
  const experts = data?.experts ?? {};

  const disciplines = useMemo(
    () => Array.from(new Set(rows.map((r) => r.discipline).filter(Boolean))) as string[],
    [rows]
  );

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (discipline && r.discipline !== discipline) return false;
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          (r.title_en ?? "").toLowerCase().includes(q) ||
          (r.title_ar ?? "").includes(search.trim())
        );
      }),
    [rows, search, discipline]
  );

  return (
    <div className="min-h-screen bg-surface pb-10">
      <SEO
        title={lang === "ar" ? "مجموعات المعرفة | سندال" : "Knowledge Collections | Sandal"}
        description={
          lang === "ar"
            ? "مجموعات بحثية موثّقة من خبراء محليين حول تراث مصر وبيئتها وتاريخها."
            : "Curated research dossiers from local subject experts on Egypt's heritage, ecology and history."
        }
        url="/collections"
      />
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-full hover:bg-secondary"
            aria-label={lang === "ar" ? "رجوع" : "Back"}
          >
            <ArrowLeft className="w-5 h-5 text-foreground rtl:rotate-180" />
          </button>
          <h1 className="text-lg font-bold text-foreground">
            {lang === "ar" ? "مجموعات المعرفة" : "Knowledge Collections"}
          </h1>
          <span className="text-xs text-muted-foreground ms-auto">
            {filtered.length} {lang === "ar" ? "مجموعة" : "collections"}
          </span>
        </div>

        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={lang === "ar" ? "ابحث في المجموعات..." : "Search collections..."}
              className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {disciplines.length > 0 && (
          <div className="flex gap-2 px-4 pb-3 overflow-x-auto hide-scrollbar">
            <button
              onClick={() => setDiscipline(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-colors ${
                !discipline
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-foreground border-border"
              }`}
            >
              {lang === "ar" ? "كل التخصصات" : "All Disciplines"}
            </button>
            {disciplines.map((d) => (
              <button
                key={d}
                onClick={() => setDiscipline(discipline === d ? null : d)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-colors ${
                  discipline === d
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-foreground border-border"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        )}
      </header>

      <div className="px-4 pt-4 space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <h2 className="text-sm font-bold text-foreground mb-1">
              {lang === "ar" ? "لا توجد مجموعات بعد" : "No collections yet"}
            </h2>
            <p className="text-xs text-muted-foreground px-8">
              {lang === "ar"
                ? "ينشر الخبراء المحليون هنا مجموعاتهم البحثية. تحقّق مرة أخرى قريباً."
                : "Local subject experts publish their research dossiers here. Check back soon."}
            </p>
          </div>
        ) : (
          filtered.map((c) => {
            const expert = experts[c.expert_id];
            const count = collectionEntries(c.entries).length;
            const title = (lang === "ar" ? (c.title_ar || c.title_en) : c.title_en) || c.title_en;
            const abstract = (lang === "ar" ? (c.abstract_ar || c.abstract_en) : c.abstract_en) || "";
            return (
              <button
                key={c.id}
                onClick={() => navigate(`/collection/${c.slug || c.id}`)}
                className="w-full bg-card rounded-xl shadow-card overflow-hidden flex gap-3 p-3 text-start"
              >
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-secondary shrink-0 flex items-center justify-center">
                  {c.cover_image ? (
                    <img src={c.cover_image} alt={title} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <BookOpen className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground line-clamp-2">{title}</p>
                  {abstract && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{abstract}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {c.discipline && (
                      <span className="text-[10px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                        {c.discipline}
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      {count} {lang === "ar" ? "عنصر" : count === 1 ? "entry" : "entries"}
                    </span>
                    {expert && (
                      <span className="text-[10px] text-muted-foreground truncate">
                        · {lang === "ar" ? expert.nameAr : expert.nameEn}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AllCollections;
