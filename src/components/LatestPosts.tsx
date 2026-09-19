import { Mic, Film, Camera, MessageSquare, ChefHat, ClipboardList, Map } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { usePosts } from "@/hooks/useListings";
import SectionHeader from "./SectionHeader";
import CardCarousel from "./CardCarousel";
import ContentCard from "./ContentCard";
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

  return (
    <SectionHeader id="stories" titleKey="section.latestPosts" onSeeAll={() => navigate("/posts")}>
      {isLoading ? (
        <div className="px-4">
          <Skeleton className="aspect-[3/2] w-full rounded-xl" />
        </div>
      ) : (
        <CardCarousel>
          {(posts ?? []).slice(0, 6).map((p) => (
            <ContentCard
              key={p.id}
              type="story"
              title={(lang === "ar" ? p.title_ar || p.title_en : p.title_en) || ""}
              image={p.image}
              href={`/post/${p.slug || p.id}`}
              showPrice={false}
              wishlist={{ itemType: "post", itemId: p.id, variant: "bookmark" }}
            />
          ))}
        </CardCarousel>
      )}
    </SectionHeader>
  );
};

export default LatestPosts;
