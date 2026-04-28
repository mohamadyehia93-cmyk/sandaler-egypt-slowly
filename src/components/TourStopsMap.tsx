import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useI18n } from "@/lib/i18n";

// Fix default marker icon issue with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const createNumberedIcon = (num: number, active = false) =>
  L.divIcon({
    className: "custom-numbered-marker",
    html: `<div style="
      width:${active ? 34 : 28}px;height:${active ? 34 : 28}px;border-radius:50%;
      background:${active ? "hsl(24,80%,52%)" : "hsl(174,60%,45%)"};color:white;
      display:flex;align-items:center;justify-content:center;
      font-size:${active ? 14 : 12}px;font-weight:700;
      border:2px solid white;
      box-shadow:0 2px 6px rgba(0,0,0,0.3);
    ">${num}</div>`,
    iconSize: [active ? 34 : 28, active ? 34 : 28],
    iconAnchor: [active ? 17 : 14, active ? 17 : 14],
  });

const userIcon = L.divIcon({
  className: "user-location-marker",
  html: `<div style="
    width:18px;height:18px;border-radius:50%;
    background:hsl(207,90%,54%);
    border:3px solid white;
    box-shadow:0 0 0 4px hsla(207,90%,54%,0.25), 0 2px 6px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

type Stop = {
  label: { en: string; ar: string };
  lat: number;
  lng: number;
};

type Props = {
  stops: Stop[];
  userLocation?: { lat: number; lng: number } | null;
  activeStopIndex?: number;
};

const FitBounds = ({ stops, userLocation }: { stops: Stop[]; userLocation?: { lat: number; lng: number } | null }) => {
  const map = useMap();
  useEffect(() => {
    if (stops.length === 0) return;
    const points: [number, number][] = stops.map((s) => [s.lat, s.lng]);
    if (userLocation) points.push([userLocation.lat, userLocation.lng]);
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [stops, userLocation, map]);
  return null;
};

const TourStopsMap = ({ stops, userLocation, activeStopIndex }: Props) => {
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
          <FitBounds stops={stops} userLocation={userLocation} />
          <Polyline
            positions={polyline}
            pathOptions={{ color: "hsl(174, 60%, 45%)", weight: 3, dashArray: "8, 8", opacity: 0.7 }}
          />
          {stops.map((stop, i) => (
            <Marker key={i} position={[stop.lat, stop.lng]} icon={createNumberedIcon(i + 1, i === activeStopIndex)}>
              <Popup>
                <div className="text-xs font-medium">{stop.label[lang]}</div>
              </Popup>
            </Marker>
          ))}
          {userLocation && (
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
              <Popup>
                <div className="text-xs font-medium">{lang === "ar" ? "موقعك" : "You are here"}</div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default TourStopsMap;
