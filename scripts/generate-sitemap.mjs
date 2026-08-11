import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { DEFAULT_SITE_URL } from "../site.config.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PUBLIC = join(ROOT, "public");
// Single source of truth: VITE_SITE_URL, else site.config.mjs fallback.
const BASE_URL = (process.env.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, "");

const REGION_SLUGS = [
  "nile-delta",
  "suez-canal",
  "upper-egypt",
  "frontiers",
];

const staticRoutes = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/audio-tours", changefreq: "daily", priority: "0.9" },
  { path: "/trips", changefreq: "daily", priority: "0.9" },
  { path: "/causes", changefreq: "weekly", priority: "0.8" },
  { path: "/people", changefreq: "weekly", priority: "0.7" },
  { path: "/posts", changefreq: "daily", priority: "0.8" },
  { path: "/login", changefreq: "monthly", priority: "0.3" },
  { path: "/signup", changefreq: "monthly", priority: "0.3" },
  ...REGION_SLUGS.map((slug) => ({
    path: `/regions/${slug}`,
    changefreq: "weekly",
    priority: "0.9",
  })),
];

// No <lastmod>: there is no page-specific modification timestamp available here,
// and generation time is not a valid substitute.
const urlEntries = staticRoutes
  .map(
    ({ path, changefreq, priority }) => `
  <url>
    <loc>${BASE_URL}${path}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${BASE_URL}${path}"/>
    <xhtml:link rel="alternate" hreflang="ar" href="${BASE_URL}${path}?lang=ar"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}${path}"/>
  </url>`
  )
  .join("");

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
>${urlEntries}
</urlset>
`;

mkdirSync(PUBLIC, { recursive: true });
writeFileSync(join(PUBLIC, "sitemap.xml"), sitemap, "utf-8");
console.log(`✓ sitemap.xml generated with ${staticRoutes.length} URLs`);
