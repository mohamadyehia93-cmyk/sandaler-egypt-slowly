import { useEffect, useState } from "react";

type Coords = { lat: number; lng: number; accuracy?: number };

export type UserLocationState = {
  coords: Coords | null;
  error: string | null;
  loading: boolean;
  permission: "granted" | "denied" | "prompt" | "unknown";
};

/**
 * Watches the user's geolocation in real-time. Used by audio tours so that the
 * active stop and distances follow the user as they walk.
 */
export const useUserLocation = (enabled = true): UserLocationState => {
  const [state, setState] = useState<UserLocationState>({
    coords: null,
    error: null,
    loading: enabled,
    permission: "unknown",
  });

  useEffect(() => {
    if (!enabled) return;
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setState((s) => ({ ...s, loading: false, error: "Geolocation not supported" }));
      return;
    }

    let watchId: number | null = null;

    const onSuccess = (pos: GeolocationPosition) => {
      setState({
        coords: { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy },
        error: null,
        loading: false,
        permission: "granted",
      });
    };
    const onError = (err: GeolocationPositionError) => {
      setState((s) => ({
        ...s,
        loading: false,
        error: err.message,
        permission: err.code === err.PERMISSION_DENIED ? "denied" : s.permission,
      }));
    };

    watchId = navigator.geolocation.watchPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      maximumAge: 10_000,
      timeout: 15_000,
    });

    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [enabled]);

  return state;
};

/** Haversine distance in meters between two lat/lng points. */
export const distanceMeters = (a: Coords, b: { lat: number; lng: number }): number => {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
};

export const formatDistance = (meters: number, lang: "en" | "ar"): string => {
  if (meters < 1000) return `${Math.round(meters)} ${lang === "ar" ? "م" : "m"}`;
  return `${(meters / 1000).toFixed(1)} ${lang === "ar" ? "كم" : "km"}`;
};

/** Initial bearing in degrees (0=N, 90=E, 180=S, 270=W) from a → b. */
export const bearingDegrees = (
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number => {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
};

/**
 * Map a compass bearing to one of 8 cardinal directions with a localized label.
 */
export const bearingToCompass = (
  deg: number,
  lang: "en" | "ar"
): { key: string; label: string; arrow: string } => {
  const dirs = [
    { key: "N", en: "north", ar: "شمالاً", arrow: "↑" },
    { key: "NE", en: "northeast", ar: "شمال شرق", arrow: "↗" },
    { key: "E", en: "east", ar: "شرقاً", arrow: "→" },
    { key: "SE", en: "southeast", ar: "جنوب شرق", arrow: "↘" },
    { key: "S", en: "south", ar: "جنوباً", arrow: "↓" },
    { key: "SW", en: "southwest", ar: "جنوب غرب", arrow: "↙" },
    { key: "W", en: "west", ar: "غرباً", arrow: "←" },
    { key: "NW", en: "northwest", ar: "شمال غرب", arrow: "↖" },
  ];
  const idx = Math.round(((deg % 360) + 360) % 360 / 45) % 8;
  const d = dirs[idx];
  return { key: d.key, label: lang === "ar" ? d.ar : d.en, arrow: d.arrow };
};

/** Estimated walking time at ~1.35 m/s. */
export const formatWalkTime = (meters: number, lang: "en" | "ar"): string => {
  const minutes = Math.max(1, Math.round(meters / 1.35 / 60));
  if (minutes < 60) return `${minutes} ${lang === "ar" ? "د" : "min"}`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return lang === "ar" ? `${h} س ${m} د` : `${h}h ${m}m`;
};

