import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useState } from "react";
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

// Deterministic pseudo-random scatter from a string id
const hashOffset = (key: string, radiusKm = 3): [number, number] => {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h << 5) - h + key.charCodeAt(i);
  const a = (Math.abs(h) % 1000) / 1000;
  const b = (Math.abs(h >> 3) % 1000) / 1000;
  const angle = a * 2 * Math.PI;
  const dist = (0.4 + b * 0.6) * (radiusKm / 111); // ~km to deg
  return [Math.cos(angle) * dist, Math.sin(angle) * dist];
};

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
  /** Real GPS coordinates if known. When null/undefined, a deterministic scatter near the city center is used. */
  lat?: number | null;
  lng?: number | null;
};

const resolvePos = (
  o: OfferingPin,
  center: [number, number]
): { pos: [number, number]; precise: boolean } => {
  if (typeof o.lat === "number" && typeof o.lng === "number" && !Number.isNaN(o.lat) && !Number.isNaN(o.lng)) {
    return { pos: [o.lat, o.lng], precise: true };
  }
  const [dLat, dLng] = hashOffset(`${o.category}-${o.id}`);
  return { pos: [center[0] + dLat, center[1] + dLng], precise: false };
};

const FitBounds = ({ points }: { points: [number, number][] }) => {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 14);
      return;
    }
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 });
  }, [points, map]);
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
      if (!active.has(o.category)) return false;
      if (!q) return true;
      const hay = [
        o.title.en,
        o.title.ar,
        o.subtitle?.en,
        o.subtitle?.ar,
        CAT_LABELS[o.category].en,
        CAT_LABELS[o.category].ar,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [offerings, active, query]);

  const points = useMemo<[number, number][]>(() => {
    const pts = visible.map((o) => resolvePos(o, center).pos);
    pts.push(center);
    return pts;
  }, [visible, center]);

  const presentCategories = useMemo(() => {
    const set = new Set<Category>();
    offerings.forEach((o) => set.add(o.category));
    return Array.from(set);
  }, [offerings]);

  return (
    <div className="space-y-3">
      {/* Filter chips */}
      <div className="flex gap-2 px-4 overflow-x-auto hide-scrollbar">
        {presentCategories.map((c) => {
          const isActive = active.has(c);
          const count = offerings.filter((o) => o.category === c).length;
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
          attributionControl={false}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
          <FitBounds points={points} />

          {/* City center marker */}
          <Marker position={center} icon={makeIcon("#1A7A74")}>
            <Popup>
              <div className="text-center">
                <strong className="text-sm">{cityName[lang]}</strong>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {lang === "ar" ? "مركز المدينة" : "City center"}
                </div>
              </div>
            </Popup>
          </Marker>

          {visible.map((o) => {
            const { pos, precise } = resolvePos(o, center);
            const route = CAT_ROUTE[o.category](o.slug || o.id);
            return (
              <Marker
                key={`${o.category}-${o.id}`}
                position={pos}
                icon={makeIcon(CAT_COLORS[o.category])}
                eventHandlers={{ click: () => navigate(route) }}
              >
                <Popup>
                  <div className="min-w-[140px]">
                    <div
                      className="text-[10px] font-semibold uppercase tracking-wide mb-1"
                      style={{ color: CAT_COLORS[o.category] }}
                    >
                      {CAT_LABELS[o.category][lang]}
                    </div>
                    <strong className="text-sm block leading-tight">
                      {o.title[lang]}
                    </strong>
                    {o.subtitle && (
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {o.subtitle[lang]}
                      </div>
                    )}
                    {!precise && (
                      <div className="text-[10px] text-muted-foreground mt-1 italic">
                        {lang === "ar" ? "موقع تقريبي" : "Approximate location"}
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
        </MapContainer>
      </div>

      <p className="px-4 text-[11px] text-muted-foreground">
        {lang === "ar"
          ? "اضغط الدبوس لعرض التفاصيل. الدبابيس بدون موقع دقيق تظهر بالقرب من مركز المدينة."
          : "Tap a pin to view details. Pins without a precise location are shown near the city center."}
      </p>
    </div>
  );
};

export default CityOfferingsMap;
