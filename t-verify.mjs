const URL="https://meacccbwpzrrcoanlojw.supabase.co";
const KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lYWNjY2J3cHpycmNvYW5sb2p3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MjI1OTIsImV4cCI6MjA5MDk5ODU5Mn0.0tiOl8gFP5JEwp8apSWNSDLHHCI-4P1EOQeuAxljV-w";
import {createClient} from "@supabase/supabase-js";
const mk=()=>createClient(URL,KEY);
const rnd=Math.random().toString(36).slice(2,8);
async function user(n){const c=mk();const email=`own${rnd}${n}@example.com`;
 let {data,error}=await c.auth.signUp({email,password:"Passw0rd!234"});
 if(error)throw error;
 const uid=data.user.id;
 const {data:p,error:pe}=await c.from("providers").insert({user_id:uid,role:"product-seller",name_en:"T"+n,name_ar:"T"+n,status:"published",slug:`t-${rnd}-${n}`}).select("id").single();
 if(pe)throw new Error("provider insert: "+pe.message);
 return {c,uid,pid:p.id};}
const A=await user(1),B=await user(2);
console.log("A",A.pid,"B",B.pid);
const tables={accommodations:["host_id",{name_en:"a",name_ar:"a",price_per_night:100}],transport:["provider_id",{name_en:"t",name_ar:"t",price:10}],products:["seller_id",{name_en:"p",name_ar:"p",price:10}],trips:["organizer_id",{name_en:"tr",name_ar:"tr",title_en:"tr",title_ar:"tr",price:10}]};
const made={};
for(const [t,[col,base]] of Object.entries(tables)){
 const body={...base,[col]:A.pid,status:"draft"};
 if(t==="products"){delete body.title_en;delete body.title_ar;}
 if(t==="trips"){delete body.name_en;delete body.name_ar;}
 const {data,error}=await A.c.from(t).insert(body).select("id").single();
 console.log(`A insert ${t}:`,error?("FAIL "+error.message):("OK "+data.id));
 if(data)made[t]=[col,data.id];
 // A update own
 if(data){const u=await A.c.from(t).update({status:"draft"}).eq("id",data.id).select("id");console.log(` A update own ${t}:`,u.error?"FAIL "+u.error.message:"OK "+u.data.length);}
 // B insert owned by A
 const bi=await B.c.from(t).insert(body).select("id");
 console.log(` B insert as A ${t}:`,bi.error?"BLOCKED "+bi.error.code:"LEAK "+JSON.stringify(bi.data));
 if(data){
  const bu=await B.c.from(t).update({status:"published"}).eq("id",data.id).select("id");
  console.log(` B update A row ${t}:`,bu.error?"BLOCKED "+bu.error.code:(bu.data.length?"LEAK":"BLOCKED 0rows"));
  const br=await B.c.from(t).update({[col]:B.pid}).eq("id",data.id).select("id");
  console.log(` B reassign ${t}:`,br.error?"BLOCKED "+br.error.code:(br.data.length?"LEAK":"BLOCKED 0rows"));
  const bd=await B.c.from(t).delete().eq("id",data.id).select("id");
  console.log(` B delete A row ${t}:`,bd.error?"BLOCKED "+bd.error.code:(bd.data.length?"LEAK":"BLOCKED 0rows"));
  const anon=mk();const ai=await anon.from(t).insert(body).select("id");
  console.log(` anon insert ${t}:`,ai.error?"BLOCKED "+ai.error.code:"LEAK");
 }
}
globalThis.__ctx={A,B,made};
// A delete own
for(const [t,[col,id]] of Object.entries(made)){const d=await A.c.from(t).delete().eq("id",id).select("id");console.log(`A delete own ${t}:`,d.error?"FAIL "+d.error.message:"OK "+d.data.length);}
console.log("USERS",A.uid,B.uid,A.pid,B.pid);
