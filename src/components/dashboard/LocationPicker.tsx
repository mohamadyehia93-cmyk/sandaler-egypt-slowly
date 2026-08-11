import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, Loader2, MapPin } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { EGYPT_CENTER } from "@/lib/cityCoords";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface Props {
  lat: string;
  lng: string;
  /** Fallback centre when nothing is picked yet (usually the selected city). */
  fallbackCenter?: [number, number] | null;
  onChange: (lat: number, lng: number) => void;
}

const Recenter = ({ center, zoom }: { center: [number, number]; zoom?: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom ?? map.getZoom());
  }, [center[0], center[1], zoom]);
  return null;
};

const ClickCapture = ({ onChange }: { onChange: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click: (e) => onChange(e.latlng.lat, e.latlng.lng),
  });
  return null;
};

type Hit = { display_name: string; lat: string; lon: string };

const LocationPicker = ({ lat, lng, fallbackCenter, onChange }: Props) => {
  const { lang } = useI18n();
  const ar = lang === "ar";
  const hasPin = !!lat && !!lng && !Number.isNaN(Number(lat)) && !Number.isNaN(Number(lng));
  const pin: [number, number] | null = hasPin ? [Number(lat), Number(lng)] : null;

  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [searching, setSearching] = useState(false);
  const [recenterTo, setRecenterTo] = useState<{ center: [number, number]; zoom?: number } | null>(null);
  const debounce = useRef<ReturnType<typeof setTimeout>>();

  const initialCenter = pin ?? fallbackCenter ?? EGYPT_CENTER;
  const initialZoom = pin ? 15 : fallbackCenter ? 12 : 6;

  // Follow the selected city while no pin has been dropped yet.
  useEffect(() => {
    if (!hasPin && fallbackCenter) setRecenterTo({ center: fallbackCenter, zoom: 12 });
  }, [fallbackCenter?.[0], fallbackCenter?.[1], hasPin]);

  // Nominatim search — debounced (1s) per OSM usage policy, one request per pause.
  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    const q = query.trim();
    if (q.length < 3) {
      setHits([]);
      return;
    }
    debounce.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=5&countrycodes=eg&accept-language=${
            ar ? "ar" : "en"
          }&q=${encodeURIComponent(q)}`,
          { headers: { Accept: "application/json" }, referrer: "https://sandal.lovable.app" }
        );
        setHits(res.ok ? await res.json() : []);
      } catch {
        setHits([]);
      } finally {
        setSearching(false);
      }
    }, 1000);
    return () => debounce.current && clearTimeout(debounce.current);
  }, [query, ar]);

  const pick = (h: Hit) => {
    const la = Number(h.lat);
    const lo = Number(h.lon);
    onChange(la, lo);
    setRecenterTo({ center: [la, lo], zoom: 16 });
    setQuery("");
    setHits([]);
  };

  return (
    <div className="space-y-2" dir={ar ? "rtl" : "ltr"}>
      <div className="relative">
        <Search className="w-4 h-4 text-muted-foreground absolute top-1/2 -translate-y-1/2 start-3" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={ar ? "ابحث عن مكان، مثال: فندق ماكسيم دي ليسبس" : "Search a place, e.g. Maxim Delesseps Hotel"}
          className="w-full bg-background border border-border rounded-xl ps-9 pe-9 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        {searching && (
          <Loader2 className="w-4 h-4 text-muted-foreground animate-spin absolute top-1/2 -translate-y-1/2 end-3" />
        )}
        {hits.length > 0 && (
          <ul className="absolute z-[500] mt-1 inset-x-0 bg-card border border-border rounded-xl overflow-hidden shadow-lg max-h-56 overflow-y-auto">
            {hits.map((h, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => pick(h)}
                  className="w-full text-start px-3 py-2.5 text-xs text-foreground hover:bg-secondary flex gap-2 items-start"
                >
                  <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{h.display_name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="h-56 rounded-xl overflow-hidden border border-border">
        <MapContainer center={initialCenter} zoom={initialZoom} scrollWheelZoom className="w-full h-full">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <ClickCapture onChange={onChange} />
          {recenterTo && <Recenter center={recenterTo.center} zoom={recenterTo.zoom} />}
          {pin && (
            <Marker
              position={pin}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const p = (e.target as L.Marker).getLatLng();
                  onChange(p.lat, p.lng);
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      <p className="text-[11px] text-muted-foreground">
        {pin
          ? ar
            ? `تم تحديد الموقع: ${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)} — اسحب العلامة لتعديلها.`
            : `Pin set at ${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)} — drag it to adjust.`
          : ar
          ? "اضغط على الخريطة لتحديد نقطة الالتقاء بدقة."
          : "Tap the map to drop a pin on your exact meeting point."}
      </p>
    </div>
  );
};

export default LocationPicker;
