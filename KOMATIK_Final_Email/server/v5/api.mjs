import {randomBytes,randomInt,createHash,createHmac,scryptSync,timingSafeEqual} from 'node:crypto';
import {newState,normalize} from '../../public/core.js';
import {quiz,missions,evaluation} from '../../public/content.js';
const hash=x=>createHash('sha256').update(String(x)).digest('hex');
const eq=(a,b)=>{const x=Buffer.from(String(a)),y=Buffer.from(String(b));return x.length===y.length&&timingSafeEqual(x,y)};
const norm=x=>String(x||'').trim().replace(/\s+/g,' ').toUpperCase();
const bad=(message,status=400)=>{throw Object.assign(new Error(message),{status})};
const redact=x=>Array.isArray(x)?x.map(redact):x&&typeof x==='object'?Object.fromEntries(Object.entries(x).filter(([k])=>!/(token|password|secret|credential|api.?key)/i.test(k)&&!['salt','ver'].includes(k)).map(([k,v])=>[k,redact(v)])):x;
const now=()=>new Date().toISOString();
const uid=()=>randomBytes(32).toString('hex');
const stages=['materi','a1','a2','a3','a4','kuis','game','evaluasi'];
const fields={a1:['sort0','sort1','sort2','sort3','sort4','small','guess','reason'],a2:['diff1','diff2','relation','row4','row5','fix','down1','down2','down4','down5','downReason'],a3:['rule','proof','row6','transfer','compare'],a4:['debug','conclusion','reflection']};
const filled=x=>typeof x==='string'&&x.trim().length>0&&x.length<=6000;
export const points=a=>a?.[0]?.correct?10:a?.[1]?.correct?7:0;
export function objective(stage,d){if(stage==='a1')return [0,1,2,3].every(i=>d['sort'+i]==='diketahui')&&d.sort4==='ditanyakan';if(stage==='a2')return ['diff1','diff2','row4','row5','down1','down2','down4','down5'].every((k,i)=>Number(d[k])===[4,4,18,22,5,5,20,15][i]);if(stage==='a3')return !d.info0&&!d.info1&&d.info2&&d.info3&&d.info4&&Number(d.row6)===26;if(stage==='a4')return JSON.stringify(d.order)===JSON.stringify([4,1,3,0,2]);return false;}
function clean(d,old,profil,open){
 if(!d||typeof d!=='object'||!d.drafts||!d.records||!d.quiz||!d.game||!d.evaluation||!Array.isArray(d.done))bad('Struktur progres tidak sesuai.');
 const out=structuredClone(old);out.student={code:profil.kode,name:profil.nama,className:profil.kelas};
 out.settings={sound:!!d.settings?.sound,motion:d.settings?.motion!==false};out.mode=['petualangan','serius'].includes(d.mode)?d.mode:old.mode;
 out.lastRoute=['beranda','lab','materi','aktivitas','a1','a2','a3','a4','kuis','game','evaluasi','profil'].includes(d.lastRoute)?d.lastRoute:'beranda';
 if(!open.activities){if(JSON.stringify(d.done)!==JSON.stringify(old.done)||JSON.stringify(d.records)!==JSON.stringify(old.records)||JSON.stringify(d.quiz)!==JSON.stringify(old.quiz)||JSON.stringify(d.game)!==JSON.stringify(old.game))bad('Aktivitas sedang ditutup guru.',423);}
 out.drafts=d.drafts;
 out.records={...old.records};
 for(const stage of ['video','lab'])if(Array.isArray(d.records[stage]))out.records[stage]=d.records[stage].slice(-300);
 for(const stage of Object.keys(fields)){
  const r=d.records[stage];if(!r)continue;
  const prior=stages[stages.indexOf(stage)-1];if(!old.done.includes(prior)&&!d.done.includes(prior))bad('Selesaikan tahap sebelumnya.');
  const before=old.records[stage],items=before?(r.revisions||[]).slice(before.revisions.length):[r.initial,...(r.revisions||[])];
  if(items.length>1)bad('Simpan setiap percobaan secara berurutan.');
  let rec=before?structuredClone(before):null;
  for(const item of items){const v=item?.data;if(!v||!fields[stage].every(k=>filled(String(v[k]??''))))bad('Lengkapi semua langkah aktivitas.');if(stage==='a4'&&(!Array.isArray(v.order)||new Set(v.order).size!==5||v.order.some(n=>!Number.isInteger(n)||n<0||n>4)||v.runIndex<5))bad('Jalankan kelima langkah.');const stamp={data:v,at:now(),correct:objective(stage,v)};if(!rec)rec={initial:stamp,revisions:[],hints:[]};else rec.revisions.push(stamp);}
  if(rec){rec.hints=Array.isArray(r.hints)?r.hints.slice(0,100):[];out.records[stage]=rec;}
 }
 const attempts={};for(let i=0;i<quiz.length;i++){
  const prev=old.quiz.attempts[i]||[],next=d.quiz.attempts?.[i]||[];
  if(!Array.isArray(next)||next.length>2||next.length<prev.length||next.length>prev.length+1)bad('Dua kesempatan per soal.');
  if(next.length>prev.length&&prev.at(-1)?.correct)bad('Soal telah selesai.');
  attempts[i]=structuredClone(prev);if(next.length>prev.length){if(!old.done.includes('a4'))bad('Selesaikan empat aktivitas dahulu.');if(i>0&&!(attempts[i-1]?.at(-1)?.correct||attempts[i-1]?.length===2))bad('Selesaikan soal sebelumnya.');const q=quiz[i],response=next.at(-1).response,correct=q.type==='order'?JSON.stringify(response)===JSON.stringify(q.answer):response===q.key;attempts[i].push({response,correct,at:now()});}
 }
 out.quiz={...d.quiz,attempts,i:Math.min(quiz.length,Math.max(0,Number(d.quiz.i)||0))};
 const gr={};for(let i=0;i<missions.length;i++){const prev=old.game.records[i]||[],next=d.game.records?.[i]||[];if(!Array.isArray(next)||next.length>2||next.length<prev.length||next.length>prev.length+1)bad('Dua kesempatan per pos.');gr[i]=structuredClone(prev);if(next.length>prev.length){if(!old.done.includes('kuis'))bad('Selesaikan kuis dahulu.');if(prev.at(-1)?.correct)bad('Pos telah selesai.');if(i>0&&!(gr[i-1]?.at(-1)?.correct||gr[i-1]?.length===2))bad('Selesaikan pos sebelumnya.');const a=next.at(-1);if(!filled(a.answer)||!filled(a.reason))bad('Isi jawaban dan alasan.');gr[i].push({answer:a.answer,reason:a.reason,correct:missions[i].key===null?null:normalize(a.answer)===normalize(missions[i].key),at:now()});}}
 out.game={...d.game,records:gr,done:Object.keys(gr).filter(i=>gr[i].at(-1)?.correct||gr[i].length===2||Number(i)===4&&gr[i].length>0).map(Number)};
 if(!old.evaluation.submission){if(!Array.isArray(d.evaluation.answers)||d.evaluation.answers.length!==10||d.evaluation.answers.some(a=>typeof a.answer!=='string'||typeof a.reason!=='string'||a.answer.length>500||a.reason.length>6000))bad('Isian evaluasi tidak sesuai.');if(!open.evaluation&&JSON.stringify(d.evaluation.answers)!==JSON.stringify(old.evaluation.answers))bad('Evaluasi sedang ditutup guru.',423);out.evaluation={answers:d.evaluation.answers,i:Math.min(9,Math.max(0,Number(d.evaluation.i)||0)),submission:null};}
 out.done=[...old.done];for(const stage of stages.slice(0,-1)){if(!d.done.includes(stage)||out.done.includes(stage))continue;const i=stages.indexOf(stage);if(i&&!out.done.includes(stages[i-1]))bad('Tahap belum tersedia.');if(stage.startsWith('a')&&!out.records[stage])bad('Jawaban aktivitas belum lengkap.');if(stage==='kuis'&&!quiz.every((_,i)=>attempts[i]?.at(-1)?.correct||attempts[i]?.length===2))bad('Selesaikan semua soal kuis.');if(stage==='game'&&out.game.done.length!==5)bad('Selesaikan seluruh pos.');out.done.push(stage);}
 out.awards=out.done.filter(k=>/^a[1-4]$/.test(k)).map(k=>({stage:k,title:'Penjelajah tekun: '+k}));
 out.points={activity:Object.keys(fields).reduce((n,k)=>{const r=out.records[k];return n+(r?points([r.initial,...r.revisions].slice(0,2)):0)},0),quiz:Object.values(attempts).reduce((n,a)=>n+points(a),0),game:Object.entries(gr).reduce((n,[i,a])=>n+(Number(i)<4?points(a):0),0)};out.updatedAt=now();return out;
}
export function createAPI({store,env,sendEmail=async()=>({sent:false,message:'Email belum dikonfigurasi.'}),pdf, rubricPDF, legacyStores=[],ip='local'}){
 const cookie='komatik_v5_session';
 const config=()=>{if(env.SESSION_SECRET?.length<32||!env.SESSION_SECRET||env.TEACHER_PASSWORD?.length<12||!env.TEACHER_PASSWORD)bad('Guru perlu mengisi SESSION_SECRET minimal 32 karakter dan TEACHER_PASSWORD minimal 12 karakter di Netlify.',503)};
 const fingerprint=t=>createHmac('sha256',env.SESSION_SECRET).update(t).digest('hex');
 const sign=o=>{const p=Buffer.from(JSON.stringify(o)).toString('base64url');return p+'.'+createHmac('sha256',env.SESSION_SECRET).update(p).digest('base64url')};
 const write=async(k,d,etag)=>{const r=await store.setJSON(k,d,etag?{onlyIfMatch:etag}:{onlyIfNew:true});if(!r.modified)bad('Data berubah di perangkat lain. Muat ulang sebelum melanjutkan.',409);return r};
 async function limit(key){const k='rate/'+hash(key)+'/'+Math.floor(Date.now()/900000);for(let i=0;i<8;i++){const r=await store.getWithMetadata(k,{type:'json'});if((r?.data.n||0)>=15)bad('Terlalu banyak percobaan. Tunggu 15 menit.',429);try{await write(k,{n:(r?.data.n||0)+1},r?.etag);return}catch(e){if(e.status!==409)throw e}}bad('Silakan coba kembali.',429)}
 async function token(){for(let i=0;i<20;i++){const abc='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let t=Array.from({length:8},()=>abc[randomInt(abc.length)]).join('');if(!/[A-Z]/.test(t)||!/[0-9]/.test(t))continue;const r=await store.setJSON('token/'+fingerprint(t),{issuedAt:now()},{onlyIfNew:true});if(r.modified)return t}bad('Token belum dapat dibuat. Coba lagi.',503)}
 function credential(t){const salt=randomBytes(16).toString('hex');return{salt,tokenHash:scryptSync(t,salt,32).toString('hex')}}
 async function auth(req){try{const raw=(req.headers.get('cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(cookie+'='))?.slice(cookie.length+1);if(!raw)throw Error();const [p,s]=raw.split('.');if(!eq(sign(JSON.parse(Buffer.from(p,'base64url'))),raw))throw Error();const a=JSON.parse(Buffer.from(p,'base64url'));if(a.exp<=Date.now())throw Error();if(a.role==='teacher'){if(a.ver!==hash(env.TEACHER_PASSWORD))throw Error()}else{a.record=await store.get('student/'+a.id,{type:'json'});if(!a.record?.active||a.record.ver!==a.ver)throw Error()}return a}catch{bad('Sesi berakhir. Silakan masuk kembali.',401)}}
 const identity=b=>{const profil={kode:norm(b.kode),kelas:norm(b.kelas),nama:String(b.nama||'').trim().replace(/\s+/g,' ')};if(!/^[A-Z0-9_-]{1,24}$/.test(profil.kode)||!profil.kelas||profil.kelas.length>30||profil.nama.length<2||profil.nama.length>100)bad('Periksa kode (1–24 huruf/angka), kelas, dan nama.');return profil};
 const index=p=>'identity/'+hash(p.kelas+'|'+p.kode);
 async function all(prefix){const r=await store.list({prefix});return Promise.all(r.blobs.map(async b=>({key:b.key,value:await store.get(b.key,{type:'json'})})));}
 return async req=>{let sessionCookie;const json=(d,status=200)=>new Response(JSON.stringify(d),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store',...(sessionCookie?{'Set-Cookie':sessionCookie}:{})}});
 try{config();if(req.method!=='POST')bad('Gunakan POST.',405);if(req.headers.get('origin')!==new URL(req.url).origin)bad('Asal permintaan tidak sesuai.',403);const raw=await req.text();if(Buffer.byteLength(raw)>700000)bad('Data terlalu besar.',413);let b;try{b=JSON.parse(raw)}catch{bad('Data tidak terbaca.')};if(!b||typeof b!=='object')bad('Permintaan tidak sesuai.');
 const session=o=>sessionCookie=`${cookie}=${sign({...o,exp:Date.now()+8*3600000})}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800`;
 const settings=await store.get('settings',{type:'json'})||{activities:true,evaluation:true};
 const load=async id=>{const st=await store.get('state/'+id,{type:'json'});return{...st,settings}};
 if(b.action==='teacher-login'){await limit('teacher|'+ip);if(!eq(hash(b.password||''),hash(env.TEACHER_PASSWORD)))bad('Kata sandi tidak sesuai.',401);session({role:'teacher',ver:hash(env.TEACHER_PASSWORD)});return json({role:'teacher'})}
 if(b.action==='student-login'){await limit('student|'+ip+'|'+norm(b.kelas)+'|'+norm(b.kode));if(!b.kode||!b.kelas||!b.nama||!b.token)bad('Keempat isian wajib diisi.');const ref=await store.get(index({kelas:norm(b.kelas),kode:norm(b.kode)}),{type:'json'}),r=ref&&await store.get('student/'+ref.id,{type:'json'});const t=String(b.token).trim().toUpperCase();if(!/^[A-Z0-9]{8}$/.test(t)||!r?.active||norm(b.nama)!==norm(r.profil.nama)||!eq(r.tokenHash,scryptSync(t,r.salt,32).toString('hex')))bad('Identitas atau token tidak sesuai.',401);session({role:'student',id:ref.id,ver:r.ver});return json({role:'student',id:ref.id,...await load(ref.id)})}
 if(b.action==='logout'){sessionCookie=`${cookie}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;return json({ok:true})}
 const a=await auth(req);if(b.action==='session')return json(a.role==='teacher'?{role:'teacher'}:{role:'student',id:a.id,...await load(a.id)});
 if(['save','submit','email'].includes(b.action)){
 if(a.role!=='student')bad('Akses siswa diperlukan.',403);const key='state/'+a.id,entry=await store.getWithMetadata(key,{type:'json'}),old=entry.data;
 if(b.action==='email'){if(!old.data.evaluation.submission)bad('Kumpulkan jawaban dahulu.');const receiptKey='email/'+a.id+'/'+old.data.evaluation.submission.payload.id;const receipt=await store.get(receiptKey,{type:'json'});if(receipt?.sent)return json(receipt);const lock=await store.getWithMetadata('lock/'+receiptKey,{type:'json'});if(lock&&Date.now()-lock.data.time<60000)bad('Pengiriman sedang diproses.',409);await write('lock/'+receiptKey,{time:Date.now()},lock?.etag);let result;try{result=await sendEmail(old.data,receiptKey)}catch{result={sent:false,message:'Jawaban tersimpan. Email belum berhasil dikirim.'}}await store.setJSON(receiptKey,result);return json(result)}
 const requestHash=hash(JSON.stringify({data:b.data,rev:b.rev}));if(b.action==='save'&&b.requestId&&old.lastRequest?.id===b.requestId){if(old.lastRequest.hash!==requestHash)bad('ID permintaan digunakan untuk data berbeda.',409);return json({...old,settings});}if(b.requestId&&!/^[a-zA-Z0-9-]{8,80}$/.test(b.requestId))bad('ID permintaan tidak valid.');
 if(b.action==='submit'&&old.data.evaluation.submission)return json({...old,settings});if(b.rev!==old.rev)bad('Progres berubah di perangkat lain. Muat ulang data server.',409);
 let data=clean(b.data,old.data,a.record.profil,settings);
 if(b.action==='submit'){if(!settings.evaluation)bad('Evaluasi ditutup guru.',423);if(!data.done.includes('game'))bad('Selesaikan Games dahulu.');const payload={id:uid(),createdAt:now(),student:data.student,answers:evaluation.map((q,i)=>({indicator:q[0],question:q[1],...data.evaluation.answers[i]}))};data.evaluation.submission={status:'saved',payload};data.done.push('evaluasi');}
 const rev=uid();await write(key,{data,rev,...(b.requestId?{lastRequest:{id:b.requestId,hash:requestHash}}:{})},entry.etag);await store.setJSON('backup/'+a.id+'/'+old.rev,old,{onlyIfNew:true});return json({data,rev,settings});}
 if(a.role!=='teacher')bad('Akses guru diperlukan.',403);
 if(b.action==='settings'){if(typeof b.activities!=='boolean'||typeof b.evaluation!=='boolean')bad('Pengaturan tidak valid.');await store.setJSON('settings',{activities:b.activities,evaluation:b.evaluation,updatedAt:now()});return json({ok:true})}
 if(b.action==='rubric'){const bytes=await rubricPDF();return new Response(bytes,{headers:{'Content-Type':'application/pdf','Cache-Control':'no-store'}})}
 if(b.action==='backup'){const result={schema:5,createdAt:now(),records:(await all('student/')).map(({key,value})=>({key,value:{profil:value.profil,active:value.active,created:value.created}})),states:await all('state/'),scores:await all('scores/'),settings,legacy:[]};for(const {name,store:ls} of legacyStores){const entries=await ls.list();const data=[];for(const v of entries.blobs){if(/token|secret|password/i.test(v.key))continue;let d=await ls.get(v.key,{type:'json'});if(d&&typeof d==='object'){d=structuredClone(d);for(const k of ['tokenHash','salt','ver','cloudToken'])delete d[k]}data.push({key:v.key,value:redact(d)})}result.legacy.push({name,records:data})}return json(result)}
 if(b.action==='roster'){const students=[];for(const {key,value:r} of await all('student/')){const id=key.slice(8),st=await load(id),scores=await store.get('scores/'+id,{type:'json'});students.push({id,profil:r.profil,active:r.active,created:r.created,data:st.data,scores:scores||{grades:Array(10).fill(null),notes:Array(10).fill('')}})}return json({students,settings})}
 if(b.action==='create-student'){const profil=identity(b),id=uid(),idx=index(profil);const idxEntry=await store.getWithMetadata(idx,{type:'json'});if(idxEntry?.data.id)bad('Kode sudah dipakai di kelas ini.',409);const t=await token(),r={profil,active:true,...credential(t),ver:uid(),created:now()};await write('student/'+id,r);const data=newState();data.student={code:profil.kode,name:profil.nama,className:profil.kelas};data.mode=null;data.points={activity:0,quiz:0,game:0};data.awards=[];await write('state/'+id,{data,rev:uid()});await write(idx,{id},idxEntry?.etag);return json({id,profil,token:t})}
 if(!/^[a-f0-9]{64}$/.test(b.id||''))bad('Pilih siswa.');const entry=await store.getWithMetadata('student/'+b.id,{type:'json'});if(!entry)bad('Siswa tidak ditemukan.',404);
 if(b.action==='reset-token'){const t=await token();await write('student/'+b.id,{...entry.data,...credential(t),ver:uid()},entry.etag);return json({token:t,profil:entry.data.profil})}
 if(b.action==='update-student'){const profil=identity(b);const newKey=index(profil),oldKey=index(entry.data.profil);if(newKey!==oldKey){const existing=await store.getWithMetadata(newKey,{type:'json'});if(existing?.data.id&&existing.data.id!==b.id)bad('Kode sudah digunakan.',409);if(!existing?.data.id)await write(newKey,{id:b.id},existing?.etag);}
 await write('student/'+b.id,{...entry.data,profil,active:b.active!==false,ver:uid()},entry.etag);const st=await store.getWithMetadata('state/'+b.id,{type:'json'});st.data.data.student={code:profil.kode,name:profil.nama,className:profil.kelas};await write('state/'+b.id,{...st.data,rev:uid()},st.etag);if(newKey!==oldKey)await store.setJSON(oldKey,{id:null});return json({ok:true})}
 const state=await load(b.id),score=await store.getWithMetadata('scores/'+b.id,{type:'json'});
 if(b.action==='student-detail')return json({...state,profil:entry.data.profil,active:entry.data.active,scores:score?.data||{grades:Array(10).fill(null),notes:Array(10).fill('')},scoreRev:score?.etag||null});
 if(b.action==='save-scores'){if(!state.data.evaluation.submission)bad('Evaluasi belum dikumpulkan.');if((score?.etag||null)!==b.scoreRev)bad('Penilaian berubah. Muat ulang.',409);const g=b.scores;if(!Array.isArray(g?.grades)||g.grades.length!==10||g.grades.some(n=>n!==null&&(!Number.isInteger(n)||n<0||n>4))||!Array.isArray(g.notes)||g.notes.length!==10||g.notes.some(x=>typeof x!=='string'||x.length>3000))bad('Periksa skor 0–4 dan komentar.');const clean={grades:g.grades,notes:g.notes,updatedAt:now()};if(score)await store.setJSON('grade-history/'+b.id+'/'+uid(),score.data);const r=await write('scores/'+b.id,clean,score?.etag);return json({scoreRev:r.etag})}
 if(b.action==='pdf'){if(!state.data.evaluation.submission)bad('Evaluasi belum dikumpulkan.');const bytes=await pdf(state.data,score?.data);return new Response(bytes,{headers:{'Content-Type':'application/pdf','Cache-Control':'no-store'}})}
 bad('Tindakan tidak dikenali.',404);
 }catch(e){return json({error:e.status?e.message:'Server belum dapat memproses permintaan. Draf tetap tersimpan di perangkat.'},e.status||500)}
 };
}
