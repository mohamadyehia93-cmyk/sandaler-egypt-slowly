import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";

// Fix default marker icon
delete (L.Icon.Default.prototype as typeof L.Icon.Default.prototype & { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const createCityIcon = (color: string) =>
  L.divIcon({
    className: "custom-city-marker",
    html: `<div style="
      width:14px;height:14px;border-radius:50%;
      background:${color};
      border:3px solid white;
      box-shadow:0 2px 6px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });

type CityPoint = {
  id: string;
  name: { en: string; ar: string };
  lat: number;
  lng: number;
};

type RegionMapConfig = {
  center: [number, number];
  zoom: number;
  cities: CityPoint[];
};

const regionMaps: Record<string, RegionMapConfig> = {
  "nile-delta": {
    center: [31.0, 31.0],
    zoom: 8,
    cities: [
      { id: "damietta", name: { en: "Damietta", ar: "دمياط" }, lat: 31.4175, lng: 31.8144 },
      { id: "rosetta", name: { en: "Rosetta", ar: "رشيد" }, lat: 31.4010, lng: 30.4164 },
      { id: "manzala", name: { en: "Manzala", ar: "المنزلة" }, lat: 31.1600, lng: 32.0000 },
      { id: "mansoura", name: { en: "Mansoura", ar: "المنصورة" }, lat: 31.0409, lng: 31.3785 },
      { id: "tanta", name: { en: "Tanta", ar: "طنطا" }, lat: 30.7865, lng: 31.0004 },
      { id: "el-mahalla", name: { en: "El Mahalla", ar: "المحلة الكبرى" }, lat: 30.9697, lng: 31.1667 },
      { id: "fuwwah", name: { en: "Fuwwah", ar: "فوة" }, lat: 31.2000, lng: 30.5500 },
      { id: "desouk", name: { en: "Desouk", ar: "دسوق" }, lat: 31.1300, lng: 30.6500 },
      { id: "bilbeis", name: { en: "Bilbeis", ar: "بلبيس" }, lat: 30.4214, lng: 31.5614 },
      { id: "edku", name: { en: "Edku", ar: "إدكو" }, lat: 31.3000, lng: 30.3000 },
    ],
  },
  "suez-canal": {
    center: [30.5, 32.3],
    zoom: 8,
    cities: [
      { id: "ismailia", name: { en: "Ismailia", ar: "الإسماعيلية" }, lat: 30.5965, lng: 32.2715 },
      { id: "port-said", name: { en: "Port Said", ar: "بورسعيد" }, lat: 31.2653, lng: 32.3019 },
      { id: "suez", name: { en: "Suez", ar: "السويس" }, lat: 29.9668, lng: 32.5498 },
    ],
  },
  "upper-egypt": {
    center: [26.5, 32.0],
    zoom: 7,
    cities: [
      { id: "luxor", name: { en: "Luxor", ar: "الأقصر" }, lat: 25.6872, lng: 32.6396 },
      { id: "aswan", name: { en: "Aswan", ar: "أسوان" }, lat: 24.0889, lng: 32.8998 },
      { id: "minya", name: { en: "Minya", ar: "المنيا" }, lat: 28.1099, lng: 30.7503 },
      { id: "sohag", name: { en: "Sohag", ar: "سوهاج" }, lat: 26.5591, lng: 31.6948 },
      { id: "qena", name: { en: "Qena", ar: "قنا" }, lat: 26.1551, lng: 32.7160 },
      { id: "assiut", name: { en: "Assiut", ar: "أسيوط" }, lat: 27.1783, lng: 31.1859 },
      { id: "fayoum", name: { en: "Fayoum", ar: "الفيوم" }, lat: 29.3084, lng: 30.8428 },
      { id: "edfu", name: { en: "Edfu", ar: "إدفو" }, lat: 24.9790, lng: 32.8734 },
      { id: "esna", name: { en: "Esna", ar: "إسنا" }, lat: 25.2919, lng: 32.5540 },
    ],
  },
  frontiers: {
    center: [28.0, 30.5],
    zoom: 6,
    cities: [
      { id: "siwa", name: { en: "Siwa", ar: "سيوة" }, lat: 29.2032, lng: 25.5195 },
      { id: "dahab", name: { en: "Dahab", ar: "دهب" }, lat: 28.5091, lng: 34.5131 },
      { id: "el-arish", name: { en: "El Arish", ar: "العريش" }, lat: 31.1311, lng: 33.7983 },
      { id: "marsa-matrouh", name: { en: "Marsa Matrouh", ar: "مرسى مطروح" }, lat: 31.3543, lng: 27.2373 },
      { id: "hurghada", name: { en: "Hurghada", ar: "الغردقة" }, lat: 27.2579, lng: 33.8116 },
      { id: "marsa-alam", name: { en: "Marsa Alam", ar: "مرسى علم" }, lat: 25.0693, lng: 34.8990 },
      { id: "quseir", name: { en: "Quseir", ar: "القصير" }, lat: 26.0993, lng: 34.2810 },
    ],
  },
};

const FitBounds = ({ cities }: { cities: CityPoint[] }) => {
  const map = useMap();
  useEffect(() => {
    if (cities.length > 0) {
      const bounds = L.latLngBounds(cities.map((c) => [c.lat, c.lng]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [cities, map]);
  return null;
};

interface RegionMapProps {
  regionId: string;
  color: string;
}

const RegionMap = ({ regionId, color }: RegionMapProps) => {
  const navigate = useNavigate();
  const { lang } = useI18n();
  const config = regionMaps[regionId];
  if (!config) return null;

  return (
    <div className="rounded-xl overflow-hidden border border-border shadow-card" style={{ height: 260 }}>
      <MapContainer
        center={config.center}
        zoom={config.zoom}
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
        <FitBounds cities={config.cities} />
        {config.cities.map((city) => (
          <Marker
            key={city.id}
            position={[city.lat, city.lng]}
            icon={createCityIcon(color)}
            eventHandlers={{ click: () => navigate(`/city/${city.id}`) }}
          >
            <Popup>
              <div className="text-center">
                <strong className="text-sm">{city.name[lang]}</strong>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default RegionMap;
