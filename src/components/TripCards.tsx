import { MapPin } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { trips } from "@/lib/sampleData";
import SectionHeader from "./SectionHeader";

const TripCards = () => {
  const { lang, t } = useI18n();

  return (
    <SectionHeader titleKey="section.trips" onSeeAll={() => {}}>
      <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
        {trips.map((tr) => (
          <div key={tr.id} className="min-w-[220px] rounded-lg overflow-hidden shadow-card bg-card">
            <div className="relative h-32">
              <img src={tr.image} alt={tr.title[lang]} className="w-full h-full object-cover" />
            </div>
            <div className="p-3">
              <div className="flex items-center gap-1 text-xs text-accent mb-1">
                <MapPin className="w-3 h-3" />
                <span>{tr.route[lang]}</span>
              </div>
              <h3 className="text-sm font-semibold text-foreground line-clamp-2 mb-2">{tr.title[lang]}</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-primary-dark">{tr.price} {t("common.egp")}</span>
                <button className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                  {t("common.book")}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionHeader>
  );
};

export default TripCards;
