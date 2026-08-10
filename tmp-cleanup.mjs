import { createClient } from '@supabase/supabase-js';
const url='https://meacccbwpzrrcoanlojw.supabase.co';
const key='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lYWNjY2J3cHpycmNvYW5sb2p3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MjI1OTIsImV4cCI6MjA5MDk5ODU5Mn0.0tiOl8gFP5JEwp8apSWNSDLHHCI-4P1EOQeuAxljV-w';
const c=createClient(url,key);
await c.auth.signInWithPassword({email:process.argv[2],password:'TestPass!2345'});
const uid='3d83b0bd-2900-4f7c-9377-c581d7d7f58b';
console.log('del tours', (await c.from('audio_tours').delete().like('slug','zz-test%').select('id')).error?.message ?? 'ok');
console.log('del file', (await c.storage.from('audio-files').remove(['3d83b0bd-2900-4f7c-9377-c581d7d7f58b/test-1786382935391.mp3'])).error?.message ?? 'ok');
console.log('remaining', (await c.from('audio_tours').select('id').like('slug','zz-test%')).data);
