import { OSM_ATTRIBUTION_TEXT, OSM_COPYRIGHT_URL } from "@/lib/mapTiles";

/** Required OSM attribution for static map previews (same text as the interactive maps). */
const OsmCredit = () => (
  <a href={OSM_COPYRIGHT_URL} target="_blank" rel="noopener noreferrer" dir="ltr"
    className="absolute bottom-0 right-0 bg-background/85 px-1.5 py-0.5 text-[10px] text-muted-foreground">
    {OSM_ATTRIBUTION_TEXT}
  </a>
);
export default OsmCredit;
