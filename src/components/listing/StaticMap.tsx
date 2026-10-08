import { MapPin } from "lucide-react";
import { mapsUrl } from "@/lib/cityCoords";

/** Real OpenStreetMap preview for a stored coordinate pair + "Open in Google Maps". */
const StaticMap = ({ lat, lng, ar, label, title }: { lat: number; lng: number; ar: boolean; label?: string | null; title: string }) => {
  const bbox = [lng - 0.006, lat - 0.004, lng + 0.006, lat + 0.004].join(",");
  return (
    <>
      <div className="rounded-xl overflow-hidden border border-border h-[200px] bg-muted">
        <iframe title={title} src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`}
          loading="lazy" className="w-full h-full pointer-events-none border-0" tabIndex={-1} />
      </div>
      {label && <p className="mt-2 font-semibold text-foreground">{label}</p>}
      <a href={mapsUrl(lat, lng)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 min-h-[44px] text-sm font-semibold text-primary-dark underline">
        <MapPin className="w-4 h-4" /> {ar ? "افتح في خرائط جوجل" : "Open in Google Maps"}
      </a>
    </>
  );
};

export default StaticMap;
