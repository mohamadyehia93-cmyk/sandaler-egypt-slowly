import { Mic, Film, Camera, MessageSquare, ChefHat, ClipboardList, Map } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { postCategoryLabel } from "@/lib/postCategories";
import { fmtNumber } from "@/components/listing/format";
import { useI18n } from "@/lib/i18n";
import { usePosts } from "@/hooks/useListings";
import SectionHeader from "./SectionHeader";
import { Skeleton } from "./ui/skeleton";

const contentTypeConfig: Record<string, { icon: React.ElementType; label: { en: string; ar: string }; color: string }> = {
  podcast: { icon: Mic, label: { en: "Podcast", ar: "بودكاست" }, color: "bg-purple-500" },
  documentary: { icon: Film, label: { en: "Documentary", ar: "وثائقي" }, color: "bg-rose-500" },
  "photo-series": { icon: Camera, label: { en: "Photo Series", ar: "سلسلة صور" }, color: "bg-sky-500" },
  interview: { icon: MessageSquare, label: { en: "Interview", ar: "مقابلة" }, color: "bg-amber-500" },
  "recipe-video": { icon: ChefHat, label: { en: "Recipe Video", ar: "فيديو وصفة" }, color: "bg-emerald-500" },
  "field-report": { icon: ClipboardList, label: { en: "Field Report", ar: "تقرير ميداني" }, color: "bg-orange-500" },
  "walking-guide": { icon: Map, label: { en: "Walking Guide", ar: "دليل مشي" }, color: "bg-teal-500" },
};

export { contentTypeConfig };

const LatestPosts = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const { data: posts, isLoading } = usePosts();
  const ar = lang === "ar";
  const list = (posts ?? []).slice(0, 5);
  const [lead, ...rest] = list;
  const T = (p: any) => (ar ? p.title_ar || p.title_en : p.title_en) || "";
  const cat = (c?: string | null) => (c ? postCategoryLabel(c)[ar ? "ar" : "en"] : null);
  const rt = (m?: number | null) => (m ? (ar ? `${fmtNumber(m, ar)} دقائق قراءة` : `${m} min read`) : null);

  return (
    <SectionHeader id="stories" titleKey="section.latestPosts" onSeeAll={() => navigate("/posts")}>
      {isLoading ? (
        <div className="px-4"><Skeleton className="aspect-video w-full rounded-xl" /></div>
      ) : lead ? (
        <div className="px-4 lg:grid lg:grid-cols-[1.4fr_1fr] lg:gap-8">
          <Link to={`/post/${lead.slug || lead.id}`} className="block">
            <div className="aspect-video rounded-xl overflow-hidden bg-muted">{lead.image && <img src={lead.image} alt="" className="w-full h-full object-cover" />}</div>
            {cat(lead.category) && <p className="text-[11px] font-semibold uppercase tracking-wider text-primary-dark mt-3">{cat(lead.category)}</p>}
            <p className={`listing-title ${ar ? "lang-ar" : "lang-en"} text-foreground text-2xl mt-1`}>{T(lead)}</p>
            {(ar ? lead.excerpt_ar || lead.excerpt_en : lead.excerpt_en) && <p className="text-[15px] leading-7 text-foreground/85 mt-2 line-clamp-3">{ar ? lead.excerpt_ar || lead.excerpt_en : lead.excerpt_en}</p>}
            {rt(lead.read_time_minutes) && <p className="text-[13px] text-muted-foreground mt-1">{rt(lead.read_time_minutes)}</p>}
          </Link>
          {rest.length > 0 && (
            <ul className="space-y-4 mt-6 lg:mt-0">
              {rest.map((p) => (
                <li key={p.id}>
                  <Link to={`/post/${p.slug || p.id}`} className="flex gap-3 items-start">
                    {p.image ? <img src={p.image} alt="" loading="lazy" className="w-24 h-16 rounded-lg object-cover flex-shrink-0" /> : <div className="w-24 h-16 rounded-lg bg-muted flex-shrink-0" />}
                    <div className="min-w-0">
                      {cat(p.category) && <p className="text-[11px] font-semibold uppercase tracking-wider text-primary-dark">{cat(p.category)}</p>}
                      <p className={`listing-h2 ${ar ? "lang-ar" : "lang-en"} !text-base leading-snug text-foreground line-clamp-2`}>{T(p)}</p>
                      {rt(p.read_time_minutes) && <p className="text-[13px] text-muted-foreground">{rt(p.read_time_minutes)}</p>}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </SectionHeader>
  );
};

export default LatestPosts;
