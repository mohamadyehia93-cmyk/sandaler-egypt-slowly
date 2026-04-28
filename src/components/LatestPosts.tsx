import { Bookmark, Mic, Film, Camera, MessageSquare, ChefHat, ClipboardList, Map } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { usePosts } from "@/hooks/useListings";
import SectionHeader from "./SectionHeader";
import CityBadge from "./CityBadge";
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

// Display order + bilingual labels for the 4 themes used in the DB
const THEME_ORDER = ["Culture", "History", "Food", "Nature"] as const;
const THEME_LABEL: Record<string, { en: string; ar: string }> = {
  Culture: { en: "Culture", ar: "ثقافة" },
  History: { en: "History", ar: "تاريخ" },
  Food: { en: "Food", ar: "طعام" },
  Nature: { en: "Nature", ar: "طبيعة" },
};

const PostCard = ({ p, lang, navigate }: any) => {
  const ct = p.content_type ? contentTypeConfig[p.content_type] : null;
  const CtIcon = ct?.icon;
  const title = lang === "ar" ? p.title_ar : p.title_en;
  return (
    <div
      className="min-w-[220px] shrink-0 rounded-lg overflow-hidden shadow-card bg-card relative cursor-pointer"
      onClick={() => navigate(`/post/${p.slug || p.id}`)}
    >
      <div className="relative h-40">
        <img src={p.image || "/placeholder.svg"} alt={title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 gradient-overlay" />
        <button
          className="absolute top-2 right-2 p-1.5 rounded-full bg-background/20 backdrop-blur-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <Bookmark className="w-3.5 h-3.5 text-primary-foreground" />
        </button>
        {ct && CtIcon && (
          <span
            className={`absolute top-2 left-2 inline-flex items-center gap-1 ${ct.color} text-white text-[9px] font-semibold px-1.5 py-0.5 rounded`}
          >
            <CtIcon className="w-3 h-3" />
            {ct.label[lang]}
          </span>
        )}
        <div className="absolute bottom-2.5 left-2.5 right-2.5">
          {p.city_id && <CityBadge cityId={p.city_id} variant="overlay" />}
          <h3 className="text-xs font-bold text-primary-foreground line-clamp-2 leading-tight">
            {title}
          </h3>
        </div>
      </div>
    </div>
  );
};

const LatestPosts = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const { data: posts, isLoading } = usePosts();

  if (isLoading) {
    return (
      <SectionHeader titleKey="section.latestPosts" onSeeAll={() => navigate("/posts")}>
        <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="min-w-[220px] h-40 rounded-lg" />
          ))}
        </div>
      </SectionHeader>
    );
  }

  // Group posts by theme/category
  const grouped: Record<string, any[]> = {};
  (posts ?? []).forEach((p: any) => {
    const key = p.category && THEME_LABEL[p.category] ? p.category : "Other";
    (grouped[key] ||= []).push(p);
  });

  const themes = THEME_ORDER.filter((k) => grouped[k]?.length);

  return (
    <SectionHeader titleKey="section.latestPosts" onSeeAll={() => navigate("/posts")}>
      <div className="space-y-5">
        {themes.map((theme) => (
          <div key={theme}>
            <h3 className="px-4 mb-2 text-[13px] font-bold text-foreground">
              {THEME_LABEL[theme][lang]}
            </h3>
            <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
              {grouped[theme].slice(0, 10).map((p: any) => (
                <PostCard key={p.id} p={p} lang={lang} navigate={navigate} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </SectionHeader>
  );
};

export default LatestPosts;
