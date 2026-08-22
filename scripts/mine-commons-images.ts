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

// Subjects that must never illustrate travel content, plus foreign look-alike places
// ("Egypt, Pennsylvania", "IndoSuez, Madrid") and historical prints/scans.
const BAD_SUBJECT =
  /(bombing|attack|cholera|epidemic|plague|funeral|war|battle|riot|protest|crash|wreck|disaster|cemetery|grave|tomb of the unknown|manuscript|lithograph|engraving|btv1b|carte |map of|postcard|stamp|banknote|coin|drawing|painting|poster|pennsylvania|\bpa\b|madrid|spain|espa|france|paris|turkey|turc|greece|israel|iraq|sudan|libya|jordan|syria|india|indonesia|brazil|mexico|18[0-9]{2}|19[0-4][0-9])/i;


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
      iiprop: "url|mime|extmetadata",
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
      const desc = stripHtml(meta.ImageDescription?.value);
      const blob = `${fileTitle} ${categories.join(" ")} ${desc}`;
      // Maps, diagrams, flags, coats of arms and logos are never good content photos.
      if (/(map|maps|خريطة|diagram|chart|flag|coat of arms|logo|seal|plan of|blank|locator)/i.test(blob))
        continue;
      if (BAD_SUBJECT.test(blob)) continue;
      // Reject historical prints and scans: keep photographs from 1990 onwards.
      const year = Number(
        (stripHtml(meta.DateTimeOriginal?.value) || "").match(/(1[89]\d{2}|20\d{2})/)?.[1],
      );
      if (year && year < 1990) continue;

      out.push({
        title: p.title,
        url: String(ii.thumburl || ii.url).split("?")[0],
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
const perTable: Record<string, { id: string; urls: string[]; hasImages: boolean }[]> = {};

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
      const egyptian = /egypt|مصر|nile|sinai|cairo|nubia/.test(c.haystack);
      if (cityHit) score += 3;
      score += subjHits * 2;
      if (egyptian) score += 1;
      // Every accepted photo must be anchored in Egypt: either the row's own city,
      // or a subject match on an Egypt-tagged file.
      return { c, score, ok: (cityHit && egyptian) || (subjHits > 0 && egyptian) };

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
    (perTable[t.table] ||= []).push({ id, urls: chosen.map((c) => c.url), hasImages: t.hasImages });
  }
}

// ---------------------------------------------------------------- write SQL
// Payload compaction: Commons thumbnail URLs repeat the file name twice, so store
// `t:<h>/<hh>/<name>` and rebuild the full thumb URL in SQL. `o:<path>` = literal path.
const PFX = "https://upload.wikimedia.org/wikipedia/commons/";
const short = (u: string) => {
  const p = u.startsWith(PFX) ? u.slice(PFX.length) : u;
  const m = p.match(/^thumb\/(.)\/(..)\/([^/]+)\/1280px-([^/]+)$/);
  return m && m[3] === m[4] ? `t:${m[1]}/${m[2]}/${m[3]}` : `o:${p}`;
};
// Expands one short code back into an absolute Commons URL.
const EXPAND = (x: string) =>
  `(case when left(${x},2)='t:' then '${PFX}thumb/'||substr(${x},3)||'/1280px-'||split_part(substr(${x},3),'/',3) ` +
  `else '${PFX}'||substr(${x},3) end)`;

const ts = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);
const parts: string[] = [
  "-- Relevant, freely licensed Wikimedia Commons photography for seeded content rows.",
  "-- Generated by scripts/mine-commons-images.ts",
  "",
];

for (const [table, rows] of Object.entries(perTable)) {
  const hasImages = rows[0].hasImages;
  for (let i = 0; i < rows.length; i += 40) {
    const values = rows
      .slice(i, i + 40)
      .map((r) => `('${r.id}','${esc(r.urls.map(short).join("|"))}')`)
      .join(",");
    const gallery = hasImages
      ? `, images = (select array_agg(${EXPAND("x")}) from unnest(string_to_array(v.u,'|')) x)`
      : "";
    parts.push(
      `update public.${table} t set image = ${EXPAND("split_part(v.u,'|',1)")}${gallery} ` +
        `from (values ${values}) v(id,u) where t.id = v.id::uuid;`,
    );
  }
}
parts.push("");


const credits = Array.from(creditRows.entries());
for (let i = 0; i < credits.length; i += 40) {
  const values = credits
    .slice(i, i + 40)
    .map(([url, c]) =>
      `('${esc(short(url))}','${esc(c.fileTitle)}',${c.artist ? `'${esc(c.artist)}'` : "null"},` +
      `${c.license ? `'${esc(c.license)}'` : "null"},${c.licenseUrl ? `'${esc(c.licenseUrl)}'` : "null"},` +
      `'${esc(creditUsage.get(url) || "content photography")}')`,
    )
    .join(",");
  parts.push(
    `insert into public.image_credits (image_url, file_title, artist, license, license_url, source_url, used_for) ` +
      `select ${EXPAND("v.u")}, v.ft, v.ar, v.li, v.lu, 'https://commons.wikimedia.org/wiki/File:'||replace(v.ft,' ','_'), v.uf ` +
      `from (values ${values}) v(u,ft,ar,li,lu,uf) ` +
      `where not exists (select 1 from public.image_credits ic where ic.image_url = ${EXPAND("v.u")});`,
  );
}

const outFile = `supabase/migrations/${ts}_commons_content_images.sql`;
writeFileSync(outFile, parts.join("\n") + "\n");
console.log(JSON.stringify(stats, null, 2));
console.log(`\nWrote ${Object.values(perTable).reduce((a, b) => a + b.length, 0)} rows, ${creditRows.size} credits -> ${outFile}`);

// Also emit a JSON payload used by the one-off apply function (scripts/apply-images.ts).
writeFileSync(
  "/tmp/commons-images.json",
  JSON.stringify({
    tables: Object.fromEntries(
      Object.entries(perTable).map(([t, rows]) => [
        t,
        rows.map((r) => ({ id: r.id, image: r.urls[0], images: r.hasImages ? r.urls : null })),
      ]),
    ),
    credits: Array.from(creditRows.entries()).map(([url, c]) => ({
      image_url: url,
      file_title: c.fileTitle,
      artist: c.artist,
      license: c.license,
      license_url: c.licenseUrl,
      source_url: c.sourceUrl,
      used_for: creditUsage.get(url) || "content photography",
    })),
  }),
);
