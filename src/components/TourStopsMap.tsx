import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useI18n } from "@/lib/i18n";

// Fix default marker icon issue with bundlers
delete (L.Icon.Default.prototype as typeof L.Icon.Default.prototype & { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const createNumberedIcon = (num: number) =>
  L.divIcon({
    className: "custom-numbered-marker",
    html: `<div style="
      width:28px;height:28px;border-radius:50%;
      background:hsl(174,60%,45%);color:white;
      display:flex;align-items:center;justify-content:center;
      font-size:12px;font-weight:700;
      border:2px solid white;
      box-shadow:0 2px 6px rgba(0,0,0,0.3);
    ">${num}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

type Stop = {
  label: { en: string; ar: string };
  lat: number;
  lng: number;
};

type Props = {
  stops: Stop[];
};

const FitBounds = ({ stops }: { stops: Stop[] }) => {
  const map = useMap();
  useEffect(() => {
    if (stops.length > 0) {
      const bounds = L.latLngBounds(stops.map((s) => [s.lat, s.lng]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [stops, map]);
  return null;
};

const TourStopsMap = ({ stops }: Props) => {
  const { lang } = useI18n();

  if (stops.length === 0) return null;

  const center: [number, number] = [stops[0].lat, stops[0].lng];
  const polyline: [number, number][] = stops.map((s) => [s.lat, s.lng]);

  return (
    <div className="mb-6">
      <div className="rounded-xl overflow-hidden border border-border shadow-card" style={{ height: 240 }}>
        <MapContainer
          center={center}
          zoom={14}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <FitBounds stops={stops} />
          <Polyline
            positions={polyline}
            pathOptions={{ color: "hsl(174, 60%, 45%)", weight: 3, dashArray: "8, 8", opacity: 0.7 }}
          />
          {stops.map((stop, i) => (
            <Marker key={i} position={[stop.lat, stop.lng]} icon={createNumberedIcon(i + 1)}>
              <Popup>
                <div className="text-xs font-medium">{stop.label[lang]}</div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default TourStopsMap;
