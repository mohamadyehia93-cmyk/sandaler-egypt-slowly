import siwaMan from "@/assets/siwa-man.jpg";

/**
 * Central map of region id -> hero/avatar image asset.
 * If a region id is not present here, the UI should fall back
 * to the region's emoji from sampleData.
 */
export const regionImageMap: Record<string, string> = {
  frontiers: siwaMan,
};

export const getRegionImage = (regionId: string): string | null =>
  regionImageMap[regionId] ?? null;
