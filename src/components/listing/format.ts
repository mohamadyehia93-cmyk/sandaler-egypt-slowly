/** Locale helpers shared by listing pages (ar-EG digits in Arabic, en-GB in English). */
export const listingLocale = (ar: boolean) => (ar ? "ar-EG" : "en-GB");

export const fmtNumber = (n: number, ar: boolean) => n.toLocaleString(listingLocale(ar));

/** "3 hours" / "2.5 hours" / "45 min" — Arabic uses Arabic digits. */
export const formatDuration = (minutes: number | null | undefined, ar: boolean): string | null => {
  if (!minutes || minutes <= 0) return null;
  if (minutes < 60) return `${fmtNumber(minutes, ar)} ${ar ? "دقيقة" : "min"}`;
  const hrs = Math.round((minutes / 60) * 10) / 10;
  const n = fmtNumber(hrs, ar);
  if (ar) return hrs === 1 ? "ساعة واحدة" : hrs === 2 ? "ساعتان" : `${n} ${hrs <= 10 && Number.isInteger(hrs) ? "ساعات" : "ساعة"}`;
  return `${n} ${hrs === 1 ? "hour" : "hours"}`;
};

/** "17:00:00" -> "5:00 pm" / "٥:٠٠ م" */
export const formatClock = (t: string, ar: boolean) => {
  const [h, m] = t.split(":").map(Number);
  const d = new Date(2000, 0, 1, h, m || 0);
  return d.toLocaleTimeString(listingLocale(ar), { hour: "numeric", minute: "2-digit", hour12: true });
};

export const formatSlotDay = (iso: string, ar: boolean, opts: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" }) =>
  new Date(iso + "T00:00:00").toLocaleDateString(listingLocale(ar), opts);

/** Split off the first sentence (. ! ? ؟ ۔) for a standfirst. */
export const splitStandfirst = (text: string): { first: string; rest: string } => {
  const t = (text || "").trim();
  const m = t.match(/^([\s\S]+?[.!?؟۔])(\s+|$)/);
  if (!m || m[1].length < 12) return { first: t, rest: "" };
  return { first: m[1].trim(), rest: t.slice(m[0].length).trim() };
};
