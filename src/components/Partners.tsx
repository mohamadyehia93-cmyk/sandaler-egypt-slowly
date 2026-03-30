import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { partnersData } from "@/lib/sampleData";
import SectionHeader from "./SectionHeader";

const Partners = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();

  return (
    <SectionHeader titleKey="section.partners" onSeeAll={() => {}}>
      <div className="grid grid-cols-3 gap-3 px-4">
        {partnersData.map((p) => (
          <div
            key={p.id}
            onClick={() => navigate(`/partner/${p.id}`)}
            className="bg-card rounded-xl p-3 shadow-card border border-border flex flex-col items-center text-center gap-1.5 cursor-pointer"
          >
            <span className="text-3xl">{p.logo}</span>
            <h3 className="text-[11px] font-semibold text-foreground leading-tight line-clamp-2">{p.name[lang]}</h3>
            <span className="text-[9px] text-muted-foreground">{p.type[lang]}</span>
          </div>
        ))}
      </div>
    </SectionHeader>
  );
};

export default Partners;
