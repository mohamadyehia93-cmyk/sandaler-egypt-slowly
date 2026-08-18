import { CalendarDays, Target, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CityBadge from "@/components/CityBadge";
import WishlistButton from "@/components/WishlistButton";
import { useI18n } from "@/lib/i18n";
import { kindLabel, type ProgramCauseItem } from "@/lib/programsCauses";

type Props = { item: ProgramCauseItem; className?: string };

/** One card for either a program or a cause — the chip states which it is. */
const ProgramCauseCard = ({ item, className }: Props) => {
  const navigate = useNavigate();
  const { lang } = useI18n();

  return (
    <div
      onClick={() => navigate(item.href)}
      className={`overflow-hidden rounded-lg bg-card shadow-card cursor-pointer active:scale-[0.98] transition-transform ${className || ""}`}
    >
      <div className="relative h-32 bg-secondary">
        {item.image ? (
          <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
        ) : (
          <Target className="absolute inset-0 m-auto h-8 w-8 text-muted-foreground" />
        )}
        <span
          className={`absolute top-2 start-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            item.kind === "program"
              ? "bg-primary/90 text-primary-foreground"
              : "bg-background/90 text-foreground"
          }`}
        >
          {kindLabel(item.kind, lang)}
        </span>
        {item.kind === "cause" && (
          <WishlistButton
            itemType="cause"
            itemId={item.id}
            className="absolute top-2 end-2 rounded-full bg-background/80 p-1.5 backdrop-blur-sm"
          />
        )}
      </div>
      <div className="p-3">
        <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-foreground">{item.title}</h3>
        {item.cityId && (
          <div className="mb-1">
            <CityBadge cityId={item.cityId} />
          </div>
        )}
        {item.subtitle && (
          <p className="mb-2 line-clamp-2 text-[11px] text-muted-foreground">{item.subtitle}</p>
        )}
        <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
          {item.category && <span className="font-medium">{item.category}</span>}
          {item.orgName && (
            <span className="flex items-center gap-1 truncate font-medium">
              {item.orgLogo && <span>{item.orgLogo}</span>}
              {item.orgName}
            </span>
          )}
          {item.startDate && (
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              {item.startDate}
            </span>
          )}
          {item.volunteersNeeded != null && (
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {item.volunteersNeeded}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgramCauseCard;
