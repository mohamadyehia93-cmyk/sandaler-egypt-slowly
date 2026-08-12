import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Layers } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import SectionHeader from "./SectionHeader";
import { collectionEntries } from "@/lib/collectionExpert";

/**
 * Home teaser for published knowledge collections.
 * Renders nothing while loading or when no collection is published, so the home
 * page never shows an empty section.
 */
const CollectionsSection = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();

  const { data: items = [] } = useQuery({
    queryKey: ["collections", "home"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collections")
        .select("id, slug, title_en, title_ar, discipline, cover_image, entries")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data ?? [];
    },
  });

  if (items.length === 0) return null;

  return (
    <SectionHeader titleKey="section.collections" onSeeAll={() => navigate("/collections")}>
      <div className="grid grid-cols-3 gap-3 px-4">
        {items.map((c) => {
          const title = (lang === "ar" ? (c.title_ar || c.title_en) : c.title_en) || c.title_en;
          const count = collectionEntries(c.entries).length;
          return (
            <button
              key={c.id}
              onClick={() => navigate(`/collection/${c.slug || c.id}`)}
              className="rounded-lg shadow-card bg-card overflow-hidden text-start"
            >
              <div className="h-20 bg-secondary flex items-center justify-center">
                {c.cover_image ? (
                  <img src={c.cover_image} alt={title} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <BookOpen className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div className="p-2">
                <h3 className="text-[11px] font-semibold text-foreground line-clamp-2">{title}</h3>
                <p className="text-[9px] text-muted-foreground mt-1 flex items-center gap-1">
                  <Layers className="w-2.5 h-2.5" />
                  {count} {lang === "ar" ? "عنصر" : count === 1 ? "entry" : "entries"}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </SectionHeader>
  );
};

export default CollectionsSection;
