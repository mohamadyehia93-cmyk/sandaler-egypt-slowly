import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { transport } from "@/lib/sampleData";
import { transportToProvider, providerShortInfo } from "@/lib/providerMappings";
import SectionHeader from "./SectionHeader";
import CityBadge from "./CityBadge";

const TransportCards = () => {
  const { lang, t } = useI18n();
  const navigate = useNavigate();

  return (
    <SectionHeader titleKey="section.gettingAround" onSeeAll={() => {}}>
      <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
        {transport.map((tr) => (
          <div key={tr.id} className="min-w-[140px] rounded-lg shadow-card bg-card p-4 flex flex-col items-center gap-2">
            <span className="text-3xl">{tr.icon}</span>
            <h3 className="text-xs font-semibold text-foreground text-center line-clamp-2">{tr.title[lang]}</h3>
            {(() => {
              const pid = transportToProvider[tr.id];
              const provider = pid ? providerShortInfo[pid] : null;
              return provider ? (
                <button
                  onClick={() => navigate(`/provider/${pid}`)}
                  className="flex items-center gap-1 mt-0.5"
                >
                  <img src={provider.avatar} alt="" className="w-3.5 h-3.5 rounded-full object-cover" />
                  <span className="text-[9px] text-primary font-medium">{provider.name[lang]}</span>
                </button>
              ) : null;
            })()}
            <CityBadge cityId={tr.cityId} />
            <span className="text-sm font-bold text-primary-dark">{tr.price} {t("common.egp")}</span>
          </div>
        ))}
      </div>
    </SectionHeader>
  );
};

export default TransportCards;
