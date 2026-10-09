import { MapContainer, Marker, Popup, useMap } from "react-leaflet";
import { AppTileLayer, FitToPoints } from "@/lib/mapTiles";
import MarkerClusterGroup from "react-leaflet-cluster";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";

// Centers for all known cities (same coordinates as RegionMap)
const CITY_CENTERS: Record<string, [number, number]> = {
  damietta: [31.4175, 31.8144],
  rosetta: [31.4010, 30.4164],
  manzala: [31.1600, 32.0000],
  mansoura: [31.0409, 31.3785],
  tanta: [30.7865, 31.0004],
  "el-mahalla": [30.9697, 31.1667],
  fuwwah: [31.2000, 30.5500],
  desouk: [31.1300, 30.6500],
  bilbeis: [30.4214, 31.5614],
  edku: [31.3000, 30.3000],
  ismailia: [30.5965, 32.2715],
  "port-said": [31.2653, 32.3019],
  suez: [29.9668, 32.5498],
  luxor: [25.6872, 32.6396],
  aswan: [24.0889, 32.8998],
  minya: [28.1099, 30.7503],
  sohag: [26.5591, 31.6948],
  qena: [26.1551, 32.7160],
  assiut: [27.1783, 31.1859],
  fayoum: [29.3084, 30.8428],
  edfu: [24.9790, 32.8734],
  esna: [25.2919, 32.5540],
  siwa: [29.2032, 25.5195],
  dahab: [28.5091, 34.5131],
  "el-arish": [31.1311, 33.7983],
  "marsa-matrouh": [31.3543, 27.2373],
  hurghada: [27.2579, 33.8116],
  "marsa-alam": [25.0693, 34.8990],
  quseir: [26.0993, 34.2810],
};

/** Rough great-circle distance in km. */
const kmBetween = (a: [number, number], b: [number, number]) => {
  const R = 6371, toR = Math.PI / 180;
  const dLat = (b[0] - a[0]) * toR, dLng = (b[1] - a[1]) * toR;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * toR) * Math.cos(b[0] * toR) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
};
const FRAME_RADIUS_KM = 40;

const clusterIcon = (cluster: any) =>
  L.divIcon({
    className: "city-cluster",
    html: `<div class="city-cluster-bubble">${cluster.getChildCount()}</div>`,
    iconSize: [36, 36],
  });

type Category =
  | "experience"
  | "accommodation"
  | "product"
  | "audio"
  | "trip"
  | "person"
  | "cause";

const CAT_COLORS: Record<Category, string> = {
  experience: "#2BBFB3",
  accommodation: "#1A7A74",
  product: "#BA7517",
  audio: "#7C3AED",
  trip: "#27AE60",
  person: "#E11D48",
  cause: "#A32D2D",
};

const CAT_LABELS: Record<Category, { en: string; ar: string }> = {
  experience: { en: "Experiences", ar: "تجارب" },
  accommodation: { en: "Stays", ar: "إقامة" },
  product: { en: "Products", ar: "منتجات" },
  audio: { en: "Audio Tours", ar: "جولات صوتية" },
  trip: { en: "Trips", ar: "رحلات" },
  person: { en: "Locals", ar: "أهالي" },
  cause: { en: "Causes", ar: "قضايا" },
};

const CAT_ROUTE: Record<Category, (id: string) => string> = {
  experience: (id) => `/experience/${id}`,
  accommodation: (id) => `/stay/${id}`,
  product: (id) => `/product/${id}`,
  audio: (id) => `/audio-tour/${id}`,
  trip: (id) => `/trip/${id}`,
  person: (id) => `/person/${id}`,
  cause: (id) => `/cause/${id}`,
};

