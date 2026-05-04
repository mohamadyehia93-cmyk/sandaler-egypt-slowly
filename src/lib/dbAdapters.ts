// Shim DB rows back into the legacy bilingual shape used by sample-data pages.
// Strongly typed against the generated Supabase row types so merged results
// (DB + sample fallbacks) stay type-safe across the app.
import type { Database } from "@/integrations/supabase/types";

type Row<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type Bilingual = { en: string; ar: string };
export type BilingualList = { en: string[]; ar: string[] };

export interface LegacyCause {
  id: string;
  title: Bilingual;
  summary: Bilingual;
  description: Bilingual;
  org: {
    name: Bilingual;
    founded: string | null;
    members: number | null;
    logo: string | null;
  };
  image: string | null;
  regionId: string | null;
  cityId: string | null;
  raised: number | null;
  goal: number | null;
  supporters: number | null;
  category: Bilingual;
}

export interface LegacyPerson {
  id: string;
  name: Bilingual;
  role: Bilingual;
  bio: Bilingual;
  image: string | null;
  regionId: string | null;
  cityId: string | null;
  interests: BilingualList;
  favoritePlaces: BilingualList;
  meetingTimes: Bilingual;
  languages: BilingualList;
  yearsActive: number | null;
}

export interface LegacyPartner {
  id: string;
  name: Bilingual;
  type: Bilingual;
  logo: string | null;
  color: string | null;
  location: Bilingual;
  since: number | null;
  impact: { label: Bilingual; number: string | null };
  projects: number | null;
  about: Bilingual;
  mission: Bilingual;
  focusAreas: BilingualList;
  contributions: BilingualList;
}

export interface LegacyPost {
  id: string;
  title: Bilingual;
  excerpt: Bilingual;
  body: Bilingual;
  category: Bilingual;
  image: string | null;
  regionId: string | null;
  cityId: string | null;
  author: Bilingual;
  authorId: string | null;
  authorImage: string | null;
  authorRole: string | null;
  date: string;
  readTime: number | null;
  tags: string[];
}

const bi = (en: string | null | undefined, ar: string | null | undefined): Bilingual => ({
  en: en ?? "",
  ar: ar ?? "",
});
const biList = (
  en: string[] | null | undefined,
  ar: string[] | null | undefined,
): BilingualList => ({ en: en ?? [], ar: ar ?? [] });

export function dbToLegacyCause(r: Row<"causes"> | null | undefined): LegacyCause | null {
  if (!r) return null;
  return {
    id: r.slug || r.id,
    title: bi(r.title_en, r.title_ar),
    summary: bi(r.summary_en, r.summary_ar),
    description: bi(r.description_en, r.description_ar),
    org: {
      name: bi(r.org_name_en, r.org_name_ar),
      founded: r.org_founded,
      members: r.org_members,
      logo: r.org_logo,
    },
    image: r.image,
    regionId: r.region_id,
    cityId: r.city_id,
    raised: r.raised,
    goal: r.goal,
    supporters: r.supporters,
    category: bi(r.category_en, r.category_ar),
  };
}

export function dbToLegacyPerson(r: Row<"whos_who"> | null | undefined): LegacyPerson | null {
  if (!r) return null;
  return {
    id: r.slug || r.id,
    name: bi(r.name_en, r.name_ar),
    role: bi(r.role_en, r.role_ar),
    bio: bi(r.bio_en, r.bio_ar),
    image: r.image,
    regionId: r.region_id,
    cityId: r.city_id,
    interests: biList(r.interests_en, r.interests_ar),
    favoritePlaces: biList(r.favorite_places_en, r.favorite_places_ar),
    meetingTimes: bi(r.meeting_times_en, r.meeting_times_ar),
    languages: biList(r.languages_en, r.languages_ar),
    yearsActive: r.years_active,
  };
}

export function dbToLegacyPartner(r: Row<"partners"> | null | undefined): LegacyPartner | null {
  if (!r) return null;
  return {
    id: r.slug || r.id,
    name: bi(r.name_en, r.name_ar),
    type: bi(r.type_en, r.type_ar),
    logo: r.logo,
    color: r.color,
    location: bi(r.location_en, r.location_ar),
    since: r.since,
    impact: {
      label: bi(r.impact_label_en, r.impact_label_ar),
      number: r.impact_number,
    },
    projects: r.projects,
    about: bi(r.about_en, r.about_ar),
    mission: bi(r.mission_en, r.mission_ar),
    focusAreas: biList(r.focus_areas_en, r.focus_areas_ar),
    contributions: biList(r.contributions_en, r.contributions_ar),
  };
}

export function dbToLegacyPost(r: Row<"posts"> | null | undefined): LegacyPost | null {
  if (!r) return null;
  return {
    id: r.slug || r.id,
    title: bi(r.title_en, r.title_ar),
    excerpt: bi(r.excerpt_en, r.excerpt_ar),
    body: bi(r.body_en, r.body_ar),
    category: bi(r.category, r.category),
    image: r.image,
    regionId: r.region_id,
    cityId: r.city_id,
    author: bi(r.author_name_en, r.author_name_ar),
    authorId: r.author_id,
    authorImage: r.author_image,
    authorRole: r.author_role,
    date: r.created_at,
    readTime: r.read_time_minutes,
    tags: r.tags ?? [],
  };
}
