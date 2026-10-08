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

/** Split off the first sentence (… ... . ! ? ؟ ۔) for a standfirst.
 *  If that sentence is longer than 220 characters, no standfirst is used. */
export const STANDFIRST_MAX = 220;
export const splitStandfirst = (text: string): { first: string; rest: string } => {
  const t = (text || "").trim();
  if (!t) return { first: "", rest: "" };
  const m = t.match(/^([\s\S]+?(?:\.\.\.|…|[.!?؟۔]))(\s+|$)/);
  const first = m && m[1].trim().length >= 12 ? m[1].trim() : t;
  if (first.length > STANDFIRST_MAX) return { first: "", rest: t };
  return { first, rest: m && first !== t ? t.slice(m[0].length).trim() : "" };
};
