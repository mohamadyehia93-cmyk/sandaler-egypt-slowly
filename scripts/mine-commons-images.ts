/**
 * Mine Wikimedia Commons for freely licensed, RELEVANT photos for seeded content rows.
 *
 * Reads rows with `psql` (read-only), searches Commons, verifies the licence and the
 * subject/city overlap, and writes a SQL migration to
 * supabase/migrations/<ts>_commons_images.sql
 *
 * Run:  bun scripts/mine-commons-images.ts
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, existsSync, readFileSync, writeFileSync } from "node:fs";

const UA = "SandalEgyptTravel/1.0 (https://sandal.lovable.app; images@sandal.app)";
const API = "https://commons.wikimedia.org/w/api.php";
const CACHE_DIR = "/tmp/commons-cache";
mkdirSync(CACHE_DIR, { recursive: true });

const LICENCE_OK =
  /^(cc0|cc[- ]by|public domain|pd|attribution)/i;

const sql = (q: string) => {
  const out = execFileSync("psql", ["-At", "-F", "\u0001", "-c", q], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  return out
    .split("\n")
    .filter(Boolean)
    .map((l) => l.split("\u0001"));
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function api(params: Record<string, string>): Promise<any> {
  const url = `${API}?${new URLSearchParams({ format: "json", origin: "*", ...params })}`;
  const key = `${CACHE_DIR}/${Buffer.from(url).toString("base64url").slice(0, 180)}.json`;
  if (existsSync(key)) return JSON.parse(readFileSync(key, "utf8"));
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
    if (res.ok) {
      const json = await res.json();
      writeFileSync(key, JSON.stringify(json));
      await sleep(180);
      return json;
    }
    await sleep(1200 * (attempt + 1));
  }
  throw new Error(`Commons API failed: ${url}`);
}

type Candidate = {
  title: string;
  url: string;
  fileTitle: string;
  artist: string | null;
  license: string | null;
  licenseUrl: string | null;
  sourceUrl: string | null;
  categories: string[];
  haystack: string;
};

const stripHtml = (s: string | undefined) =>
  s ? s.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : "";

async function search(term: string, limit = 14): Promise<string[]> {
  const json = await api({
    action: "query",
    list: "search",
    srsearch: `filetype:bitmap ${term}`,
    srnamespace: "6",
    srlimit: String(limit),
  });
  return (json?.query?.search || []).map((s: any) => s.title as string);
}

async function details(titles: string[]): Promise<Candidate[]> {
  if (!titles.length) return [];
  const out: Candidate[] = [];
  for (let i = 0; i < titles.length; i += 10) {
    const chunk = titles.slice(i, i + 10);
    const json = await api({
      action: "query",
      titles: chunk.join("|"),
      prop: "imageinfo|categories",
      iiprop: "url|extmetadata",
      iiurlwidth: "1000",
      cllimit: "60",
      clshow: "!hidden",
    });
    const pages = json?.query?.pages || {};
    for (const p of Object.values<any>(pages)) {
      const ii = p.imageinfo?.[0];
      if (!ii) continue;
      const meta = ii.extmetadata || {};
      const license = stripHtml(meta.LicenseShortName?.value) || null;
      if (!license || !LICENCE_OK.test(license)) continue;
      const mime = ii.mime || "";
      if (!/^image\/(jpeg|png|webp)$/.test(mime)) continue;
      const categories: string[] = (p.categories || []).map((c: any) =>
        String(c.title).replace(/^Category:/, ""),
      );
      const fileTitle = String(p.title).replace(/^File:/, "");
      out.push({
        title: p.title,
        url: ii.thumburl || ii.url,
        fileTitle,
        artist: stripHtml(meta.Artist?.value) || null,
        license,
        licenseUrl: meta.LicenseUrl?.value || null,
        sourceUrl: ii.descriptionurl || null,
        categories,
        haystack: `${fileTitle} ${categories.join(" ")} ${stripHtml(meta.ImageDescription?.value)}`.toLowerCase(),
      });
    }
  }
  return out;
}

// ---------------------------------------------------------------- vocabulary

const STOP = new Set(
  ("the a an and or of in on at to for with from your our their his her its by is are be this that " +
    "day days night nights tour tours trip trips experience experiences event events festival " +
    "workshop session sessions expo nights hand made handmade s").split(" "),
);

const topicMap: Record<string, string> = {
  // events
  festival: "festival Egypt celebration",
  exhibition: "exhibition Egypt art",
  concert: "music concert Egypt",
  religious: "mosque church Egypt religious",
  sports: "sport Egypt",
  market: "market souq Egypt",
  cultural: "culture Egypt heritage",
  workshop: "craft workshop Egypt",
  // experience / trip themes
  culinary: "Egyptian food cuisine",
  food: "Egyptian food cuisine",
  craft: "Egyptian handicraft artisan",
  crafts: "Egyptian handicraft artisan",
  heritage: "Egypt heritage monument",
  history: "Egypt archaeology monument",
  nature: "Egypt nature landscape",
  desert: "Egypt desert dunes",
  diving: "Red Sea coral diving",
  beach: "Egypt beach sea",
  nile: "Nile river Egypt",
  agriculture: "Egypt farm agriculture",
  music: "Egyptian music instrument",
  art: "Egyptian art",
  walking: "Egypt street old city",
  wellness: "Egypt spa oasis spring",
  adventure: "Egypt hiking mountain",
  family: "Egypt park garden",
  // transport
  felucca: "felucca Nile sailboat",
  boat: "Nile boat Egypt",
  cruise: "Nile cruise ship",
  ferry: "ferry Egypt",
  bus: "bus Egypt",
  microbus: "microbus Egypt street",
  train: "Egyptian railways train",
  car: "car Egypt road",
  van: "van Egypt road",
  taxi: "taxi Egypt",
  bicycle: "bicycle Egypt",
  camel: "camel Egypt desert",
  horse: "horse carriage Egypt",
  tuktuk: "tuk tuk Egypt",
  // stays
  hotel: "hotel Egypt",
  ecolodge: "ecolodge Egypt mudbrick",
  guesthouse: "guesthouse Egypt courtyard",
  homestay: "Egyptian village house",
  camp: "desert camp Egypt",
  apartment: "apartment Egypt building",
  hostel: "hostel Egypt",
  // products
  textile: "Egyptian textile weaving",
  pottery: "Egyptian pottery",
  jewelry: "Egyptian jewellery silver",
  leather: "Egyptian leather craft",
  wood: "Egyptian woodwork mashrabiya",
  glass: "Egyptian handmade glass",
  spices: "Egyptian spices market",
  dates: "Egyptian dates palm",
  honey: "honey jar",
  soap: "handmade soap",
  basket: "palm basket weaving",
  carpet: "Egyptian carpet kilim",
  copper: "Egyptian copper craft",
};

const tokens = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z\u0600-\u06ff\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP.has(w));

// ---------------------------------------------------------------- data load

type City = { id: string; en: string; ar: string; gov: string };
const cities = new Map<string, City>();
for (const [id, en, ar, gov] of sql(
  "select id, name_en, coalesce(name_ar,''), coalesce(governorate_en,'') from cities",
)) {
  cities.set(id, { id, en, ar, gov });
}

const creditRows = new Map<string, Candidate>();
const creditUsage = new Map<string, string>();
const updates: string[] = [];

function esc(s: string) {
  return s.replace(/'/g, "''");
}

function pick(
  cands: Candidate[],
  subjectTokens: string[],
  city: City | undefined,
  used: Set<string>,
): Candidate[] {
  const scored = cands
    .filter((c) => !used.has(c.url))
    .map((c) => {
      let score = 0;
      const cityHit =
        !!city &&
        (c.haystack.includes(city.en.toLowerCase()) ||
          (!!city.gov && c.haystack.includes(city.gov.toLowerCase())));
      const subjHits = subjectTokens.filter((t) => c.haystack.includes(t)).length;
      if (cityHit) score += 3;
      score += subjHits * 2;
      if (c.haystack.includes("egypt")) score += 1;
      return { c, score, ok: cityHit || subjHits > 0 };
    })
    .filter((s) => s.ok)
    .sort((a, b) => b.score - a.score);
  return scored.map((s) => s.c);
}

const cityFallbackCache = new Map<string, Candidate[]>();
async function cityFallback(city: City | undefined): Promise<Candidate[]> {
  if (!city) return [];
  if (cityFallbackCache.has(city.id)) return cityFallbackCache.get(city.id)!;
  const titles = await search(`${city.en} Egypt`, 16);
  const cands = await details(titles);
  const ranked = pick(cands, tokens(city.en), city, new Set());
  cityFallbackCache.set(city.id, ranked);
  return ranked;
}

type Target = {
  table: string;
  titleCol: string;
  topicCols: string[];
  hasImages: boolean;
  cityCol?: string;
  extraCols?: string[];
};

const targets: Target[] = [
  { table: "experiences", titleCol: "title_en", topicCols: ["theme"], hasImages: true, cityCol: "city_id" },
  { table: "trips", titleCol: "title_en", topicCols: ["theme", "trip_type"], hasImages: true, cityCol: "city_id" },
  { table: "events", titleCol: "title_en", topicCols: ["category"], hasImages: false, cityCol: "city_id" },
  { table: "accommodations", titleCol: "name_en", topicCols: ["accommodation_type"], hasImages: true, cityCol: "city_id" },
  { table: "transport", titleCol: "name_en", topicCols: ["transport_type", "from_en", "to_en"], hasImages: true, cityCol: "city_id" },
  { table: "audio_tours", titleCol: "title_en", topicCols: ["theme"], hasImages: false, cityCol: "city_id" },
  { table: "posts", titleCol: "title_en", topicCols: ["category"], hasImages: true, cityCol: "city_id" },
  { table: "causes", titleCol: "title_en", topicCols: ["category_en"], hasImages: false, cityCol: "city_id" },
  { table: "products", titleCol: "name_en", topicCols: ["category"], hasImages: true, cityCol: "city_id" },
];

const stats: Record<string, { subject: number; fallback: number; none: number }> = {};

for (const t of targets) {
  stats[t.table] = { subject: 0, fallback: 0, none: 0 };
  const cols = ["id", t.titleCol, t.cityCol || "null", ...t.topicCols.map((c) => `coalesce(${c}::text,'')`)];
  const rows = sql(
    `select ${cols.join(", ")} from ${t.table} where image like '%unsplash%' order by id`,
  );
  console.log(`${t.table}: ${rows.length} rows to re-image`);
  for (const r of rows) {
    const [id, title, cityId, ...topics] = r;
    const city = cities.get(cityId);
    const topicTerms = topics
      .flatMap((v) => (v ? [topicMap[v.toLowerCase()] || v] : []))
      .join(" ");
    const subjectTokens = Array.from(
      new Set([...tokens(topicTerms), ...tokens(title)]),
    );

    // Commons search ANDs all terms — keep every query to <=3 words or it returns nothing.
    const topicWords = tokens(topicTerms);
    const queries = Array.from(
      new Set(
        [
          city && topicWords[0] ? `${city.en} ${topicWords[0]}` : "",
          topicWords.slice(0, 2).length ? `${topicWords.slice(0, 2).join(" ")} Egypt` : "",
          city ? `${city.en} Egypt` : "",
        ].filter(Boolean),
      ),
    );

    const used = new Set<string>();
    let chosen: Candidate[] = [];
    for (const q of queries) {
      if (chosen.length >= (t.hasImages ? 3 : 1)) break;
      const cands = await details(await search(q));
      for (const c of pick(cands, subjectTokens, city, used)) {
        if (chosen.some((x) => x.url === c.url)) continue;
        chosen.push(c);
        used.add(c.url);
        if (chosen.length >= (t.hasImages ? 3 : 1)) break;
      }
    }

    let kind: "subject" | "fallback" | "none" = chosen.length ? "subject" : "none";
    if (!chosen.length) {
      const fb = await cityFallback(city);
      if (fb.length) {
        chosen = fb.slice(0, t.hasImages ? 2 : 1);
        kind = "fallback";
      }
    }
    stats[t.table][kind]++;
    if (!chosen.length) continue;

    const usedFor = `${t.table}: ${title}`;
    for (const c of chosen) {
      if (!creditRows.has(c.url)) creditRows.set(c.url, { ...c, fileTitle: c.fileTitle });
      creditUsage.set(c.url, (creditUsage.get(c.url) || usedFor));
    }
    const gallery = t.hasImages
      ? `, images = array[${chosen.map((c) => `'${esc(c.url)}'`).join(",")}]::text[]`
      : "";
    updates.push(
      `update public.${t.table} set image = '${esc(chosen[0].url)}'${gallery} where id = '${id}';`,
    );
  }
}

// ---------------------------------------------------------------- write SQL
const ts = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);
const parts: string[] = [
  "-- Relevant, freely licensed Wikimedia Commons photography for seeded content rows.",
  "-- Generated by scripts/mine-commons-images.ts",
  "",
];
parts.push(...updates, "");
for (const [url, c] of creditRows) {
  parts.push(
    `insert into public.image_credits (image_url, file_title, artist, license, license_url, source_url, used_for) ` +
      `select '${esc(url)}', '${esc(c.fileTitle)}', ${c.artist ? `'${esc(c.artist)}'` : "null"}, ` +
      `${c.license ? `'${esc(c.license)}'` : "null"}, ${c.licenseUrl ? `'${esc(c.licenseUrl)}'` : "null"}, ` +
      `${c.sourceUrl ? `'${esc(c.sourceUrl)}'` : "null"}, '${esc(creditUsage.get(url) || "content photography")}' ` +
      `where not exists (select 1 from public.image_credits ic where ic.image_url = '${esc(url)}');`,
  );
}

const outFile = `supabase/migrations/${ts}_commons_content_images.sql`;
writeFileSync(outFile, parts.join("\n") + "\n");
console.log(JSON.stringify(stats, null, 2));
console.log(`\nWrote ${updates.length} updates, ${creditRows.size} credits -> ${outFile}`);
