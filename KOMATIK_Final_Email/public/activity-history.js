import {esc} from './core.js';
import {stages} from './content.js';
import {algorithmItems} from './learning.js';

const fields = {
  a1: [
    ['sort0','Baris pertama berisi 6 pot: diketahui atau ditanyakan?'],
    ['sort1','Baris kedua berisi 10 pot: diketahui atau ditanyakan?'],
    ['sort2','Baris ketiga berisi 14 pot: diketahui atau ditanyakan?'],
    ['sort3','Pertambahan tiap baris sama: diketahui atau ditanyakan?'],
    ['sort4','Banyak pot pada baris kelima: diketahui atau ditanyakan?'],
    ['small','Pertanyaan kecil apa yang perlu dijawab?'],
    ['guess','Dugaan banyak pot pada baris kelima'],['reason','Apa dasar dugaanmu?'],
    ['decreasing','Tantangan tambahan: dugaan dan alasan untuk persediaan pita 32, 27, 22']
  ],
  a2: [
    ['diff1','Selisih 10 − 6'],['diff2','Selisih 14 − 10'],['relation','Apakah perubahan keduanya sama? Jelaskan.'],
    ['row4','Banyak pot baris keempat'],['row5','Banyak pot baris kelima'],
    ['fix','Perbaiki 6, 10, 15, 18 agar selalu bertambah 4. Mengapa?'],
    ['down1','Dari 35 ke 30 berkurang berapa?'],['down2','Dari 30 ke 25 berkurang berapa?'],
    ['down4','Banyak pita hari keempat'],['down5','Banyak pita hari kelima'],
    ['downReason','Jelaskan hubungan pola mengecil memakai kedua pasangan.']
  ],
  a3: [
    ['info0','Informasi yang dipilih: warna pot'],['info1','Informasi yang dipilih: bentuk pot'],
    ['info2','Informasi yang dipilih: banyak pot awal'],['info3','Informasi yang dipilih: perubahan setiap baris'],
    ['info4','Informasi yang dipilih: nomor baris yang dicari'],['rule','Tuliskan aturanmu.'],
    ['proof','Mengapa aturanmu sesuai? Tunjukkan dua perpindahan.'],['row6','Banyak pot pada baris keenam'],
    ['transfer','Bagaimana aturanmu menghasilkan banyak pot itu?'],
    ['compare','Bandingkan dengan 9, 13, 17: apa yang sama dan berbeda?'],
    ['decreasing','Tantangan tambahan: aturan, bukti, dan posisi keenam dari 40, 34, 28']
  ],
  a4: [
    ['order','Urutan langkah yang disusun'],['debug','Apa yang perlu diperbaiki dari cara Si KOMA? Mengapa?'],
    ['conclusion','Kesimpulan masalah taman, satuan, dan alasan'],['reflection','Apakah dugaan awalmu berubah? Jelaskan.'],
    ['decreasing','Tantangan tambahan: langkah dan kesimpulan posisi keenam dari 50, 43, 36']
  ]
};

function stamp(value) {
  const d = new Date(value);
  return value && Number.isFinite(d.getTime()) ? d.toLocaleString('id-ID',{timeZone:'Asia/Jakarta'}) + ' WIB' : 'Waktu tidak tercatat';
}

function answer(data, key) {
  const value = data?.[key];
  if (key === 'order' && Array.isArray(value)) return value.map((n,i)=>`${i+1}. ${algorithmItems[n] || 'Langkah tidak dikenali'}`).join('\n');
  if (/^info\d$/.test(key) && data) return value ? 'Dipilih' : 'Tidak dipilih';
  if (value === undefined || value === null || String(value).trim() === '') return 'Belum diisi';
  return value === 'diketahui' ? 'Diketahui' : value === 'ditanyakan' ? 'Ditanyakan' : String(value);
}

