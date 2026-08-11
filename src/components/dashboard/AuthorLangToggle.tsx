import { useI18n } from "@/lib/i18n";
import type { Lang } from "@/lib/translation";

/** Per-form toggle: which language is the author writing in? */
const AuthorLangToggle = ({
  value,
  onChange,
}: {
  value: Lang;
  onChange: (l: Lang) => void;
}) => {
  const { lang } = useI18n();
  const opts: { id: Lang; label: string }[] = [
    { id: "en", label: "English" },
    { id: "ar", label: "العربية" },
  ];
  return (
    <div className="rounded-xl bg-surface border border-border px-3 py-2.5">
      <p className="text-[11px] font-semibold text-muted-foreground mb-1.5">
        {lang === "ar" ? "أكتب بلغة" : "I'm writing in"}
      </p>
      <div className="flex gap-2">
        {opts.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
              value === o.id
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground border border-border"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
      <p className="mt-1.5 text-[10px] text-muted-foreground leading-snug">
        {lang === "ar"
          ? "سنملأ اللغة الأخرى بترجمة آلية موسومة — يمكنك تعديلها."
          : "We'll fill the other language with a labelled machine translation — you can edit it."}
      </p>
    </div>
  );
};

export default AuthorLangToggle;
