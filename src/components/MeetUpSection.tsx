import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useWhosWho } from "@/hooks/useListings";
import SectionHeader from "./SectionHeader";
import { Skeleton } from "./ui/skeleton";

const MeetUpSection = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const { data: people, isLoading } = useWhosWho();

  return (
    <SectionHeader titleKey="section.whosWho" onSeeAll={() => navigate("/people")}>
      <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="min-w-[150px] h-[180px] rounded-lg" />
            ))
          : (people ?? []).slice(0, 3).map((person: any) => (
              <div
                key={person.id}
                onClick={() => navigate(`/person/${person.slug || person.id}`)}
                className="min-w-[150px] rounded-lg shadow-card bg-card p-3 flex flex-col items-center gap-2 cursor-pointer"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/30">
                  <img
                    src={person.image || "/placeholder.svg"}
                    alt={lang === "ar" ? person.name_ar : person.name_en}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xs font-semibold text-foreground text-center line-clamp-1">
                  {lang === "ar" ? person.name_ar : person.name_en}
                </h3>
                <p className="text-[10px] text-muted-foreground text-center line-clamp-1">
                  {lang === "ar" ? person.role_ar : person.role_en}
                </p>
                <div className="flex flex-wrap justify-center gap-1">
                  {((lang === "ar" ? person.interests_ar : person.interests_en) ?? [])
                    .slice(0, 2)
                    .map((tag: string, i: number) => (
                      <span
                        key={i}
                        className="text-[9px] bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/inbox");
                  }}
                  className="mt-auto w-full flex items-center justify-center gap-1 text-[10px] font-semibold text-primary-foreground bg-primary rounded-md py-1.5"
                >
                  <MessageCircle className="w-3 h-3" />
                  {lang === "ar" ? "تواصل" : "Contact"}
                </button>
              </div>
            ))}
      </div>
    </SectionHeader>
  );
};

export default MeetUpSection;
