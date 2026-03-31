import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { whosWho } from "@/lib/sampleData";
import SectionHeader from "./SectionHeader";

const MeetUpSection = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();

  return (
    <SectionHeader titleKey="section.whosWho" onSeeAll={() => {}}>
      <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
        {whosWho.slice(0, 6).map((person) => (
          <div
            key={person.id}
            onClick={() => navigate(`/person/${person.id}`)}
            className="min-w-[150px] rounded-lg shadow-card bg-card p-3 flex flex-col items-center gap-2 cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/30">
              <img src={person.image} alt={person.name[lang]} className="w-full h-full object-cover" />
            </div>
            <h3 className="text-xs font-semibold text-foreground text-center line-clamp-1">{person.name[lang]}</h3>
            <p className="text-[10px] text-muted-foreground text-center line-clamp-1">{person.role[lang]}</p>
            <div className="flex flex-wrap justify-center gap-1">
              {person.interests[lang].slice(0, 2).map((tag, i) => (
                <span key={i} className="text-[9px] bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); navigate("/inbox"); }}
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
