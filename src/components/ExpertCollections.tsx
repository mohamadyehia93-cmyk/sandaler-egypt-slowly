import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Layers } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { collectionEntries } from "@/lib/collectionExpert";

/**
 * Collections authored by one expert, for their public profile.
 * `collections.expert_id` holds the AUTH USER id, so callers pass `providers.user_id`.
 */
const ExpertCollections = ({ userId }: { userId: string | null | undefined }) => {
  const { lang } = useI18n();
  const navigate = useNavigate();

  const { data: items = [] } = useQuery({
    queryKey: ["collections", "by-expert", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collections")
        .select("id, slug, title_en, title_ar, abstract_en, abstract_ar, discipline, cover_image, entries")
        .eq("expert_id", userId!)
        .eq("status", "published")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  if (!userId || items.length === 0) return null;

  return (
    <div className="bg-card rounded-xl shadow-card p-4">
      <h3 className="text-sm font-bold text-foreground mb-3">
        {lang === "ar" ? "مجموعات المعرفة" : "Knowledge Collections"}
      </h3>
      <div className="space-y-3">
        {items.map((c) => {
          const title = (lang === "ar" ? c.title_ar : c.title_en) || c.title_en;
          const count = collectionEntries(c.entries).length;
          return (
            <button
              key={c.id}
              onClick={() => navigate(`/collection/${c.slug || c.id}`)}
              className="w-full flex items-center gap-3 text-start"
            >
              <div className="w-16 h-16 rounded-xl bg-secondary shrink-0 flex items-center justify-center overflow-hidden">
                {c.cover_image ? (
                  <img src={c.cover_image} alt={title} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <BookOpen className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground line-clamp-2">{title}</p>
                <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-2">
                  {c.discipline && <span>{c.discipline}</span>}
                  <span className="flex items-center gap-1">
                    <Layers className="w-2.5 h-2.5" />
                    {count} {lang === "ar" ? "عنصر" : count === 1 ? "entry" : "entries"}
                  </span>
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ExpertCollections;
