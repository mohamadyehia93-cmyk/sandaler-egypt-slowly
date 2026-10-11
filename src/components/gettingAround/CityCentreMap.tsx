import { MapContainer, Marker, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { AppTileLayer } from "@/lib/mapTiles";

const WIDE = new Set(["siwa", "marsa-alam", "hurghada"]);
const pin = L.divIcon({
  className: "",
  html: '<span style="display:block;width:18px;height:18px;border-radius:9999px;background:hsl(var(--primary));border:3px solid hsl(var(--background));box-shadow:0 1px 4px rgba(0,0,0,.35)"></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

/** City-centre map for Getting Around; renders nothing without real coordinates. */
const CityCentreMap = ({ cityId, lat, lng, nameEn, title }: { cityId: string; lat: number; lng: number; nameEn: string; title: string }) => (
  <div className="rounded-xl overflow-hidden border border-border h-64 md:h-80" dir="ltr" aria-label={title}>
    <MapContainer center={[lat, lng]} zoom={WIDE.has(cityId) ? 10 : 12} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
      <AppTileLayer />
      <Marker position={[lat, lng]} icon={pin}>
        <Tooltip direction="top" offset={[0, -10]}>{nameEn}</Tooltip>
      </Marker>
    </MapContainer>
  </div>
);

export default CityCentreMap;
