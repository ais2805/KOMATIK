export function uuid(){if(globalThis.crypto?.randomUUID)return crypto.randomUUID();const b=crypto.getRandomValues(new Uint8Array(16));b[6]=(b[6]&15)|64;b[8]=(b[8]&63)|128;const h=Array.from(b,x=>x.toString(16).padStart(2,'0')).join('');return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;}
export const esc = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function sequence(start,step,count){if(!Number.isInteger(start)||!Number.isInteger(step)||!Number.isInteger(count)||count<3||count>8||Math.abs(step)<1||Math.abs(step)>10)throw Error('Gunakan bilangan bulat, perubahan 1–10, dan 3–8 posisi.');const a=Array.from({length:count},(_,i)=>start+step*i);if(a.some(v=>v<0||v>100))throw Error('Atur agar semua bilangan berada antara 0 dan 100.');return a;}
export function normalize(v){return String(v).toLowerCase().replace(/\s/g,'').replace(/;/g,',');}
export function unlocked(id,state,stages,sequential=true){if(/^a[1-4]$/.test(id)){
 const number=Number(id[1]);
 for(let previous=1;previous<number;previous++)if(!state.done.includes('a'+previous))return false;
 }
 if(!sequential)return true;const i=stages.findIndex(s=>s.id===id);return i<=0||stages.slice(0,i).every(s=>state.done.includes(s.id));}
export function newState(){return {version:1,sessionId:uuid(),student:null,done:[],drafts:{},records:{},quiz:{i:0,attempts:{},order:[0,1,2,3]},game:{done:[],records:{},x:10,y:82},evaluation:{answers:Array.from({length:10},()=>({answer:'',reason:''})),i:0,submission:null},settings:{sound:false,motion:true}};}
export function csvCell(v){let s=String(v??'');if(/^[=+\-@\t\r]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';}
export function evaluationCSV(payload){const rows=[['KOMATIK',payload.id],['Kode siswa',payload.student.code],['Kelas',payload.student.className],['Waktu',payload.createdAt],['Nomor','Indikator','Soal','Jawaban awal','Penjelasan','Skor guru 0–4']];payload.answers.forEach((a,i)=>rows.push([i+1,a.indicator,a.question,a.answer,a.reason,'']));return '\uFEFF'+rows.map(r=>r.map(csvCell).join(',')).join('\r\n');}