function table(stage, attempts, labels) {
  return `<table class="mini-table response-table"><thead><tr><th scope="col">Pertanyaan</th>${labels.map(label=>`<th scope="col">${esc(label)}</th>`).join('')}</tr></thead><tbody>${fields[stage].map(([key,label])=>`<tr><th scope="row">${esc(label)}</th>${attempts.map((attempt,i)=>`<td data-label="${esc(labels[i])}">${esc(attempt ? answer(attempt.data,key) : 'Belum ada perbaikan')}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}

export function activityHistoryHTML(records = {}) {
  const activities = Object.keys(fields).filter(stage=>records[stage]?.initial).map(stage=>{
    const r=records[stage], revisions=r.revisions || [], latest=revisions.at(-1), hints=r.hints || [];
    const title=stages.find(s=>s.id===stage);
    return `<details class="activity-record"><summary><strong>${esc(title.label)} · ${esc(title.name)}</strong><span>${revisions.length} perbaikan · ${hints.length} bantuan tercatat</span></summary>
      <p class="micro">Jawaban awal: ${esc(stamp(r.initial.at))}${latest?` · Perbaikan terbaru: ${esc(stamp(latest.at))}`:''}</p>
      ${table(stage,[r.initial,latest],['Jawaban awal','Perbaikan terbaru'])}
      ${revisions.length>1?`<details class="revision-history"><summary>Lihat seluruh ${revisions.length} perbaikan</summary>${revisions.map((item,i)=>`<h4>Perbaikan ${i+1} · ${esc(stamp(item.at))}</h4>${table(stage,[item],[`Perbaikan ${i+1}`])}`).join('')}</details>`:''}
      <h4>Bantuan yang digunakan</h4>
      ${hints.length?`<ol class="hint-history">${hints.map(h=>`<li><strong>${Number.isInteger(h.step)?`Langkah ${h.step}`:'Langkah tidak tercatat'}${h.level?` · Petunjuk ${esc(h.level)}`:''}</strong><p>${esc(h.text || 'Bantuan Si KOMA dibuka. Isi petunjuk pada rekaman lama tidak tercatat.')}</p><small>${esc(stamp(h.at))}</small></li>`).join('')}</ol>`:'<p>Belum ada bantuan tercatat untuk aktivitas ini.</p>'}
    </details>`;
  }).join('');
  const video = records.video || [], lab=records.lab || [];
  return `<section class="activity-history"><h3>Jawaban aktivitas dan riwayat perbaikan</h3><p class="micro">Bandingkan jawaban awal dengan perbaikannya. Kualitas alasan tetap dinilai guru.</p>${activities || '<p>Belum ada jawaban aktivitas yang dikumpulkan.</p>'}
    ${video.length?`<details class="activity-record"><summary>Pengamatan video · ${video.length} catatan</summary>${video.map((v,i)=>`<article class="review-item"><h4>Pengamatan ${i+1} · ${esc(stamp(v.at))}</h4><dl><dt>Jenis pola</dt><dd>${esc(v.data?.kind || 'Belum diisi')}</dd><dt>Perubahan setiap langkah</dt><dd>${esc(v.data?.change || 'Belum diisi')}</dd><dt>Bukti</dt><dd>${esc(v.data?.proof || 'Belum diisi')}</dd></dl></article>`).join('')}</details>`:''}
    ${lab.length?`<details class="activity-record"><summary>Laboratorium Pola · ${lab.length} percobaan</summary>${lab.map((v,i)=>`<article class="review-item"><h4>Percobaan ${i+1} · ${esc(stamp(v.at))}</h4><p>Bilangan awal: ${esc(v.start)} · Perubahan: ${esc(v.step)} · Banyak posisi: ${esc(v.count)}</p><p>Dugaan: ${esc(v.prediction ?? 'Belum diisi')}</p><p>Aturan dan alasan: ${esc(v.reason || 'Belum diisi')}</p></article>`).join('')}</details>`:''}
  </section>`;
}
