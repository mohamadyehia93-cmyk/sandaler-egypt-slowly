import { Bookmark } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { latestPosts } from "@/lib/sampleData";
import SectionHeader from "./SectionHeader";
import CityBadge from "./CityBadge";

const LatestPosts = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();

  return (
    <SectionHeader titleKey="section.latestPosts" onSeeAll={() => {}}>
      <div className="grid grid-cols-2 gap-3 px-4">
        {latestPosts.map((p) => (
          <div key={p.id} className="rounded-lg overflow-hidden shadow-card bg-card relative cursor-pointer" onClick={() => navigate(`/post/${p.id}`)}>
            <div className="relative h-40">
              <img src={p.image} alt={p.title[lang]} className="w-full h-full object-cover" />
              <div className="absolute inset-0 gradient-overlay" />
              <button className="absolute top-2 right-2 p-1.5 rounded-full bg-background/20 backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
                <Bookmark className="w-3.5 h-3.5 text-primary-foreground" />
              </button>
              <div className="absolute bottom-2.5 left-2.5 right-2.5">
                <span className="inline-block bg-primary text-primary-foreground text-[9px] font-semibold px-1.5 py-0.5 rounded mb-1">
                  {p.category[lang]}
                </span>
                {p.cityId && (
                  <CityBadge cityId={p.cityId} variant="overlay" />
                )}
                <h3 className="text-xs font-bold text-primary-foreground line-clamp-2 leading-tight">
                  {p.title[lang]}
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionHeader>
  );
};

export default LatestPosts;
