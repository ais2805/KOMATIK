import { createHash, timingSafeEqual } from 'node:crypto';

export const isUUID = x => typeof x === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(x);
const digest = text => createHash('sha256').update(String(text)).digest();
export function teacherAllowed(secret, supplied) {
  return typeof secret==='string' && secret.length>=16 && typeof supplied==='string' &&
    timingSafeEqual(digest(secret),digest(supplied));
}
export function fail(status,message){throw Object.assign(new Error(message),{status});}
export function storeName(env,context) {
  const mode=context.deploy?.context||env('CONTEXT');
  return mode==='production'||context.deploy?.published===true?'komatik-production':
    ('komatik-preview-'+(context.deploy?.id||'local')).slice(0,64);
}
export async function sessionAccess(store,id,token,student,create=false){
  if(!isUUID(id)||typeof token!=='string'||!/^[a-f0-9]{64}$/.test(token))fail(403,'Kode pemulihan sesi tidak sesuai.');
  const hash=digest(token).toString('hex'), key='sessions/'+id;
  if(create) {
    if(!student||['code','className'].some(k=>typeof student[k]!=='string'||!student[k].trim()||student[k].length>(k==='code'?100:30)||/[\r\n]/.test(student[k])))fail(400,'Nama siswa atau kelas tidak sesuai.');
    await store.setJSON(key,{hash,student:{code:student.code,className:student.className}},{onlyIfNew:true});
  }
  const entry=await store.get(key,{type:'json',consistency:'strong'});
  if(!entry||entry.hash!==hash)fail(403,'Sesi tidak ditemukan atau kode pemulihan keliru.');
  if(create && (entry.student.code!==student.code||entry.student.className!==student.className))fail(409,'Identitas sesi berbeda.');
  return entry.student;
}
export async function putCheckpoint(store,p,token){
  if(!/^a[1-4]$/.test(p.stage)||typeof p.complete!=='boolean'||!p.record?.initial?.data||!Array.isArray(p.record.revisions)||p.record.revisions.length>200)fail(400,'Catatan aktivitas tidak lengkap.');
  const rev=p.record.revisions.length;
  if(p.stage==='a2'&&p.complete){
    const d=p.record.revisions.at(-1)?.data||p.record.initial.data;
    if(['down1','down2','down4','down5','downReason'].some(k=>!String(d[k]??'').trim()))fail(400,'Tantangan pola mengecil perlu diselesaikan.');
  }
  const student=await sessionAccess(store,p.sessionId,token,p.student,true);
  const base='progress/'+p.sessionId+'/'+p.stage+'/';
  const key=base+String(rev).padStart(3,'0')+(p.complete?'-1':'-0');
  const previous=await store.get(base+'000-0',{type:'json',consistency:'strong'});
  if(previous && JSON.stringify(previous.record.initial)!==JSON.stringify(p.record.initial))fail(409,'Jawaban awal berbeda dari arsip server.');
  const doc={sessionId:p.sessionId,student,stage:p.stage,complete:p.complete,record:p.record,at:new Date().toISOString()};
  const r=await store.setJSON(key,doc,{onlyIfNew:true});
  if(r.modified===false){
    const current=await store.get(key,{type:'json',consistency:'strong'});
    if(!current||JSON.stringify(current.record.initial)!==JSON.stringify(p.record.initial)||
       JSON.stringify(current.record.revisions)!==JSON.stringify(p.record.revisions))fail(409,'Versi catatan ini sudah tersimpan dengan isi berbeda.');
  }
  return {saved:true,stage:p.stage,rev,complete:p.complete};
}
async function listKeys(store,prefix){return (await store.list({prefix})).blobs.map(b=>b.key).sort();}
async function getMany(store,keys){const rows=[];for(let i=0;i<keys.length;i+=16)rows.push(...await Promise.all(keys.slice(i,i+16).map(k=>store.get(k,{type:'json',consistency:'strong'}))));return rows.filter(Boolean);}
export async function latestCheckpoints(store,id=''){
  const keys=await listKeys(store,'progress/'+(id?id+'/':''));
  const latest=new Map();for(const k of keys)latest.set(k.slice(0,k.lastIndexOf('/')),k);
  return getMany(store,[...latest.values()]);
}
export async function classRows(store){
  const sessions=new Map();
  const row=(id,student)=>{if(!sessions.has(id))sessions.set(id,{id,student,activities:{},evaluations:[]});return sessions.get(id);};
  for(const cp of await latestCheckpoints(store))row(cp.sessionId,cp.student).activities[cp.stage]=cp.complete?'Selesai':'Jawaban tersimpan';
  const evals=await getMany(store,await listKeys(store,'responses/'));
  const grades=new Map((await getMany(store,await listKeys(store,'grades/'))).map(g=>[g.id,g]));
  for(const {payload:p} of evals){
    const g=grades.get(p.id);const scores=g?.grades||[];
    row(p.sessionId||p.id,p.student).evaluations.push({id:p.id,at:p.createdAt,grades:scores,indicators:Array.from({length:5},(_,i)=>Number.isInteger(scores[i*2])&&Number.isInteger(scores[i*2+1])?(scores[i*2]+scores[i*2+1])/8*100:null)});
  }
  return [...sessions.values()].sort((a,b)=>a.student.className.localeCompare(b.student.className)||a.student.code.localeCompare(b.student.code));
}
export async function teacherAction(store,body){
  if(body.action==='list')return {rows:await classRows(store)};
  if(body.action==='activity'&&isUUID(body.sessionId))return {activities:await latestCheckpoints(store,body.sessionId)};
  if(!isUUID(body.id))fail(400,'Nomor pengumpulan keliru.');
  const doc=await store.get('responses/'+body.id+'.json',{type:'json',consistency:'strong'});
  if(!doc)fail(404,'Evaluasi belum diterima server.');
  const gradeKey='grades/'+body.id+'.json';
  if(body.action==='report'){
    const g=await store.get(gradeKey,{type:'json',consistency:'strong'});
    return {payload:{...doc.payload,grades:g?.grades||Array(10).fill(null),notes:g?.notes||Array(10).fill('')}};
  }
  if(body.action==='grade'){
    if(!Array.isArray(body.grades)||body.grades.length!==10||body.grades.some(g=>g!==null&&(!Number.isInteger(g)||g<0||g>4))||!Array.isArray(body.notes)||body.notes.length!==10||body.notes.some(n=>typeof n!=='string'||n.length>2000))fail(400,'Periksa skor dan catatan.');
    await store.setJSON(gradeKey,{id:body.id,grades:body.grades,notes:body.notes,at:new Date().toISOString()});return {saved:true};
  }
  fail(400,'Pilihan tidak dikenal.');
}
