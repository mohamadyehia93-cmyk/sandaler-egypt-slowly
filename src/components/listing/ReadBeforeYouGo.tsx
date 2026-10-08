import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { postCategoryLabel } from "@/lib/postCategories";
import Section from "./Section";
import { fmtNumber } from "./format";

interface Props {
  cityId?: string | null;
  regionId?: string | null;
  ar: boolean;
}

const COLS = "id, slug, title_en, title_ar, image, category, read_time_minutes";

/** Up to 3 published posts for the same city (fallback: same region). Hidden when none. */
const ReadBeforeYouGo = ({ cityId, regionId, ar }: Props) => {
  const { data } = useQuery({
    queryKey: ["read-before-you-go", cityId, regionId],
    queryFn: async () => {
      if (cityId) {
        const { data } = await supabase.from("posts").select(COLS).eq("status", "published").eq("city_id", cityId)
          .order("created_at", { ascending: false }).limit(3);
        if (data && data.length) return data;
      }
      if (regionId) {
        const { data } = await supabase.from("posts").select(COLS).eq("status", "published").eq("region_id", regionId)
          .order("created_at", { ascending: false }).limit(3);
        return data ?? [];
      }
      return [];
    },
    enabled: !!(cityId || regionId),
  });

  if (!data || data.length === 0) return null;
  return (
    <Section title={ar ? "اقرأ قبل أن تذهب" : "Read before you go"} ar={ar}>
      <ul className="space-y-4">
        {data.map((p) => {
          const title = ar ? p.title_ar || p.title_en : p.title_en;
          const cat = p.category ? postCategoryLabel(p.category)[ar ? "ar" : "en"] : null;
          return (
            <li key={p.id}>
              <Link to={`/post/${p.slug || p.id}`} className="flex gap-3 items-start rounded-lg">
                {p.image ? (
                  <img src={p.image} alt="" loading="lazy" className="w-24 h-16 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-24 h-16 rounded-lg bg-muted flex-shrink-0" />
                )}
                <div className="min-w-0">
                  {cat && <p className="text-[11px] font-semibold uppercase tracking-wider text-primary-dark">{cat}</p>}
                  <p className={`listing-h2 ${ar ? "lang-ar" : "lang-en"} !text-base leading-snug text-foreground line-clamp-2`}>{title}</p>
                  {p.read_time_minutes ? (
                    <p className="text-[13px] text-muted-foreground">
                      {fmtNumber(p.read_time_minutes, ar)} {ar ? "دقائق قراءة" : "min read"}
                    </p>
                  ) : null}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </Section>
  );
};

export default ReadBeforeYouGo;
