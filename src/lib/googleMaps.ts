/**
 * Loads the Google Maps JavaScript API once for the whole app.
 * The browser key is a public, referrer-restricted connector credential, so it
 * is safe in client code. Maps JS + Places (New) are the only APIs it allows —
 * geocoding/routes must go through the connector gateway server-side.
 */
const BROWSER_KEY = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY as string | undefined;
const CHANNEL = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID as string | undefined;

let promise: Promise<typeof google.maps> | null = null;

/** Google calls window.gm_authFailure when the key is rejected for this domain. */
let authFailed = false;
const authListeners = new Set<() => void>();

export const hasGoogleMapsAuthFailed = () => authFailed;

/** Subscribe to key/domain rejection; returns an unsubscribe function. */
export function onGoogleMapsAuthFailure(cb: () => void) {
  if (authFailed) cb();
  authListeners.add(cb);
  return () => authListeners.delete(cb);
}

export const hasGoogleMapsKey = () => !!BROWSER_KEY;

/** Env var Vite inlines at build time; named in warnings so misconfig is obvious. */
export const GOOGLE_MAPS_KEY_ENV_VAR = "VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY";

let warned = false;
function warnMissingKey() {
  if (warned) return;
  warned = true;
  console.warn(
    `[googleMaps] Maps disabled: ${GOOGLE_MAPS_KEY_ENV_VAR} was not present when this bundle was built. ` +
      "Vite inlines VITE_* values at build time, so the app must be rebuilt after the Google Maps connector is linked."
  );
}

export function loadGoogleMaps(): Promise<typeof google.maps> {
  if (promise) return promise;
  if (!BROWSER_KEY) {
    warnMissingKey();
    return Promise.reject(new Error("google-maps-key-missing"));
  }


  promise = new Promise((resolve, reject) => {
    const w = window as Window & {
      google?: { maps?: typeof google.maps };
      __sandalInitGoogleMaps?: () => void;
      gm_authFailure?: () => void;
    };
    w.gm_authFailure = () => {
      authFailed = true;
      authListeners.forEach((cb) => cb());
    };
    if (w.google?.maps?.Map) {
      resolve(w.google.maps);
      return;
    }
    const cbName = "__sandalInitGoogleMaps";
    w.__sandalInitGoogleMaps = () => resolve(w.google!.maps!);

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
