import { createClient } from '@supabase/supabase-js';
const url='https://meacccbwpzrrcoanlojw.supabase.co';
const key='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lYWNjY2J3cHpycmNvYW5sb2p3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MjI1OTIsImV4cCI6MjA5MDk5ODU5Mn0.0tiOl8gFP5JEwp8apSWNSDLHHCI-4P1EOQeuAxljV-w';
const a=createClient(url,key), b=createClient(url,key);
const mk=async(c,em)=>{const{data,error}=await c.auth.signUp({email:em,password:'TestPass!2345'});if(error)throw error;return data.user.id};
const u1=await mk(a,`narr-${Date.now()}@example.com`);
const u2=await mk(b,`other-${Date.now()}@example.com`);
console.log('users',u1,u2);
// fake mp3 bytes
const buf=Buffer.concat([Buffer.from([0xff,0xfb,0x90,0x64]),Buffer.alloc(2000)]);
const path=`${u1}/test-${Date.now()}.mp3`;
let r=await a.storage.from('audio-files').upload(path,buf,{contentType:'audio/mpeg'});
console.log('upload own folder:',r.error?('ERR '+r.error.message):'OK');
const audioUrl=a.storage.from('audio-files').getPublicUrl(path).data.publicUrl;
console.log('url',audioUrl);
// non-owner attempts upload into u1 folder
const r2=await b.storage.from('audio-files').upload(`${u1}/hack-${Date.now()}.mp3`,buf,{contentType:'audio/mpeg'});
console.log('non-owner upload into other folder:',r2.error?('BLOCKED '+r2.error.message):'ALLOWED (BAD)');
// tours
const t1=await a.from('audio_tours').insert({creator_id:u1,slug:'zz-test-with-audio-'+Date.now(),title_en:'ZZ Test Tour With Audio',title_ar:'جولة اختبار',city_id:'cairo',duration_minutes:20,stops_count:1,stops:[{label_en:'Stop A',label_ar:'محطة',desc_en:'d',desc_ar:'د',lat:30.0444,lng:31.2357,audio_url:null}],price:0,languages:['en'],audio_url:audioUrl,status:'published'}).select('id,slug').single();
console.log('tour with audio',t1.error?t1.error.message:t1.data);
const t2=await a.from('audio_tours').insert({creator_id:u1,slug:'zz-test-no-audio-'+Date.now(),title_en:'ZZ Test Tour No Audio',title_ar:'جولة بدون صوت',city_id:'cairo',duration_minutes:20,stops_count:1,stops:[{label_en:'Stop B',label_ar:'محطة ب',lat:30.05,lng:31.24,audio_url:null}],price:0,languages:['en'],status:'published'}).select('id,slug').single();
console.log('tour without audio',t2.error?t2.error.message:t2.data);
console.log(JSON.stringify({u1,path,audioUrl,t1:t1.data,t2:t2.data}));
// seeded tours audio count
const{data:seed}=await a.from('audio_tours').select('id,audio_url,stops').not('slug','like','zz-test%');
console.log('seeded tours:',seed.length,'with tour audio:',seed.filter(s=>s.audio_url).length,'with any stop audio:',seed.filter(s=>(s.stops||[]).some(x=>x.audio_url)).length);
