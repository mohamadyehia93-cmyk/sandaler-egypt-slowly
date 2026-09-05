import { useI18n } from "@/lib/i18n";
import { FileClock } from "lucide-react";

interface Props {
  savedAtLabel?: string;
  onResume: () => void;
  onStartOver: () => void;
  accentClass?: string;
}

/** Bilingual "you have an unfinished draft" question. Never auto-decides. */
const DraftResumePrompt = ({ onResume, onStartOver, accentClass = "bg-primary" }: Props) => {
  const { lang } = useI18n();
  const ar = lang === "ar";
  return (
    <div className="mx-4 my-4 rounded-xl border border-border bg-card p-4">
      <div className="flex items-start gap-2 mb-3">
        <FileClock className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
        <p className="text-sm font-semibold text-foreground">
          {ar ? "لديك مسودة غير مكتملة — استكمال أو البدء من جديد؟" : "You have an unfinished draft — resume or start over?"}
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onResume}
          className={`flex-1 py-3 rounded-xl text-sm font-bold text-white ${accentClass}`}
        >
          {ar ? "استكمال" : "Resume"}
        </button>
        <button
          onClick={onStartOver}
          className="flex-1 py-3 rounded-xl text-sm font-medium border border-border text-foreground"
        >
          {ar ? "البدء من جديد" : "Start over"}
        </button>
      </div>
    </div>
  );
};

export default DraftResumePrompt;
