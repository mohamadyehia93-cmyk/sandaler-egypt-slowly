import {createClient} from '@supabase/supabase-js';
const s=createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
for (const t of ['hero_slides','culture_actors','partners','causes','whos_who','posts','products','organizations','meetups']) {
  const {error}=await s.from(t).delete().not('id','is',null);
  console.log(t, error?error.message:'cleared');
}
