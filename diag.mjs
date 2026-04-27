import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {auth:{persistSession:false}});
const d = await import('/dev-server/src/lib/sampleData.ts');
// try inserting causes one by one, find first error
for (let i=0;i<d.causes.length;i++) {
  const c = d.causes[i];
  const row = {
    slug: c.id, title_en: c.title?.en, title_ar: c.title?.ar,
    summary_en: c.summary?.en, summary_ar: c.summary?.ar,
    description_en: c.description?.en, description_ar: c.description?.ar,
    org_name_en: c.org?.name?.en, org_name_ar: c.org?.name?.ar,
    org_founded: c.org?.founded, org_members: c.org?.members ?? 0, org_logo: c.org?.logo,
    image: c.image, region_id: c.regionId, city_id: c.cityId,
    raised: c.raised ?? 0, goal: c.goal ?? 0, supporters: c.supporters ?? 0,
    category_en: c.category?.en, category_ar: c.category?.ar,
  };
  const {error} = await supabase.from('causes').insert(row);
  if (error) { console.log('FAIL at',i,c.id, error.message); console.log(JSON.stringify(row).slice(0,300)); break; }
}
console.log('done');
