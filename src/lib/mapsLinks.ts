/**
 * Google Maps deep links.
 *
 * All links use the universal Maps URL API (https://developers.google.com/maps/documentation/urls),
 * which works on Android, iOS and desktop with no API call and no key.
 *
 * `origin` is deliberately omitted from navigation links: Google then uses the
 * device's current location, which is what a listener standing on the street wants.
 */

export type TravelMode = "walking" | "driving" | "bicycling" | "transit";

/** Google's URL API accepts at most 9 intermediate waypoints. */
export const MAX_WAYPOINTS = 9;

export type LatLng = { lat: number; lng: number };

export const hasCoords = (p: unknown): p is LatLng => {
  const c = p as LatLng | null | undefined;
  return !!c && Number.isFinite(Number(c.lat)) && Number.isFinite(Number(c.lng));
};

const pair = (p: LatLng) => `${Number(p.lat)},${Number(p.lng)}`;

/** A pin on the map (no navigation). */
export const placeUrl = (lat: number, lng: number) =>
  `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

/** Navigation from the user's current location to a single point. */
export const directionsToUrl = (dest: LatLng, travelmode: TravelMode = "walking") =>
  `https://www.google.com/maps/dir/?api=1&destination=${pair(dest)}&travelmode=${travelmode}`;

/**
 * The whole walk: first point as origin, last as destination, the rest as waypoints.
 * Returns null when fewer than two plottable points exist. `truncatedTo` is set when
 * the tour exceeded Google's waypoint cap and only the first N stops are included.
 */
export const routeUrl = (
  points: LatLng[],
  travelmode: TravelMode = "walking"
): { url: string; includedCount: number; truncatedTo: number | null } | null => {
  const pts = points.filter(hasCoords);
  if (pts.length < 2) return null;

  const maxTotal = MAX_WAYPOINTS + 2; // origin + 9 intermediate + destination
  const truncated = pts.length > maxTotal;
  const used = truncated ? pts.slice(0, maxTotal) : pts;

  const origin = used[0];
  const destination = used[used.length - 1];
  const waypoints = used.slice(1, -1);

  const parts = [
    "api=1",
    `origin=${pair(origin)}`,
    `destination=${pair(destination)}`,
    `travelmode=${travelmode}`,
  ];
  if (waypoints.length > 0) parts.push(`waypoints=${waypoints.map(pair).join("|")}`);

  return {
    url: `https://www.google.com/maps/dir/?${parts.join("&")}`,
    includedCount: used.length,
    truncatedTo: truncated ? used.length : null,
  };
};

