/**
 * WhatsApp numbers, treated loosely on purpose.
 *
 * Providers type their number the way they say it: "0100 123 4567",
 * "+20 100 123 4567", "٠١٠٠…". We never reject a number for formatting — we
 * only refuse something that clearly cannot be a phone number at all.
 */

const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/** Convert Arabic-Indic digits and strip everything that is not a digit or +. */
export function normalizeWhatsapp(input: string): string {
  const latin = input.replace(/[٠-٩]/g, (d) => String(ARABIC_DIGITS.indexOf(d)));
  const trimmed = latin.trim();
  const plus = trimmed.startsWith("+") ? "+" : "";
  return plus + trimmed.replace(/[^\d]/g, "");
}

/** Loose check: 8–15 digits is a phone number anywhere in the world. */
export function isPlausibleWhatsapp(input: string): boolean {
  const digits = normalizeWhatsapp(input).replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15;
}

/**
 * wa.me needs a full international number with no plus sign. Egyptian locals
 * type the national form (01…), so it is expanded to +20 when no country code
 * is present.
 */
export function waLink(input: string): string {
  const norm = normalizeWhatsapp(input);
  let digits = norm.replace(/\D/g, "");
  if (!norm.startsWith("+")) {
    if (digits.startsWith("00")) digits = digits.slice(2);
    else if (digits.startsWith("0")) digits = `20${digits.slice(1)}`;
  }
  return `https://wa.me/${digits}`;
}
