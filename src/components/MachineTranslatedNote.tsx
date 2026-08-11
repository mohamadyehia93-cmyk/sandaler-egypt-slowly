import { Languages } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { isMachine } from "@/lib/translation";

/**
 * Discreet note shown to visitors when the text they are reading in their
 * current language was machine-filled rather than authored by a human.
 */
const MachineTranslatedNote = ({
  meta,
  field,
  className = "",
}: {
  meta: unknown;
  field: string | string[];
  className?: string;
}) => {
  const { lang } = useI18n();
  const fields = Array.isArray(field) ? field : [field];
  if (!fields.some((f) => isMachine(meta, f))) return null;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] text-muted-foreground/80 ${className}`}>
      <Languages className="w-3 h-3" />
      {lang === "ar" ? "ترجمة آلية" : "Machine translated"}
    </span>
  );
};

export default MachineTranslatedNote;
