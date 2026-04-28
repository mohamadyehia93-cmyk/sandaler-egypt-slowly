// Shim DB rows back into the legacy bilingual shape used by sample-data pages
export const dbToLegacyCause = (r: Record<string, unknown>) => r && ({
  id: r.slug || r.id,
  title: { en: r.title_en, ar: r.title_ar },
  summary: { en: r.summary_en, ar: r.summary_ar },
  description: { en: r.description_en, ar: r.description_ar },
  org: {
    name: { en: r.org_name_en, ar: r.org_name_ar },
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
  category: { en: r.category_en, ar: r.category_ar },
});

export const dbToLegacyPerson = (r: Record<string, unknown>) => r && ({
  id: r.slug || r.id,
  name: { en: r.name_en, ar: r.name_ar },
  role: { en: r.role_en, ar: r.role_ar },
  bio: { en: r.bio_en, ar: r.bio_ar },
  image: r.image,
  regionId: r.region_id,
  cityId: r.city_id,
  interests: { en: r.interests_en ?? [], ar: r.interests_ar ?? [] },
  favoritePlaces: { en: r.favorite_places_en ?? [], ar: r.favorite_places_ar ?? [] },
  meetingTimes: { en: r.meeting_times_en, ar: r.meeting_times_ar },
  languages: { en: r.languages_en ?? [], ar: r.languages_ar ?? [] },
  yearsActive: r.years_active,
});

export const dbToLegacyPartner = (r: Record<string, unknown>) => r && ({
  id: r.slug || r.id,
  name: { en: r.name_en, ar: r.name_ar },
  type: { en: r.type_en, ar: r.type_ar },
  logo: r.logo,
  color: r.color,
  location: { en: r.location_en, ar: r.location_ar },
  since: r.since,
  impact: {
    label: { en: r.impact_label_en, ar: r.impact_label_ar },
    number: r.impact_number,
  },
  projects: r.projects,
  about: { en: r.about_en, ar: r.about_ar },
  mission: { en: r.mission_en, ar: r.mission_ar },
  focusAreas: { en: r.focus_areas_en ?? [], ar: r.focus_areas_ar ?? [] },
  contributions: { en: r.contributions_en ?? [], ar: r.contributions_ar ?? [] },
});

export const dbToLegacyPost = (r: Record<string, unknown>) => r && ({
  id: r.slug || r.id,
  title: { en: r.title_en, ar: r.title_ar },
  excerpt: { en: r.excerpt_en, ar: r.excerpt_ar },
  body: { en: r.body_en, ar: r.body_ar },
  category: { en: r.category, ar: r.category },
  image: r.image,
  regionId: r.region_id,
  cityId: r.city_id,
  author: { en: r.author_name_en, ar: r.author_name_ar },
  authorId: r.author_id,
  authorImage: r.author_image,
  authorRole: r.author_role,
  date: r.created_at,
  readTime: r.read_time_minutes,
  tags: r.tags ?? [],
});
