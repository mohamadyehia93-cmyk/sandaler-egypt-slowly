const URL="https://meacccbwpzrrcoanlojw.supabase.co";
const KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lYWNjY2J3cHpycmNvYW5sb2p3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MjI1OTIsImV4cCI6MjA5MDk5ODU5Mn0.0tiOl8gFP5JEwp8apSWNSDLHHCI-4P1EOQeuAxljV-w";
import {createClient} from "@supabase/supabase-js";
const rnd=Math.random().toString(36).slice(2,8);
const mk=()=>createClient(URL,KEY);
async function signup(n){const c=mk();const {data,error}=await c.auth.signUp({email:`reg${rnd}${n}@example.com`,password:"Zq7-marsh-lantern-9142"});if(error)throw error;return {c,uid:data.user.id};}
const prov=await signup("p"), buyer=await signup("b");
const {data:p,error:pe}=await prov.c.from("providers").insert({user_id:prov.uid,role:"service-provider",name_en:"R",name_ar:"R",status:"published",slug:`reg-${rnd}`}).select("id").single();
if(pe)throw pe;
const {data:ex,error:ee}=await prov.c.from("experiences").insert({provider_id:p.id,title_en:"e",title_ar:"e",price:100,status:"published"}).select("id").single();
console.log("experience:",ee?"FAIL "+ee.message:"OK");
const {data:bk,error:be}=await buyer.c.from("bookings").insert({experience_id:ex.id,visitor_id:buyer.uid,guests:2,total_amount_egp:200,platform_fee_egp:30,provider_amount_egp:170}).select("id,status,provider_id").single();
console.log("booking insert:",be?"FAIL "+be.message:JSON.stringify(bk));
if(bk){const a=await prov.c.from("bookings").update({status:"confirmed"}).eq("id",bk.id).select("id,status");console.log("provider accept:",a.error?"FAIL "+a.error.message:JSON.stringify(a.data));}
const {data:pr,error:pre}=await prov.c.from("products").insert({seller_id:p.id,name_en:"pp",name_ar:"pp",price:50,status:"published"}).select("id").single();
console.log("product:",pre?"FAIL "+pre.message:"OK");
const {data:o,error:oe}=await buyer.c.from("orders").insert({product_id:pr.id,buyer_id:buyer.uid,seller_id:prov.uid,quantity:2}).select("id,seller_id,status,total_egp").single();
console.log("order insert:",oe?"FAIL "+oe.message:JSON.stringify(o));
if(o){const c2=await prov.c.from("orders").update({status:"confirmed"}).eq("id",o.id).select("id,status");console.log("seller confirm:",c2.error?"FAIL "+c2.error.message:JSON.stringify(c2.data));}
// cleanup
if(o)await prov.c.from("orders").delete().eq("id",o.id);
await prov.c.from("products").delete().eq("id",pr.id);
if(bk)await prov.c.from("bookings").delete().eq("id",bk.id);
await prov.c.from("experiences").delete().eq("id",ex.id);
console.log("cleanup attempted; provider record",p.id);
