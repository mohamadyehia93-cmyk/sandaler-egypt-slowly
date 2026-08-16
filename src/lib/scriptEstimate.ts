/**
 * Spoken-duration estimates for audio-tour scripts.
 *
 * Rates used (informational guidance only, never a blocker):
 *   English: 130 words per minute
 *   Arabic:  110 words per minute
 * Arabic is slower per word because words carry more syllables on average,
 * and narrators reading Modern Standard Arabic pace themselves deliberately.
 */
export const WPM_EN = 130;
export const WPM_AR = 110;

export const countWords = (text: string): number =>
  text.trim() ? text.trim().split(/\s+/).length : 0;

/** Estimated spoken seconds for a script in the given language. */
export const estimateSeconds = (text: string, lang: "en" | "ar"): number => {
  const words = countWords(text);
  if (!words) return 0;
  return Math.round((words / (lang === "ar" ? WPM_AR : WPM_EN)) * 60);
};

export const formatDurationShort = (seconds: number, lang: string): string => {
  const s = Math.max(0, Math.round(seconds));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  if (m === 0) return lang === "ar" ? `${rem} ث` : `${rem}s`;
  return lang === "ar" ? `${m} د ${rem} ث` : `${m}m ${rem}s`;
};
