import { useNavigate } from "react-router-dom";
import { Check, ChevronRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useVisitorStats } from "@/hooks/useVisitorStats";

/**
 * A real checklist, not a decorative percentage: each line is a boolean read off
 * the visitor's own `profiles` row. The whole card disappears once all three are
 * filled, so a complete profile is never nagged.
 */
const ProfileCompleteness = ({ className = "" }: { className?: string }) => {
  const navigate = useNavigate();
  const { lang } = useI18n();
  const ar = lang === "ar";
  const { data: stats } = useVisitorStats();

  if (!stats) return null;

  const items = [
    {
      key: "avatar",
      done: stats.profile.hasAvatar,
      label: ar ? "أضف صورة" : "Add a photo",
      to: "/edit-profile",
    },
    {
      key: "bio",
      done: stats.profile.hasBio,
      label: ar ? "اكتب نبذة قصيرة" : "Write a short bio",
      to: "/edit-profile",
    },
    {
      key: "places",
      done: stats.profile.hasPlaces,
      label: ar ? "اختر مدنك واهتماماتك" : "Pick your cities and interests",
      to: "/edit-profile",
    },
  ];

  const missing = items.filter((i) => !i.done);
  if (missing.length === 0) return null;

  return (
    <div className={`bg-card rounded-xl shadow-card p-4 ${className}`}>
      <p className="text-sm font-semibold text-foreground">
        {ar ? "أكمل ملفك" : "Finish your profile"}
      </p>
      <p className="text-xs text-muted-foreground mt-0.5">
        {ar
          ? `${items.length - missing.length} من ${items.length} مكتمل`
          : `${items.length - missing.length} of ${items.length} done`}
      </p>
      <ul className="mt-3 space-y-1.5">
        {items.map((i) => (
          <li key={i.key}>
            {i.done ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Check className="w-3.5 h-3.5 text-primary" />
                <span className="line-through">{i.label}</span>
              </div>
            ) : (
              <button
                onClick={() => navigate(i.to)}
                className="w-full flex items-center justify-between gap-2 text-xs font-medium text-foreground py-1.5"
              >
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border border-border inline-block" />
                  {i.label}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground rtl:rotate-180" />
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProfileCompleteness;
