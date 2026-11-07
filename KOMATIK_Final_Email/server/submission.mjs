import {evaluationPDF} from './report.mjs';
import {createHash} from 'node:crypto';
import {evaluation} from '../public/content.js';
import {evaluationCSV} from '../public/core.js';
export function validatePayload(p){
 if(!p||typeof p!=='object'||!/^([a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12})$/i.test(p.id))throw Error('Nomor pengumpulan tidak valid.');
 if(!p.student||!['code','className'].every(k=>typeof p.student[k]==='string'&&p.student[k].trim().length>0&&p.student[k].length<=30&&!/[\r\n]/.test(p.student[k])))throw Error('Kode siswa atau kelas tidak valid.');
 if(!Array.isArray(p.answers)||p.answers.length!==10)throw Error('Diperlukan 10 respons evaluasi.');
 if(!Number.isFinite(Date.parse(p.createdAt)))throw Error('Waktu pengumpulan tidak valid.');
 const answers=p.answers.map((a,i)=>{if(!a||typeof a.answer!=='string'||a.answer.length>300||typeof a.reason!=='string'||a.reason.length>2500)throw Error('Jawaban terlalu panjang atau tidak valid.');return {question:evaluation[i][1],indicator:evaluation[i][0],answer:a.answer,reason:a.reason};});
 return {id:p.id,...(p.sessionId?{sessionId:p.sessionId}:{}),version:['1.0.0','1.1.0','1.2.0'].includes(p.version)?p.version:'1.2.0',student:{code:p.student.code.trim(),className:p.student.className.trim()},createdAt:p.createdAt,answers,learning:p.learning&&typeof p.learning==='object'?p.learning:{}};
}
export function fingerprint(p){return createHash('sha256').update(JSON.stringify(p)).digest('hex');}
export async function emailRequest(p,from,to){const text=`Hasil evaluasi KOMATIK\nKode siswa: ${p.student.code}\nKelas: ${p.student.className}\nID: ${p.id}\nWaktu: ${p.createdAt}\n\n${p.answers.map((a,i)=>`${i+1}. ${a.question}\nIndikator: ${a.indicator}\nJawaban awal: ${a.answer||'(kosong)'}\nPenjelasan: ${a.reason||'(kosong)'}`).join('\n\n')}\n\nNilai penalaran menunggu penilaian guru. Lampiran PDF siap dicetak dan dikoreksi guru. Lampiran JSON dapat diimpor ke Ruang guru pada website KOMATIK. Lampiran CSV tersedia untuk rekap.`;return {from,to:[to],subject:`Evaluasi KOMATIK – ${p.student.className} – ${p.student.code} – ${p.id}`,text,attachments:[{filename:`KOMATIK-${p.id}.pdf`,content:(await evaluationPDF(p)).toString('base64')},{filename:`KOMATIK-${p.id}.csv`,content:Buffer.from(evaluationCSV(p)).toString('base64')},{filename:`KOMATIK-${p.id}.json`,content:Buffer.from(JSON.stringify(p,null,2)).toString('base64')}]};}
export async function processSubmission(payload,{store,env,send,now=()=>new Date()}){
 const p=validatePayload(payload),hash=fingerprint(p),key=`responses/${p.id}.json`;
 const existing=await store.get(key,{type:'json',consistency:'strong'});
 if(existing&&existing.hash!==hash)return {status:409,body:{message:'Nomor ini sudah digunakan untuk jawaban awal yang berbeda. Jawaban awal tidak ditimpa.'}};
 if(!existing){const r=await store.setJSON(key,{hash,payload:p,receivedAt:now().toISOString()},{onlyIfNew:true});if(r.modified===false){const again=await store.get(key,{type:'json',consistency:'strong'});if(again?.hash!==hash)return {status:409,body:{message:'Pengumpulan bersamaan berbeda. Jawaban awal tetap dilindungi.'}};}}
 const receipt=await store.get(`mail/${p.id}.json`,{type:'json',consistency:'strong'});
 if(receipt)return {status:200,body:{saved:true,receipt:p.id,email:'sent',message:'Jawaban sudah tersimpan dan pengiriman email sudah diterima layanan.'}};
 const from=env('MAIL_FROM'),to=env('TEACHER_EMAIL'),api=env('RESEND_API_KEY');
 if(!api||!from||!to||!/^\S+@\S+\.\S+$/.test(to))return {status:200,body:{saved:true,receipt:p.id,email:'disabled',message:'Jawaban tersimpan di server; email belum dikonfigurasi.'}};
 try{
  // Immutable envelope + stable idempotency key makes simultaneous retries safe at provider.
  const response=await send('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${api}`,'Content-Type':'application/json','Idempotency-Key':`komatik/${p.id}`},body:JSON.stringify(await emailRequest(p,from,to)),signal:AbortSignal.timeout(15000)});
  if(!response.ok)return {status:200,body:{saved:true,receipt:p.id,email:'failed',message:'Jawaban tersimpan; layanan email menolak pengiriman. Guru perlu memeriksa konfigurasi.'}};
  const data=await response.json();await store.setJSON(`mail/${p.id}.json`,{providerId:data.id,sentAt:now().toISOString()},{onlyIfNew:true});
  return {status:200,body:{saved:true,receipt:p.id,email:'sent',message:'Jawaban tersimpan dan layanan email menerima pengiriman.'}};
 }catch{return {status:200,body:{saved:true,receipt:p.id,email:'failed',message:'Jawaban tersimpan; pengiriman email belum terkonfirmasi. Coba kembali.'}};}
}
