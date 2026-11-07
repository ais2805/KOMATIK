import {esc,csvCell} from './core.js';

export async function requestSchool(endpoint, params, token){
  const res=await fetch('/.netlify/functions/'+endpoint,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify(params),signal:AbortSignal.timeout(15000)});
  if(!res.headers.get('content-type')?.includes('application/json'))throw Error('Server kelas belum tersedia. Gunakan deploy lengkap untuk sinkronisasi.');
  const b=await res.json();if(!res.ok)throw Object.assign(Error(b.message||'Permintaan gagal.'),{status:res.status});return b;
}
export function sessionToken(s){if(!s.cloudToken)s.cloudToken=[...crypto.getRandomValues(new Uint8Array(32))].map(x=>x.toString(16).padStart(2,'0')).join('');return s.cloudToken;}
export function checkpointId(stage,rec,complete){return stage+'-'+rec.revisions.length+'-'+Number(complete);}
export function queueCheckpoint(s,stage){
 const record=s.records[stage],complete=s.done.includes(stage);
 if(!record)return;
 s.sync??={pending:{},receipts:{}};sessionToken(s);
 const key=checkpointId(stage,record,complete);
 if(!s.sync.receipts[key])s.sync.pending[key]={sessionId:s.sessionId,student:s.student,stage,complete,record:structuredClone(record)};
}
export function statusText(s){
 if(!s.student)return '';
 const count=Object.keys(s.sync?.pending||{}).length, received=Object.keys(s.sync?.receipts||{}).length;
 if(count)return `Tersimpan di perangkat · ${count} catatan menunggu server.`;
 if(received)return 'Catatan aktivitas telah diterima server.';
 return '';
}
const teacherNames=['Dugaan','Hubungan','Justifikasi','Generalisasi','Kesimpulan'];
export function classroomView(rows,filter=''){
 const choices=[...new Set(rows.map(x=>x.student.className))].sort();
 const filtered=rows.filter(r=>!filter||r.student.className===filter);
 return `<div class="card class-recap"><h2>Rekap kelas</h2><label for="class-filter">Kelas</label><select id="class-filter"><option value="">Semua kelas</option>${choices.map(x=>`<option ${filter===x?'selected':''} value="${esc(x)}">${esc(x)}</option>`).join('')}</select><p class="micro">Satu baris mewakili satu sesi murid. Persentase indikator muncul setelah kedua butirnya dinilai.</p>
 <div class="button-row"><button class="btn small" data-action="class-refresh">Perbarui rekap</button><button class="btn small secondary" data-action="class-export">Unduh CSV kelas</button><button class="btn small secondary" data-action="class-logout">Keluar</button></div>
 ${filtered.length?filtered.map(r=>`<article class="class-entry"><strong>${esc(r.student.code)} · ${esc(r.student.className)}</strong><p>${[1,2,3,4].map(i=>'A'+i+' · '+(r.activities['a'+i]||'Belum diterima')).join(' / ')}</p><button class="btn small soft" data-action="class-progress" data-id="${esc(r.id)}">Lihat bukti aktivitas</button>${r.evaluations.length?r.evaluations.map(e=>`<div><p>Evaluasi diterima · ${esc(new Date(e.at).toLocaleString('id-ID'))}</p><p>${teacherNames.map((n,i)=>n+' '+(e.indicators[i]===null?'—':e.indicators[i]+'%')).join(' · ')}</p><button class="btn small" data-action="class-report" data-id="${esc(e.id)}">Buka dan nilai</button></div>`).join(''):'<p>Evaluasi belum diterima.</p>'}</article>`).join(''):'<p>Belum ada sesi yang tercatat untuk kelas ini.</p>'}</div>`;
}
export function classCSV(rows,filter){
 const out=[['Nama siswa','Kelas','Sesi','A1','A2','A3','A4','Nomor evaluasi',...teacherNames.map(n=>n+' (%)')]];
 for(const r of rows.filter(r=>!filter||r.student.className===filter))for(const e of r.evaluations.length?r.evaluations:[null])out.push([r.student.code,r.student.className,r.id,...[1,2,3,4].map(i=>r.activities['a'+i]||'Belum diterima'),e?.id||'',...(e?.indicators||Array(5).fill(''))]);
 return '\uFEFF'+out.map(row=>row.map(csvCell).join(',')).join('\r\n');
}

const labels={
 sort0:'Kartu baris pertama',sort1:'Kartu baris kedua',sort2:'Kartu baris ketiga',sort3:'Kartu pertambahan',sort4:'Kartu yang dicari',
 small:'Pertanyaan kecil',guess:'Dugaan jumlah pot',reason:'Dasar dugaan',
 diff1:'Selisih 10 dan 6',diff2:'Selisih 14 dan 10',relation:'Hubungan antarbaris',row4:'Pot baris keempat',row5:'Pot baris kelima',fix:'Koreksi pola',
 down1:'Perubahan 35 ke 30',down2:'Perubahan 30 ke 25',down4:'Pita hari keempat',down5:'Pita hari kelima',downReason:'Alasan pada pola mengecil',
 rule:'Aturan',proof:'Bukti dari dua pasangan',row6:'Pot baris keenam',transfer:'Penerapan aturan',compare:'Perbandingan dua pola',
 debug:'Perbaikan langkah',conclusion:'Kesimpulan',reflection:'Refleksi',decreasing:'Tantangan tambahan'
};
function evidence(item){
 const data=item.data||{};
 const lines=Object.entries(labels).filter(([key])=>Object.hasOwn(data,key)&&String(data[key]).trim());
 return '<dl class="evidence">'+lines.map(([key,label])=>`<dt>${label}</dt><dd>${esc(data[key])}</dd>`).join('')+'</dl>';
}
export function evidenceMarkup(entries){
 return entries.map(p=>`<details class="evidence-card"><summary>${esc(p.stage.toUpperCase())} · ${p.complete?'Selesai':'Jawaban tersimpan'}</summary><h3>Jawaban pertama</h3>${evidence(p.record.initial)}${p.record.revisions.map((v,i)=>`<h3>Perbaikan ${i+1}</h3>${evidence(v)}`).join('')}<p>Petunjuk dibuka ${p.record.hints?.length||0} kali.</p></details>`).join('')||'<p>Belum ada aktivitas di server.</p>';
}
