import {createClient} from '@supabase/supabase-js';
const s=createClient(process.env.VITE_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
const {data}=await s.from('hero_slides').select('id,title_en,created_at').order('created_at');
const seen=new Set();const del=[];
for(const r of data){if(seen.has(r.title_en))del.push(r.id);else seen.add(r.title_en);}
console.log('deleting',del.length);
if(del.length){const {error}=await s.from('hero_slides').delete().in('id',del);console.log(error?.message||'ok');}
