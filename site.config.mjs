// Single source of truth for the site origin fallback.
// Shared by the Vite app (src/lib/siteUrl.ts) and the sitemap generator
// (scripts/generate-sitemap.mjs). Override at build time with VITE_SITE_URL.
export const DEFAULT_SITE_URL = "https://sandal.lovable.app";
