import { useEffect, useRef, useState } from "react";
import { TileLayer, useMap } from "react-leaflet";
import L from "leaflet";

/** Single source of truth for map tiles. Keyless providers only. */
export const MAP_TILES = {
  primary: {
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  fallback: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles © Esri",
    maxZoom: 19,
  },
} as const;

export const OSM_ATTRIBUTION_TEXT = "© OpenStreetMap contributors";
export const OSM_COPYRIGHT_URL = "https://www.openstreetmap.org/copyright";

/** Tile layer with a one-time switch to Esri if OSM tiles fail. Use inside every MapContainer. */
export const AppTileLayer = () => {
  const [useFallback, setUseFallback] = useState(false);
  const errors = useRef(0);
  const cfg = useFallback ? MAP_TILES.fallback : MAP_TILES.primary;
  return (
    <TileLayer
      key={cfg.url}
      url={cfg.url}
      attribution={cfg.attribution}
      maxZoom={cfg.maxZoom}
      eventHandlers={{
        tileerror: () => {
          if (useFallback) return;
          errors.current += 1;
          if (errors.current >= 3) setUseFallback(true);
        },
      }}
    />
  );
};

/**
 * Frames markers: 2+ → fitBounds (40px padding, maxZoom 15); 1 → centre at zoom 14.
 * Re-fits when the container resizes (maps in tabs often start at 0 width).
 */
export const FitToPoints = ({ points, maxZoom = 15 }: { points: [number, number][]; maxZoom?: number }) => {
  const map = useMap();
  const key = points.map((p) => p.join(",")).join("|");
  useEffect(() => {
    const fit = () => {
      map.invalidateSize();
      if (points.length === 0) return;
      if (points.length === 1) map.setView(points[0], 14);
      else map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom });
    };
    fit();
    const el = map.getContainer();
    let w = el.clientWidth, h = el.clientHeight;
    const ro = new ResizeObserver(() => {
      if (el.clientWidth !== w || el.clientHeight !== h) {
        w = el.clientWidth; h = el.clientHeight;
        if (w > 0 && h > 0) fit();
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map, maxZoom]);
  return null;
};