const makeIcon = (color: string) =>
  L.divIcon({
    className: "city-offering-pin",
    html: `<div style="
      width:18px;height:18px;border-radius:50% 50% 50% 0;
      background:${color};
      transform:rotate(-45deg);
      border:2px solid white;
      box-shadow:0 2px 6px rgba(0,0,0,0.35);
    "></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 16],
    popupAnchor: [0, -14],
  });

export type OfferingPin = {
  id: string;
  slug?: string;
  category: Category;
  title: { en: string; ar: string };
  subtitle?: { en: string; ar: string };
  /** Real stored coordinates only. Rows without them are not plotted. */
  lat?: number | null;
  lng?: number | null;
};

const realPos = (o: OfferingPin): [number, number] | null =>
  typeof o.lat === "number" && typeof o.lng === "number" && Number.isFinite(o.lat) && Number.isFinite(o.lng) ? [o.lat, o.lng] : null;

const FlyTo = ({ target }: { target: [number, number] | null }) => {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo(target, Math.max(map.getZoom(), 15), { duration: 0.6 });
  }, [target, map]);
  return null;
};

interface CityOfferingsMapProps {
  cityId: string;
  cityName: { en: string; ar: string };
  offerings: OfferingPin[];
}

const CityOfferingsMap = ({ cityId, cityName, offerings }: CityOfferingsMapProps) => {
  const navigate = useNavigate();
  const { lang } = useI18n();
  const center = CITY_CENTERS[cityId] || [26.8, 30.8];

  const [active, setActive] = useState<Set<Category>>(
    () => new Set(Object.keys(CAT_COLORS) as Category[])
  );
  const [query, setQuery] = useState("");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const markerRefs = useRef<Record<string, L.Marker | null>>({});
  const cardRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const listRef = useRef<HTMLDivElement | null>(null);

  const toggle = (c: Category) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return offerings.filter((o) => {
      if (!realPos(o)) return false;
      if (!active.has(o.category)) return false;
      if (!q) return true;
      const hay = [
        o.title?.en,
        o.title?.ar,
        o.subtitle?.en,
        o.subtitle?.ar,
        CAT_LABELS[o.category]?.en,
        CAT_LABELS[o.category]?.ar,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [offerings, active, query]);

  const points = useMemo<[number, number][]>(() => {
    const pts = visible.map((o) => realPos(o)!);
    // Frame only pins near the city; far outliers stay on the map but don't zoom it out.
    const near = CITY_CENTERS[cityId] ? pts.filter((p) => kmBetween(p, center) <= FRAME_RADIUS_KM) : pts;
    return near.length ? near : pts;
  }, [visible, center]);

  const pinned = useMemo(() => offerings.filter((o) => realPos(o)), [offerings]);
  const unpinned = offerings.length - pinned.length;
  const presentCategories = useMemo(() => {
    const set = new Set<Category>();
    pinned.forEach((o) => set.add(o.category));
    return Array.from(set);
  }, [pinned]);

  if (pinned.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="px-4">
        <div className="relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={lang === "ar" ? "ابحث في الخريطة..." : "Search the map..."}
            className="w-full bg-card border border-border rounded-full text-sm py-2 pl-9 pr-9 placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            aria-label={lang === "ar" ? "ابحث في الخريطة" : "Search the map"}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-secondary"
              aria-label={lang === "ar" ? "مسح" : "Clear"}
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
        </div>
        {(query || visible.length !== pinned.length) && (
          <p className="text-[11px] text-muted-foreground mt-1.5 px-1">
            {lang === "ar"
              ? `${visible.length} نتيجة من ${pinned.length}`
              : `${visible.length} of ${pinned.length} results`}
          </p>
        )}
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 px-4 overflow-x-auto hide-scrollbar">
        {presentCategories.map((c) => {
          const isActive = active.has(c);
          const count = pinned.filter((o) => o.category === c).length;
          return (
            <button
              key={c}
              onClick={() => toggle(c)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                isActive
                  ? "text-white border-transparent"
                  : "bg-card text-muted-foreground border-border"
              }`}
              style={isActive ? { background: CAT_COLORS[c] } : undefined}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: isActive ? "white" : CAT_COLORS[c] }}
              />
              {CAT_LABELS[c][lang]} ({count})
            </button>
          );
        })}
      </div>

      <div
        className="mx-4 rounded-xl overflow-hidden border border-border shadow-card"
        style={{ height: 320 }}
      >
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          zoomControl={true}
        >
          <AppTileLayer />
          <FitToPoints points={points} />
          <FlyTo
            target={
              selectedKey
                ? (() => {
                    const o = visible.find((x) => `${x.category}-${x.id}` === selectedKey);
                    return o ? realPos(o) : null;
                  })()
                : null
            }
          />

          <MarkerClusterGroup chunkedLoading iconCreateFunction={clusterIcon} showCoverageOnHover={false} spiderfyOnMaxZoom maxClusterRadius={40}>
          {visible.map((o) => {
            const pos = realPos(o)!;
            const route = CAT_ROUTE[o.category](o.slug || o.id);
            const key = `${o.category}-${o.id}`;
            return (
              <Marker
                key={key}
                position={pos}
                icon={makeIcon(CAT_COLORS[o.category])}
                ref={(ref) => { markerRefs.current[key] = ref; }}
                eventHandlers={{
                  click: () => {
                    setSelectedKey(key);
                    cardRefs.current[key]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                  },
                }}
              >
                <Popup>
                  <div className="min-w-[140px]">
                    <div
                      className="text-[10px] font-semibold uppercase tracking-wide mb-1"
                      style={{ color: CAT_COLORS[o.category] }}
                    >
                      {CAT_LABELS[o.category]?.[lang]}
                    </div>
                    <strong className="text-sm block leading-tight">
                      {o.title?.[lang]}
                    </strong>
                    {o.subtitle && (
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {o.subtitle?.[lang]}
                      </div>
                    )}
                    <button
                      onClick={() => navigate(route)}
                      className="mt-2 text-xs font-medium text-primary"
                    >
                      {lang === "ar" ? "عرض التفاصيل ←" : "View details →"}
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
          </MarkerClusterGroup>
        </MapContainer>
      </div>

      {/* Synced bottom sheet list */}
      {visible.length > 0 && (
        <div ref={listRef} className="flex gap-2.5 px-4 overflow-x-auto hide-scrollbar snap-x snap-mandatory pb-1">
          {visible.map((o) => {
            const key = `${o.category}-${o.id}`;
            const isSelected = selectedKey === key;
            return (
              <button
                key={key}
                ref={(ref) => { cardRefs.current[key] = ref; }}
                onClick={() => {
                  setSelectedKey(key);
                  // Open the popup once the map flies in
                  setTimeout(() => markerRefs.current[key]?.openPopup(), 650);
                }}
                className={`shrink-0 snap-start w-[180px] text-left rounded-xl border bg-card p-2.5 transition-all ${
                  isSelected
                    ? "border-primary shadow-md scale-[1.02]"
                    : "border-border shadow-card"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: CAT_COLORS[o.category] }}
                  />
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wide truncate"
                    style={{ color: CAT_COLORS[o.category] }}
                  >
                    {CAT_LABELS[o.category]?.[lang]}
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-foreground line-clamp-2 leading-snug">
                  {o.title?.[lang]}
                </h4>
                {o.subtitle && (
                  <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                    {o.subtitle?.[lang]}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      )}

      {unpinned > 0 && (
        <p className="px-4 text-[13px] text-muted-foreground">
          {lang === "ar"
            ? `${unpinned.toLocaleString("ar-EG")} أماكن أخرى في ${cityName?.ar} ليس لها دبوس على الخريطة بعد`
            : `${unpinned} more ${unpinned === 1 ? "place" : "places"} in ${cityName?.en} ${unpinned === 1 ? "has" : "have"} no map pin yet`}
        </p>
      )}
    </div>
  );
};

export default CityOfferingsMap;
