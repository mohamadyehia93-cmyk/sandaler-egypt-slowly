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
