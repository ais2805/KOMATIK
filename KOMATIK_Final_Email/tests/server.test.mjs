import test from 'node:test';import assert from 'node:assert/strict';
import {createAPI} from '../server/core.mjs';
class MemoryStore{map=new Map();seq=0;async get(k){return structuredClone(this.map.get(k)?.data??null);}async getWithMetadata(k){return structuredClone(this.map.get(k)??null);}async setJSON(k,data,o={}){const old=this.map.get(k);if(o.onlyIfNew&&old||o.onlyIfMatch&&old?.etag!==o.onlyIfMatch)return{modified:false};const etag=String(++this.seq);this.map.set(k,{data:structuredClone(data),etag});return{modified:true,etag};}async list({prefix}){return{blobs:[...this.map.keys()].filter(k=>k.startsWith(prefix)).map(key=>({key}))};}}
function setup(){const store=new MemoryStore(),env={SESSION_SECRET:'x'.repeat(40),TEACHER_PASSWORD:'test-only-password-9381'},api=createAPI({store,env});async function call(body,cookie='',origin='https://komatik.test'){const r=await api(new Request('https://komatik.test/.netlify/functions/api',{method:'POST',headers:{origin,cookie},body:JSON.stringify(body)}));return{status:r.status,body:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]||cookie};}return{call,store,env};}
test('Authentication, cross-device resume, collision control, token recovery, manual grading',async()=>{
 const {call,env}=setup();assert.equal((await call({action:'roster'})).status,401);
 assert.equal((await call({action:'teacher-login',password:'wrong'})).status,401);
 const teacher=await call({action:'teacher-login',password:env.TEACHER_PASSWORD});assert.equal(teacher.status,200);
 const a=await call({action:'create-student',kode:'A01',kelas:'IV-A',nama:'Siswa Satu'},teacher.cookie);assert.equal(a.status,200);assert.ok(a.body.token);
 assert.equal((await call({action:'create-student',kode:'A01',kelas:'IV-A',nama:'Orang Lain'},teacher.cookie)).status,409);
 assert.equal((await call({action:'student-login',kode:'A01',kelas:'IV-A',nama:'',token:a.body.token})).status,400);
 assert.equal((await call({action:'student-login',kode:'A01',kelas:'IV-A',nama:'Orang Lain',token:a.body.token})).status,401);
 const b=await call({action:'create-student',kode:'A02',kelas:'IV-A',nama:'Siswa Dua'},teacher.cookie);
 const login={action:'student-login',kode:'A01',kelas:'IV-A',nama:'Siswa Satu',token:a.body.token};const s1=await call(login),s2=await call(login);assert.equal(s1.status,200);
 assert.equal((await call({action:'roster'},s1.cookie)).status,403);
 const data=s1.body.data;data.progress.materi='done';data.progress.a1='done';data.cursor={a1:3};data.draftAkt={'a2.s1':{tambah12:3}};data.mode='biasa';data.bukaSemua=true;
 const save=await call({action:'save',data,rev:s1.body.rev},s1.cookie);assert.equal(save.status,200);
 assert.equal((await call({action:'save',data:s2.body.data,rev:s2.body.rev},s2.cookie)).status,409);
 const resumed=await call(login);assert.equal(resumed.body.data.progress.a1,'done');assert.equal(resumed.body.data.cursor.a1,3);assert.equal(resumed.body.data.draftAkt['a2.s1'].tambah12,3);assert.equal(resumed.body.data.bukaSemua,false);
 const other=await call({action:'student-login',kode:'A02',kelas:'IV-A',nama:'Siswa Dua',token:b.body.token});assert.deepEqual(other.body.data.progress,{});
 assert.equal((await call({action:'student-detail',id:b.body.id},s1.cookie)).status,403);
 let st=resumed.body;st.data.progress.games='done';let r=await call({action:'save',data:st.data,rev:st.rev},s1.cookie);st.rev=r.body.rev;
 st.data.evaluasi={dikumpulkan:true,jawabanKumpul:Object.fromEntries(Array.from({length:10},(_,i)=>[i+1,{jawaban:'24',alasan:'Alasan awal'}]))};r=await call({action:'save',data:st.data,rev:st.rev},s1.cookie);assert.equal(r.status,200);
 st.data.evaluasi.jawabanKumpul[1].alasan='Diubah';r=await call({action:'save',data:st.data,rev:r.body.rev},s1.cookie);assert.equal(r.body.evaluasi.jawabanKumpul[1].alasan,'Alasan awal');
 assert.equal((await call({action:'save-scores',id:a.body.id,scores:{skor:{1:4}}},s1.cookie)).status,403);
 assert.equal((await call({action:'save-scores',id:a.body.id,scores:{skor:{1:5}},scoreRev:null},teacher.cookie)).status,400);
 assert.equal((await call({action:'save-scores',id:a.body.id,scores:{skor:{1:4},catatan:{},umum:''},scoreRev:null},teacher.cookie)).status,200);
 const detail=await call({action:'student-detail',id:a.body.id},teacher.cookie);assert.equal(detail.body.scores.skor[1],4);
 const reset=await call({action:'reset-token',id:a.body.id},teacher.cookie);assert.equal(reset.status,200);assert.equal((await call({action:'session'},s1.cookie)).status,401);assert.equal((await call(login)).status,401);
 const newLogin=await call({...login,token:reset.body.token});assert.equal(newLogin.status,200);assert.equal(newLogin.body.data.progress.a1,'done');
 const roster=await call({action:'roster'},teacher.cookie);assert.equal(roster.body.students.length,2);assert.ok(!JSON.stringify(roster.body).includes('tokenHash'));
 assert.equal((await call({action:'session'},teacher.cookie,'https://evil.test')).status,403);
 assert.equal((await call({action:'logout'},newLogin.cookie)).status,200);
});
