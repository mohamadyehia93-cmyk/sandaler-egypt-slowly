/**
 * Loads the Google Maps JavaScript API once for the whole app.
 * The browser key is a public, referrer-restricted connector credential, so it
 * is safe in client code. Maps JS + Places (New) are the only APIs it allows —
 * geocoding/routes must go through the connector gateway server-side.
 */
const BROWSER_KEY = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY as string | undefined;
const CHANNEL = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID as string | undefined;

let promise: Promise<typeof google.maps> | null = null;

export const hasGoogleMapsKey = () => !!BROWSER_KEY;

export function loadGoogleMaps(): Promise<typeof google.maps> {
  if (promise) return promise;
  if (!BROWSER_KEY) return Promise.reject(new Error("google-maps-key-missing"));

  promise = new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && (window as any).google?.maps?.Map) {
      resolve((window as any).google.maps);
      return;
    }
    const cbName = "__sandalInitGoogleMaps";
    (window as any)[cbName] = () => resolve((window as any).google.maps);
    const script = document.createElement("script");
    const params = new URLSearchParams({
      key: BROWSER_KEY,
      libraries: "places",
      loading: "async",
      callback: cbName,
    });
    if (CHANNEL) params.set("channel", CHANNEL);
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.async = true;
    script.onerror = () => reject(new Error("google-maps-load-failed"));
    document.head.appendChild(script);
  });
  return promise;
}
