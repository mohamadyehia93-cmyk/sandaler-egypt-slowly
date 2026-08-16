import { useEffect, useState } from "react";
import { Timer, Type } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { countWords, estimateSeconds, formatDurationShort, WPM_AR, WPM_EN } from "@/lib/scriptEstimate";

interface ScriptMeterProps {
  /** Script text in the language being measured. */
  text: string;
  scriptLang: "en" | "ar";
  /** Newly picked clip — its real duration wins over the estimate. */
  audioFile?: File | null;
  /** Already-uploaded clip URL (edit mode) — read metadata only. */
  audioUrl?: string | null;
}

/**
 * Informational word count + estimated spoken duration for one stop script.
 * When a clip is attached we show its ACTUAL duration instead of the estimate.
 */
const ScriptMeter = ({ text, scriptLang, audioFile, audioUrl }: ScriptMeterProps) => {
  const { lang } = useI18n();
  const [actual, setActual] = useState<number | null>(null);

  useEffect(() => {
    const src = audioFile ? URL.createObjectURL(audioFile) : audioUrl || null;
    if (!src) { setActual(null); return; }
    const el = new Audio();
    el.preload = "metadata";
    const onLoaded = () => {
      if (Number.isFinite(el.duration) && el.duration > 0) setActual(el.duration);
    };
    el.addEventListener("loadedmetadata", onLoaded);
    el.src = src;
    return () => {
      el.removeEventListener("loadedmetadata", onLoaded);
      el.src = "";
      if (audioFile) URL.revokeObjectURL(src);
    };
  }, [audioFile, audioUrl]);

  const words = countWords(text);
  const est = estimateSeconds(text, scriptLang);
  const wpm = scriptLang === "ar" ? WPM_AR : WPM_EN;

  if (!words && actual == null) return null;

  return (
    <p className="text-[10px] text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-0.5">
      <span className="flex items-center gap-1">
        <Type className="w-2.5 h-2.5" />
        {words} {lang === "ar" ? "كلمة" : words === 1 ? "word" : "words"}
      </span>
      <span className="flex items-center gap-1">
        <Timer className="w-2.5 h-2.5" />
        {actual != null
          ? `${lang === "ar" ? "المدة الفعلية" : "actual"} ${formatDurationShort(actual, lang)}`
          : `${lang === "ar" ? "تقديري" : "approx."} ${formatDurationShort(est, lang)} (${wpm} ${lang === "ar" ? "كلمة/دقيقة" : "wpm"})`}
      </span>
    </p>
  );
};

export default ScriptMeter;
