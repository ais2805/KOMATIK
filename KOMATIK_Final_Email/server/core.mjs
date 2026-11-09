import { randomBytes, createHash, createHmac, timingSafeEqual } from 'node:crypto';
const hash = x => createHash('sha256').update(String(x)).digest('hex');
const eq = (a,b) => { const x=Buffer.from(String(a)),y=Buffer.from(String(b));return x.length===y.length && timingSafeEqual(x,y); };
const norm = s => String(s||'').trim().replace(/\s+/g,' ').toUpperCase();
const sid = (kelas,kode) => hash(norm(kelas)+'|'+norm(kode));
const fail = (message,status=400) => {throw Object.assign(new Error(message),{status});};
const fresh = profil => ({app:'KOMATIK',versi:2,profil,mulai:new Date().toISOString(),progress:{},respon:{},draftAkt:{},cursor:{},kuis:{percobaan:[],terbaik:null},games:{},evaluasi:{draft:{},dikumpulkan:false,waktuKumpul:null},mode:null,bukaSemua:false});
const publicStudent = (id,x) => ({id,profil:x.profil,created:x.created});
export function createAPI({store,env,sendEmail=async()=>({sent:false,message:'Email belum dikonfigurasi. Laporan tetap tersimpan di Ruang Guru.'})}) {
 const cookieName='komatik_session';
 const secret=()=>{if(!env.SESSION_SECRET || env.SESSION_SECRET.length<32 || !env.TEACHER_PASSWORD || env.TEACHER_PASSWORD.length<12) fail('Pengaturan server belum lengkap. Guru perlu mengisi SESSION_SECRET (minimal 32 karakter) dan TEACHER_PASSWORD (minimal 12 karakter) di Netlify.',503);return env.SESSION_SECRET;};
 function sign(obj) {const p=Buffer.from(JSON.stringify(obj)).toString('base64url');return p+'.'+createHmac('sha256',secret()).update(p).digest('base64url');}
 function unpack(req) {const c=(req.headers.get('cookie')||'').split(';').map(s=>s.trim()).find(s=>s.startsWith(cookieName+'='));if(!c)return null;try{const [p,s]=c.slice(cookieName.length+1).split('.');if(!eq(createHmac('sha256',secret()).update(p).digest('base64url'),s))return null;const o=JSON.parse(Buffer.from(p,'base64url'));return o.exp>Date.now()?o:null;}catch{return null;}}
 async function auth(req,role) {const s=unpack(req);if(!s || (role&&s.role!==role))fail('Sesi berakhir. Silakan masuk kembali.',401);if(s.role==='teacher'){if(s.ver!==hash(env.TEACHER_PASSWORD))fail('Silakan masuk guru kembali.',401);}else{const r=await store.get('student/'+s.id,{type:'json'});if(!r||r.ver!==s.ver)fail('Token telah diganti guru. Masuk dengan token baru.',401);s.student=r;}return s;}
 async function write(key,data,etag) {const r=await store.setJSON(key,data,etag?{onlyIfMatch:etag}:{onlyIfNew:true});if(!r.modified)fail('Data berubah di perangkat lain. Muat ulang data server sebelum melanjutkan.',409);return r;}
 function cleanData(d,old,profil) {
  if(!d||typeof d!=='object'||Array.isArray(d))fail('Data tidak sah.');
  for(const k of ['progress','respon','kuis','games','evaluasi'])if(!d[k]||typeof d[k]!=='object'||Array.isArray(d[k]))fail('Struktur progres tidak sesuai.');
  const allowed=['progress','respon','kuis','games','evaluasi','mode','draftAkt','cursor','terakhir','awards'];
  const out={...fresh(profil),mulai:old.mulai};for(const k of allowed)if(d[k]!==undefined)out[k]=d[k];
  // A student may not unlock all stages or edit a submitted evaluation.
  out.bukaSemua=false;out.progress={...old.progress,...out.progress};
  if(!['petualangan','biasa',null].includes(out.mode))out.mode=null;
  if(old.evaluasi.dikumpulkan)out.evaluasi=old.evaluasi;
  else if(out.evaluasi.dikumpulkan){
   if(!old.progress.games)fail('Selesaikan Games sebelum mengumpulkan evaluasi.');
   const answers=out.evaluasi.jawabanKumpul;
   if(!answers||typeof answers!=='object')fail('Jawaban evaluasi belum tersedia.');
   for(let i=1;i<=10;i++)if(typeof answers[i]?.jawaban!=='string'||typeof answers[i]?.alasan!=='string'||answers[i].jawaban.length>500||answers[i].alasan.length>6000)fail('Periksa isian evaluasi.');
   out.evaluasi={draft:answers,jawabanKumpul:answers,dikumpulkan:true,waktuKumpul:new Date().toISOString()};
   out.progress.evaluasi=out.evaluasi.waktuKumpul;
  }
  return out;
 }
 return async function handler(req) {
  let setCookie;
  const json=(x,status=200)=>new Response(JSON.stringify(x),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store',...(setCookie?{'Set-Cookie':setCookie}:{})}});
  try {
   secret();
   if(req.method!=='POST')return json({error:'Gunakan POST.'},405);
   const origin=req.headers.get('origin');if(!origin||origin!==new URL(req.url).origin)fail('Permintaan harus berasal dari website KOMATIK yang sama.',403);
   const raw=await req.text();if(Buffer.byteLength(raw)>650000)fail('Data terlalu besar.',413);
   let b;try{b=JSON.parse(raw);}catch{fail('Data tidak terbaca.');}
   const setSession=o=>{setCookie=`${cookieName}=${sign({...o,exp:Date.now()+8*3600000})}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800`;};
   if(b.action==='teacher-login') {if(!eq(hash(b.password||''),hash(env.TEACHER_PASSWORD)))fail('Kata sandi guru tidak sesuai.',401);setSession({role:'teacher',ver:hash(env.TEACHER_PASSWORD)});return json({role:'teacher'});}
   if(b.action==='student-login') {
    if(!b.kode||!b.kelas||!b.nama||!b.token)fail('Kode, kelas, nama, dan token wajib diisi.');
    const id=sid(b.kelas,b.kode),r=await store.get('student/'+id,{type:'json'});
    if(!r||!eq(r.tokenHash,hash(String(b.token).trim().toUpperCase().replace(/-/g,'')))||norm(b.nama)!==norm(r.profil.nama))fail('Identitas atau token tidak sesuai. Periksa kartu akses dari guru.',401);
    setSession({role:'student',id,ver:r.ver});const st=await store.get('state/'+id,{type:'json'});
    return json({role:'student',id,data:st.data,rev:st.rev});
   }
   if(b.action==='logout'){setCookie=`${cookieName}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;return json({ok:true});}
   const s=await auth(req);
   if(b.action==='session'){if(s.role==='teacher')return json({role:'teacher'});const st=await store.get('state/'+s.id,{type:'json'});return json({role:'student',id:s.id,...st});}
   if(b.action==='save') {
    if(s.role!=='student')fail('Akses siswa diperlukan.',403);
    const key='state/'+s.id,entry=await store.getWithMetadata(key,{type:'json'});
    if(b.rev!==entry.data.rev)fail('Progres sudah berubah di perangkat lain. Muat ulang data server.',409);
    const data=cleanData(b.data,entry.data.data,s.student.profil),rev=randomBytes(12).toString('hex');
    await write(key,{data,rev},entry.etag);return json({rev,evaluasi:data.evaluasi});
   }
   if(b.action==='email') {
    if(s.role!=='student')fail('Akses siswa diperlukan.',403);
    const st=await store.get('state/'+s.id,{type:'json'});if(!st.data.evaluasi.dikumpulkan)fail('Kumpulkan evaluasi terlebih dahulu.');
    const receiptKey='email/'+s.id+'/'+hash(st.data.evaluasi.waktuKumpul),receipt=await store.get(receiptKey,{type:'json'});
    if(receipt)return json(receipt);
    const result=await sendEmail(st.data,receiptKey);
    if(result.sent)await store.setJSON(receiptKey,result,{onlyIfNew:true});return json(result);
   }
   if(s.role!=='teacher')fail('Akses guru diperlukan.',403);
   if(b.action==='roster') {
    const list=await store.list({prefix:'student/'});const students=[];
    for(const item of list.blobs){const id=item.key.slice(8),r=await store.get(item.key,{type:'json'}),st=await store.get('state/'+id,{type:'json'});students.push({...publicStudent(id,r),progress:st?.data.progress||{},dikumpulkan:!!st?.data.evaluasi.dikumpulkan});}
    return json({students});
   }
   if(b.action==='create-student') {
    const kode=norm(b.kode),kelas=norm(b.kelas),nama=String(b.nama||'').trim().replace(/\s+/g,' ');
    if(!/^[A-Z0-9_-]{1,24}$/.test(kode)||!kelas||kelas.length>20||nama.length<2||nama.length>80)fail('Kode 1–24 huruf/angka/tanda - atau _. Isi nama dan kelas dengan lengkap.');
    const id=sid(kelas,kode),token=randomBytes(12).toString('hex').toUpperCase(),ver=randomBytes(12).toString('hex');
    const r={profil:{kode,kelas,nama},tokenHash:hash(token),ver,created:new Date().toISOString()};
    // Initialize before exposing the login identity; do not overwrite an existing record.
    if(await store.get('student/'+id,{type:'json'}))fail('Kode tersebut sudah terdaftar di kelas ini.',409);
    await store.setJSON('state/'+id,{data:fresh(r.profil),rev:randomBytes(12).toString('hex')},{onlyIfNew:true});
    await write('student/'+id,r);return json({...publicStudent(id,r),token:token.match(/.{1,4}/g).join('-')});
   }
   if(!/^[a-f0-9]{64}$/.test(b.id||''))fail('Pilih siswa terlebih dahulu.');
   const identity=await store.getWithMetadata('student/'+b.id,{type:'json'});if(!identity)fail('Siswa tidak ditemukan.',404);
   if(b.action==='reset-token'){const token=randomBytes(12).toString('hex').toUpperCase();await write('student/'+b.id,{...identity.data,tokenHash:hash(token),ver:randomBytes(12).toString('hex')},identity.etag);return json({token:token.match(/.{1,4}/g).join('-')});}
   if(b.action==='student-detail'){const st=await store.get('state/'+b.id,{type:'json'}),scores=await store.getWithMetadata('scores/'+b.id,{type:'json'});return json({...st,scores:scores?.data||{skor:{},catatan:{},umum:''},scoreRev:scores?.etag||null});}
   if(b.action==='save-scores'){
    const st=await store.get('state/'+b.id,{type:'json'});if(!st?.data.evaluasi.dikumpulkan)fail('Evaluasi belum dikumpulkan.');
    const scores=b.scores;if(!scores||!scores.skor||typeof scores.skor!=='object')fail('Skor tidak sah.');
    for(const [k,v] of Object.entries(scores.skor))if(!/^(10|[1-9])$/.test(k)||!Number.isInteger(v)||v<0||v>4)fail('Skor harus bilangan bulat 0–4.');
    const r=await write('scores/'+b.id,scores,b.scoreRev);return json({scoreRev:r.etag});
   }
   fail('Tindakan tidak dikenali.',404);
  }catch(e){return json({error:e.status?e.message:'Server belum dapat memproses permintaan. Coba lagi; progres lokal tidak dihapus.'},e.status||500);}
 };
}
