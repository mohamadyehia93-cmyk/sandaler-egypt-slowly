import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import SectionHeader from "./SectionHeader";
import CardCarousel from "./CardCarousel";
import ContentCard from "./ContentCard";

/**
 * Home teaser for published knowledge collections.
 * Renders nothing when no collection is published, so the home page never
 * shows an empty section.
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
        .limit(6);
      if (error) throw error;
      return data ?? [];
    },
  });

  if (items.length === 0) return null;

  return (
    <SectionHeader id="collections" titleKey="section.collections" onSeeAll={() => navigate("/collections")}>
      <CardCarousel>
        {items.map((c) => (
          <ContentCard
            key={c.id}
            type="collection"
            title={(lang === "ar" ? c.title_ar || c.title_en : c.title_en) || ""}
            image={c.cover_image}
            href={`/collection/${c.slug || c.id}`}
            showPrice={false}
          />
        ))}
      </CardCarousel>
    </SectionHeader>
  );
};

export default CollectionsSection;
