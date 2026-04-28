import { useCallback, useEffect, useState } from "react";

const CACHE_NAME = "audio-tour-offline-v1";
const META_KEY = "audio-tour-offline-meta-v1";

type StopLite = { lat: number; lng: number };

type Meta = Record<
  string,
  { downloadedAt: number; audioUrl: string; tileCount: number; stopsCount: number }
>;

const readMeta = (): Meta => {
  try {
    return JSON.parse(localStorage.getItem(META_KEY) || "{}");
  } catch {
    return {};
  }
};
const writeMeta = (m: Meta) => localStorage.setItem(META_KEY, JSON.stringify(m));

// Convert lat/lng to OSM tile xyz
const lonLatToTile = (lat: number, lng: number, z: number) => {
  const x = Math.floor(((lng + 180) / 360) * Math.pow(2, z));
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * Math.pow(2, z),
  );
  return { x, y };
};

const tilesAroundStops = (stops: StopLite[], zooms = [13, 14, 15], pad = 1) => {
  const set = new Set<string>();
  for (const z of zooms) {
    for (const s of stops) {
      const { x, y } = lonLatToTile(s.lat, s.lng, z);
      for (let dx = -pad; dx <= pad; dx++) {
        for (let dy = -pad; dy <= pad; dy++) {
          set.add(`${z}/${x + dx}/${y + dy}`);
        }
      }
    }
  }
  return Array.from(set);
};

export const useOfflineTour = (tourId: string | undefined) => {
  const [downloaded, setDownloaded] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!tourId) return;
    const meta = readMeta();
    setDownloaded(!!meta[tourId]);
  }, [tourId]);

  const download = useCallback(
    async (audioUrl: string, stops: StopLite[]) => {
      if (!tourId || typeof caches === "undefined") return;
      setDownloading(true);
      setProgress(0);
      try {
        const cache = await caches.open(CACHE_NAME);
        const tiles = tilesAroundStops(stops);
        const tileUrls = tiles.map(
          (t) => `https://a.tile.openstreetmap.org/${t}.png`,
        );
        const total = tileUrls.length + 1; // +1 for audio
        let done = 0;

        // Audio (no-cors so opaque response is acceptable)
        try {
          await cache.add(new Request(audioUrl, { mode: "no-cors" }));
        } catch (e) {
          // ignore audio failures, still cache tiles
        }
        done++;
        setProgress(Math.round((done / total) * 100));

        // Tiles in small parallel batches
        const batchSize = 6;
        for (let i = 0; i < tileUrls.length; i += batchSize) {
          const batch = tileUrls.slice(i, i + batchSize);
          await Promise.all(
            batch.map(async (u) => {
              try {
                await cache.add(new Request(u, { mode: "no-cors" }));
              } catch {
                /* tile failure is non-fatal */
              }
              done++;
              setProgress(Math.round((done / total) * 100));
            }),
          );
        }

        const meta = readMeta();
        meta[tourId] = {
          downloadedAt: Date.now(),
          audioUrl,
          tileCount: tileUrls.length,
          stopsCount: stops.length,
        };
        writeMeta(meta);
        setDownloaded(true);
      } finally {
        setDownloading(false);
      }
    },
    [tourId],
  );

  const remove = useCallback(async () => {
    if (!tourId) return;
    const meta = readMeta();
    delete meta[tourId];
    writeMeta(meta);
    setDownloaded(false);
  }, [tourId]);

  return { downloaded, downloading, progress, download, remove };
};

/** Tracks navigator.onLine */
export const useOnlineStatus = () => {
  const [online, setOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  return online;
};
