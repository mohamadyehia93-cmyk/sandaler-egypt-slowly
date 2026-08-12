import { useEffect, useRef, useState } from "react";
import { Languages, Loader2, Pencil, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { translateText, markMachine, markHuman, machineLabel, type Lang, type TranslationMeta } from "@/lib/translation";

type Props = {
  /** DB column names, used as provenance keys */
  fieldEn: string;
  fieldAr: string;
  labelEn: string;
  labelAr: string;
  valueEn: string;
  valueAr: string;
  onChange: (next: { en: string; ar: string }) => void;
  meta: TranslationMeta;
  onMetaChange: (meta: TranslationMeta) => void;
  /** the language the author is writing in */
  authorLang: Lang;
  /** describes the field for the translation model */
  context: string;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  placeholderEn?: string;
  placeholderAr?: string;
  inputClass?: string;
  labelClass?: string;
  icon?: React.ReactNode;
  maxLength?: number;
  /** when true, never auto-translate on blur — author must press the button (editorial prose) */
  manualOnly?: boolean;
};

const BilingualField = ({
  fieldEn, fieldAr, labelEn, labelAr, valueEn, valueAr, onChange, meta, onMetaChange,
  authorLang, context, required, multiline, rows = 4, placeholderEn, placeholderAr,
  inputClass, labelClass, icon, manualOnly, maxLength,
}: Props) => {
  const { lang } = useI18n();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const targetLang: Lang = authorLang === "en" ? "ar" : "en";
  const sourceValue = authorLang === "en" ? valueEn : valueAr;
  const targetValue = authorLang === "en" ? valueAr : valueEn;
  const targetField = authorLang === "en" ? fieldAr : fieldEn;
  const targetIsMachine = meta?.[targetField]?.source === "machine";

  const base =
    inputClass ||
    "w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";
  const lbl = labelClass || "text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5";

  /**
   * DATA-INTEGRITY GUARD.
   * runTranslation is async: without this ref it would close over the valueEn /
   * valueAr from the render that fired the blur, and writing BOTH keys back after
   * the request resolved re-applied that stale source text — silently reverting
   * keystrokes typed while the request was in flight (this is what turned
   * "Historical walking tour in Ismailia" into "Historical walking ein in Ismailia").
   * The ref always holds the latest committed values, and we only ever write the
   * TARGET key, keeping the source exactly as the author last typed it.
   */
  const latest = useRef({ en: valueEn, ar: valueAr });
  useEffect(() => {
    latest.current = { en: valueEn, ar: valueAr };
  }, [valueEn, valueAr]);

  const setSource = (v: string) => {
    const cur = latest.current;
    const next = authorLang === "en" ? { en: v, ar: cur.ar } : { en: cur.en, ar: v };
    latest.current = next;
    onChange(next);
  };
  const setTarget = (v: string) => {
    const cur = latest.current;
    const next = authorLang === "en" ? { en: cur.en, ar: v } : { en: v, ar: cur.ar };
    latest.current = next;
    onChange(next);
    onMetaChange(markHuman(meta, targetField));
  };

  const runTranslation = async () => {
    const text = sourceValue.trim();
    if (!text || busy) return;
    // Do not overwrite text a human authored or edited.
    if (targetValue.trim() && !targetIsMachine) return;
    setBusy(true);
    setFailed(null);
    const res = await translateText({ text, from: authorLang, to: targetLang, context });
    setBusy(false);
    // The author kept typing while we were waiting — that request's result no
    // longer describes the current source text, so discard it rather than write
    // a translation of an abandoned string.
    const nowSource = (authorLang === "en" ? latest.current.en : latest.current.ar).trim();
    if (nowSource !== text) return;
    if (res.ok === true) {
      const cur = latest.current;
      const next = authorLang === "en" ? { en: cur.en, ar: res.translation } : { en: res.translation, ar: cur.ar };
      latest.current = next;
      onChange(next);
      onMetaChange(markMachine(meta, targetField, authorLang));
    } else {
      // Never mirror the source into the target column.
      setFailed(res.error);
    }
  };


  const sourceLabel = authorLang === "en" ? labelEn : labelAr;
  const targetLabel = authorLang === "en" ? labelAr : labelEn;

  return (
    <div>
      <label className={lbl}>
        {icon}
        {sourceLabel}
        {required ? " *" : ""}
        <span className="ms-auto text-[10px] font-normal text-muted-foreground uppercase">{authorLang}</span>
      </label>

      {multiline ? (
        <textarea
          className={base}
          rows={rows}
          maxLength={maxLength}
          dir={authorLang === "ar" ? "rtl" : "ltr"}
          value={sourceValue}
          placeholder={authorLang === "ar" ? placeholderAr : placeholderEn}
          onChange={(e) => setSource(e.target.value)}
          onBlur={() => { if (!manualOnly) runTranslation(); }}
        />
      ) : (
        <input
          className={base}
          maxLength={maxLength}
          dir={authorLang === "ar" ? "rtl" : "ltr"}
          value={sourceValue}
          placeholder={authorLang === "ar" ? placeholderAr : placeholderEn}
          onChange={(e) => setSource(e.target.value)}
          onBlur={() => { if (!manualOnly) runTranslation(); }}
        />
      )}

      {/* translated side */}
      <div className="mt-1.5 rounded-xl border border-dashed border-border bg-surface/60 px-3 py-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Languages className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="text-[11px] font-semibold text-muted-foreground">
            {targetLabel} <span className="uppercase">({targetLang})</span>
          </span>
          {targetIsMachine && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
              {machineLabel("en")} · {machineLabel("ar")}
            </span>
          )}
          <button
            type="button"
            onClick={() => (targetValue.trim() ? setExpanded((v) => !v) : runTranslation())}
            className="ms-auto text-[11px] font-semibold text-primary flex items-center gap-1"
          >
            {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : targetValue.trim() ? <Pencil className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
            {busy
              ? lang === "ar" ? "جارٍ الترجمة…" : "Translating…"
              : targetValue.trim()
                ? (expanded ? (lang === "ar" ? "إخفاء" : "Hide") : (lang === "ar" ? "تعديل" : "Edit"))
                : (lang === "ar" ? "ترجم" : "Translate")}
          </button>
        </div>

        {targetValue.trim() && !expanded && (
          <p dir={targetLang === "ar" ? "rtl" : "ltr"} className="mt-1 text-xs text-muted-foreground line-clamp-2">
            {targetValue}
          </p>
        )}

        {expanded && (
          multiline ? (
            <textarea
              className={`${base} mt-2`}
              rows={rows}
              maxLength={maxLength}
              dir={targetLang === "ar" ? "rtl" : "ltr"}
              value={targetValue}
              onChange={(e) => setTarget(e.target.value)}
            />
          ) : (
            <input
              className={`${base} mt-2`}
              maxLength={maxLength}
              dir={targetLang === "ar" ? "rtl" : "ltr"}
              value={targetValue}
              onChange={(e) => setTarget(e.target.value)}
            />
          )
        )}

        {failed && (
          <p className="mt-1 text-[11px] text-amber-700">
            {lang === "ar"
              ? "تعذّرت الترجمة الآلية — يمكنك الحفظ الآن وكتابة النص الآخر لاحقًا."
              : "Machine translation failed — you can still save and write the other language later."}
          </p>
        )}
      </div>
    </div>
  );
};

export default BilingualField;
