/**
 * A Sandal guide entry is an experience row with no provider: an honest write-up
 * of a real place, not a bookable offer. No price, dates, host or booking.
 */
export const isGuideEntry = (row: { provider_id?: string | null } | null | undefined): boolean =>
  !!row && "provider_id" in row && !row.provider_id;

/** Label shown instead of a price on cards. */
export const guideLabel = (ar: boolean) => (ar ? "دليل" : "Guide");
