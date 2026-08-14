import { useEffect, useRef, useState } from "react";
import { Search, Loader2, MapPin } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { EGYPT_CENTER } from "@/lib/cityCoords";
import { loadGoogleMaps, hasGoogleMapsKey } from "@/lib/googleMaps";

interface Props {
  lat: string;
  lng: string;
  /** Fallback centre when nothing is picked yet (usually the selected city). */
  fallbackCenter?: [number, number] | null;
  onChange: (lat: number, lng: number) => void;
}

type Suggestion = { label: string; secondary: string; placeId: string };

/**
 * Google Maps location picker: search a real place, tap the map, or drag the
 * marker. Reports plain lat/lng so every caller stays unchanged.
 */
const LocationPicker = ({ lat, lng, fallbackCenter, onChange }: Props) => {
  const { lang } = useI18n();
  const ar = lang === "ar";

  const hasPin = !!lat && !!lng && !Number.isNaN(Number(lat)) && !Number.isNaN(Number(lng));
  const pin = hasPin ? { lat: Number(lat), lng: Number(lng) } : null;

  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(!hasGoogleMapsKey());
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Suggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout>>();

  // Init the map once.
  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps()
      .then((maps) => {
        if (cancelled || !mapEl.current || mapRef.current) return;
        const center = pin ?? (fallbackCenter ? { lat: fallbackCenter[0], lng: fallbackCenter[1] } : { lat: EGYPT_CENTER[0], lng: EGYPT_CENTER[1] });
        const map = new maps.Map(mapEl.current, {
          center,
          zoom: pin ? 15 : fallbackCenter ? 12 : 6,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        map.addListener("click", (e: google.maps.MapMouseEvent) => {
          if (e.latLng) onChangeRef.current(e.latLng.lat(), e.latLng.lng());
        });
        mapRef.current = map;
        setReady(true);
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the marker in sync with the reported coordinates.
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    if (!pin) {
      markerRef.current?.setMap(null);
      markerRef.current = null;
      return;
    }
    if (!markerRef.current) {
      const marker = new google.maps.Marker({ position: pin, map, draggable: true });
      marker.addListener("dragend", () => {
        const p = marker.getPosition();
        if (p) onChangeRef.current(p.lat(), p.lng());
      });
      markerRef.current = marker;
    } else {
      markerRef.current.setPosition(pin);
    }
    map.panTo(pin);
  }, [ready, pin?.lat, pin?.lng]);

  // Follow the selected city while no pin has been dropped yet.
  useEffect(() => {
    if (!ready || hasPin || !fallbackCenter || !mapRef.current) return;
    mapRef.current.setCenter({ lat: fallbackCenter[0], lng: fallbackCenter[1] });
    mapRef.current.setZoom(12);
  }, [ready, hasPin, fallbackCenter?.[0], fallbackCenter?.[1]]);

  // Places (New) autocomplete — debounced so we never fan out per keystroke.
  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    const q = query.trim();
    if (!ready || q.length < 3) {
      setHits([]);
      return;
    }
    debounce.current = setTimeout(async () => {
      setSearching(true);
      try {
        const { AutocompleteSuggestion, AutocompleteSessionToken } = (await google.maps.importLibrary(
          "places"
        )) as google.maps.PlacesLibrary;
        const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: q,
          sessionToken: new AutocompleteSessionToken(),
          includedRegionCodes: ["eg"],
          language: ar ? "ar" : "en",
        });
        setSearchError(false);
        setHits(
          (suggestions ?? [])
            .map((s) => s.placePrediction)
            .filter(Boolean)
            .map((p) => ({
              label: p!.mainText?.text || p!.text?.text || "",
              secondary: p!.secondaryText?.text || "",
              placeId: p!.placeId,
            }))
            .filter((h) => h.label && h.placeId)
            .slice(0, 5)
        );
      } catch {
        setHits([]);
        setSearchError(true);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => debounce.current && clearTimeout(debounce.current);
  }, [query, ready, ar]);

  const pick = async (hit: Suggestion) => {
    setQuery("");
    setHits([]);
    try {
      const { Place } = (await google.maps.importLibrary("places")) as google.maps.PlacesLibrary;
      const place = new Place({ id: hit.placeId });
      await place.fetchFields({ fields: ["location"] });
      const loc = place.location;
      if (!loc) return;
      onChangeRef.current(loc.lat(), loc.lng());
      mapRef.current?.setZoom(16);
    } catch {
      /* leave the previous pin untouched */
    }
  };

  if (failed) {
    const noKey = !hasGoogleMapsKey();
    return (
      <div className="space-y-2" dir={ar ? "rtl" : "ltr"}>
        <div className="rounded-xl border border-border bg-secondary/40 px-4 py-3 space-y-1">
          <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
            {ar ? "الخريطة غير متاحة" : "Map unavailable"}
          </p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {noKey
              ? ar
                ? "لم يتم إعداد خرائط جوجل لهذا التطبيق بعد. يمكنك إدخال الإحداثيات يدوياً بالأسفل، أو تخطي هذه الخطوة والعودة إليها لاحقاً."
                : "Google Maps isn’t set up for this app yet. Enter the coordinates manually below, or skip this step and add the spot later."
              : ar
              ? "تعذّر تحميل الخريطة (قد تكون مشكلة اتصال). أدخل الإحداثيات يدوياً بالأسفل أو أعد المحاولة لاحقاً."
              : "The map couldn’t load — this is usually a connection issue. Enter the coordinates manually below, or try again later."}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            step="any"
            inputMode="decimal"
            value={lat}
            onChange={(e) => onChange(Number(e.target.value), Number(lng) || 0)}
            placeholder={ar ? "خط العرض" : "Latitude"}
            className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <input
            type="number"
            step="any"
            inputMode="decimal"
            value={lng}
            onChange={(e) => onChange(Number(lat) || 0, Number(e.target.value))}
            placeholder={ar ? "خط الطول" : "Longitude"}
            className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2" dir={ar ? "rtl" : "ltr"}>
      <div className="relative">
        <Search className="w-4 h-4 text-muted-foreground absolute top-1/2 -translate-y-1/2 start-3" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={ar ? "ابحث عن مكان على خرائط جوجل" : "Search a place on Google Maps"}
          className="w-full bg-background border border-border rounded-xl ps-9 pe-9 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        {searching && (
          <Loader2 className="w-4 h-4 text-muted-foreground animate-spin absolute top-1/2 -translate-y-1/2 end-3" />
        )}
        {hits.length > 0 && (
          <ul className="absolute z-[500] mt-1 inset-x-0 bg-card border border-border rounded-xl overflow-hidden shadow-lg max-h-56 overflow-y-auto">
            {hits.map((h) => (
              <li key={h.placeId}>
                <button
                  type="button"
                  onClick={() => pick(h)}
                  className="w-full text-start px-3 py-2.5 text-xs text-foreground hover:bg-secondary flex gap-2 items-start"
                >
                  <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <span className="line-clamp-2">
                    {h.label}
                    {h.secondary ? <span className="text-muted-foreground"> — {h.secondary}</span> : null}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div ref={mapEl} className="h-56 rounded-xl overflow-hidden border border-border bg-secondary/40" />

      <p className="text-[11px] text-muted-foreground">
        {pin
          ? ar
            ? `تم تحديد الموقع: ${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)} — اسحب العلامة لتعديلها.`
            : `Pin set at ${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)} — drag it to adjust.`
          : ar
          ? "اضغط على الخريطة لتحديد الموقع بدقة."
          : "Tap the map to drop a pin on the exact spot."}
      </p>
    </div>
  );
};

export default LocationPicker;
