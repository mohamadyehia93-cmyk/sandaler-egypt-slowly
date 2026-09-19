import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useAudioTours } from "@/hooks/useListings";
import SectionHeader from "./SectionHeader";
import CardCarousel from "./CardCarousel";
import ContentCard from "./ContentCard";
import { Skeleton } from "./ui/skeleton";

const AudioTourCards = () => {
  const { lang, t } = useI18n();
  const navigate = useNavigate();
  const { data: audioTours, isLoading } = useAudioTours();

  return (
    <SectionHeader id="audio-tours" titleKey="section.audioTours" onSeeAll={() => navigate("/audio-tours")}>
      {isLoading ? (
        <div className="px-4">
          <Skeleton className="aspect-[3/2] w-full rounded-xl" />
        </div>
      ) : (
        <CardCarousel>
          {(audioTours ?? []).slice(0, 6).map((a) => (
            <ContentCard
              key={a.id}
              type="audio-tour"
              title={(lang === "ar" ? a.title_ar || a.title_en : a.title_en) || ""}
              image={a.image}
              href={`/audio-tour/${a.slug || a.id}`}
              price={a.price}
              note={`${a.duration_minutes} ${t("common.min")} · ${a.stops_count} ${t("common.stops")}`}
            />
          ))}
        </CardCarousel>
      )}
    </SectionHeader>
  );
};

export default AudioTourCards;
