// Seed Supabase tables from sampleData.ts using service role
import { createClient } from '@supabase/supabase-js';

const URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(URL, KEY, { auth: { persistSession: false } });

const data = await import('/dev-server/src/lib/sampleData.ts');
const clean = (a) => (a || []).filter(Boolean);
const heroSlides = clean(data.heroSlides);
const causes = clean(data.causes);
const whosWho = clean(data.whosWho);
const cultureActors = clean(data.cultureActors);
const partnersData = clean(data.partnersData);
const latestPosts = clean(data.latestPosts);
const products = clean(data.products);


const { data: cityRows } = await supabase.from('cities').select('id');
const validCities = new Set((cityRows ?? []).map((c) => c.id));
const cityOk = (id) => (id && validCities.has(id) ? id : null);

const dedupeBySlug = (rows) => {
  const seen = new Set(); const out = [];
  for (const r of rows) { if (!seen.has(r.slug)) { seen.add(r.slug); out.push(r); } }
  return out;
};

async function ins(table, rows) {
  if (!rows.length) return;
  const { error } = await supabase.from(table).insert(rows);
  if (error) { console.error(table, 'ERR', error.message); }
  else console.log(table, 'inserted', rows.length);
}

// hero_slides
await ins('hero_slides', heroSlides.map((h, i) => ({
  title_en: h.title.en, title_ar: h.title.ar,
  subtitle_en: h.subtitle?.en, subtitle_ar: h.subtitle?.ar,
  image: h.image, link: h.link, position: i,
})));

// causes
await ins('causes', dedupeBySlug(causes.map((c) => ({
  slug: c.id,
  title_en: c.title.en, title_ar: c.title.ar,
  summary_en: c.summary?.en, summary_ar: c.summary?.ar,
  description_en: c.description?.en, description_ar: c.description?.ar,
  org_name_en: c.org?.name?.en, org_name_ar: c.org?.name?.ar,
  org_founded: c.org?.founded, org_members: c.org?.members ?? 0, org_logo: c.org?.logo,
  image: c.image, region_id: c.regionId, city_id: cityOk(c.cityId),
  raised: c.raised ?? 0, goal: c.goal ?? 0, supporters: c.supporters ?? 0,
  category_en: c.category?.en, category_ar: c.category?.ar,
}))));

// whos_who
await ins('whos_who', dedupeBySlug(whosWho.map((w) => ({
  slug: w.id,
  name_en: w.name.en, name_ar: w.name.ar,
  role_en: w.role?.en, role_ar: w.role?.ar,
  bio_en: w.bio?.en, bio_ar: w.bio?.ar,
  image: w.image, region_id: w.regionId, city_id: cityOk(w.cityId),
  interests_en: w.interests?.en ?? [], interests_ar: w.interests?.ar ?? [],
  favorite_places_en: w.favoritePlaces?.en ?? [], favorite_places_ar: w.favoritePlaces?.ar ?? [],
  meeting_times_en: w.meetingTimes?.en, meeting_times_ar: w.meetingTimes?.ar,
  languages_en: w.languages?.en ?? [], languages_ar: w.languages?.ar ?? [],
  years_active: w.yearsActive ?? 0,
}))));


// culture_actors
await ins('culture_actors', dedupeBySlug(cultureActors.map((c) => ({
  slug: c.id,
  name_en: c.name.en, name_ar: c.name.ar,
  title_en: c.title?.en, title_ar: c.title?.ar,
  image: c.image, region_id: c.regionId,
  bio_en: c.bio?.en, bio_ar: c.bio?.ar,
  expertise_en: c.expertise?.en ?? [], expertise_ar: c.expertise?.ar ?? [],
  quote_en: c.quote?.en, quote_ar: c.quote?.ar,
  social_links: c.socialLinks ?? {},
}))));

// partners
await ins('partners', dedupeBySlug(partnersData.map((p) => ({
  slug: p.id,
  name_en: p.name.en, name_ar: p.name.ar,
  type_en: p.type?.en, type_ar: p.type?.ar,
  logo: p.logo, color: p.color,
  location_en: p.location?.en, location_ar: p.location?.ar,
  since: p.since,
  impact_label_en: p.impact?.label?.en, impact_label_ar: p.impact?.label?.ar,
  impact_number: p.impact?.number?.toString?.() ?? null,
  projects: p.projects ?? 0,
  about_en: p.about?.en, about_ar: p.about?.ar,
  mission_en: p.mission?.en, mission_ar: p.mission?.ar,
  focus_areas_en: p.focusAreas?.en ?? [], focus_areas_ar: p.focusAreas?.ar ?? [],
  contributions_en: p.contributions?.en ?? [], contributions_ar: p.contributions?.ar ?? [],
}))));

// posts (from latestPosts)
await ins('posts', dedupeBySlug(latestPosts.map((p) => ({
  slug: p.id,
  title_en: p.title.en, title_ar: p.title.ar,
  excerpt_en: p.excerpt?.en, excerpt_ar: p.excerpt?.ar,
  body_en: p.body?.en, body_ar: p.body?.ar,
  category: p.category?.en, image: p.image,
  region_id: p.regionId, city_id: cityOk(p.cityId),
  author_name_en: p.author?.en, author_name_ar: p.author?.ar,
  author_image: p.authorImage, author_role: p.authorRole,
  read_time_minutes: p.readTime ?? 5,
  tags: p.tags ?? [],
}))));

// products
await ins('products', dedupeBySlug(products.map((p) => ({
  slug: p.id,
  name_en: p.title.en, name_ar: p.title.ar,
  description_en: p.description?.en, description_ar: p.description?.ar,
  origin_story_en: p.description?.en, origin_story_ar: p.description?.ar,
  price: p.price ?? 0,
  image: p.image,
  badges: p.badge ? [p.badge.en] : [],
  region_id: p.regionId, city_id: cityOk(p.cityId),
  seller_name_en: p.artisan?.en, seller_name_ar: p.artisan?.ar,
  seller_village_en: p.village?.en, seller_village_ar: p.village?.ar,
}))));

// organizations - build a few from hosts + causes orgs
const orgs = [];
const seen = new Set();
for (const c of causes) {
  const key = c.org?.name?.en;
  if (!key || seen.has(key)) continue;
  seen.add(key);
  orgs.push({
    slug: slug(key),
    name_en: c.org.name.en, name_ar: c.org.name.ar,
    org_type: 'community', logo: c.org.logo,
    region_id: c.regionId, city_id: cityOk(c.cityId),
    description_en: c.summary?.en, description_ar: c.summary?.ar,
    image: c.image,
  });
}
await ins('organizations', orgs);

console.log('done');
