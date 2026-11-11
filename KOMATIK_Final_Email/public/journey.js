import { esc } from './core.js';

export const stops = [
  ['Bekal Penjelajah',11,38,'lab'], ['Memahami Masalah',23,60,'garden'],
  ['Menemukan Pola',35,34,'bridge'], ['Membuat Aturan',47,60,'cave'],
  ['Menyusun Langkah',57,34,'light'], ['Kuis',67,60,'star'],
  ['Games',78,34,'camp'], ['Evaluasi',89,60,'book']
];

export function chartedMap(stages, state, isOpen) {
  const current = stages.findIndex(stage => !state.done.includes(stage.id));
  return `<section class="island-card" aria-label="Peta perjalanan Pulau Pola"><div class="atlas-intro"><div><span class="eyebrow">BERSAMA SI KOMA</span><h2>Pulau Pola</h2></div><div class="atlas-next">${current<0?'Seluruh tahap selesai':`Tujuan berikutnya · <strong>${stops[current][0]}</strong>`}</div></div><div class="atlas-scroll" tabindex="0" aria-label="Peta pulau. Geser ke samping pada layar kecil."><div class="atlas"><img class="map-drawing" src="assets/pulau-realistis.png" alt=""><svg class="atlas-grid" viewBox="0 0 1000 440" aria-hidden="true"><path d="M110 167 L230 264 L350 150 L470 264 L570 150 L670 264 L780 150 L890 264" fill="none" stroke="#fff5c7" stroke-width="12" stroke-linejoin="round"/><path d="M110 167 L230 264 L350 150 L470 264 L570 150 L670 264 L780 150 L890 264" fill="none" stroke="#146f67" stroke-width="4" stroke-dasharray="10 8"/></svg>${stages.map((stage,i)=>{
    const [name,x,y]=stops[i], done=state.done.includes(stage.id),open=isOpen(stage.id);
    const status=done?'Selesai':open?'Sedang dikerjakan':'Belum tersedia';
    return `<a class="map-pin ${done?'done':open?'ready':'locked'}" style="left:${x}%;top:${y+5}%" href="#${stage.id}" aria-label="${name}, ${stage.label}, ${status}"><b>${i+1}. ${name}</b><small>${stage.label} · ${status}</small></a>${i===(current===-1?7:current)?`<img class="map-koma" style="left:${x+5}%;top:${y+1}%" src="assets/koma.svg" alt="Posisi Si KOMA">`:''}`;
  }).join('')}</div></div><div class="atlas-footer"><span>${state.done.length} dari 8 tahap selesai</span><div class="button-row"><button class="btn" data-action="start">${state.student?'Lanjutkan belajar':'Mulai belajar'} →</button><button class="btn secondary" data-action="help">Petunjuk belajar</button></div></div></section>`;
}

export function scene(kind) {
  return `<div class="learning-scene"><img src="assets/scene-${kind}.svg" alt=""></div>`;
}

export function journalData(records) {
  const original=records.a1?.initial?.data||{};
  const latest=id=>records[id]?.revisions?.at(-1)?.data||records[id]?.initial?.data||{};
  return {guess:original.guess, basis:original.reason, pattern:latest('a2').relation, rule:latest('a3').rule,
    conclusion:latest('a4').conclusion,reflection:latest('a4').reflection};
}
export function journalMarkup(records) {
  const j=journalData(records);
  const entry=(label,value)=>`<div class="journal-entry"><h3>${label}</h3><p>${esc(value||'Belum dicatat.')}</p></div>`;
  return `<section class="journal card"><div class="eyebrow">BUKU PERJALANAN</div><h2>Catatan Penjelajahku</h2><div class="journal-spread">${entry('Dugaan awalku',j.guess!==undefined?`${j.guess} pot. ${j.basis||''}`:'')}${entry('Kesimpulanku setelah memeriksa',j.conclusion)}</div>${entry('Mengapa jawabanku berubah atau tetap?',j.reflection)}<details><summary>Lihat pola dan aturan yang kutemukan</summary>${entry('Hubungan antarpot',j.pattern)}${entry('Aturan dengan kata-kataku',j.rule)}</details></section>`;
}

const pot = '<i class="plant" aria-hidden="true"></i>';
export function pairingMarkup(draft) {
  const second=draft.pairTab===1, base=second?10:6, top=base+4;
  const paired=Boolean(draft.paired?.[second?1:0]);
  const row=(n,secondRow)=>`<div class="pair-row ${paired?'aligned':''}" style="--pot-count:${top}">${Array.from({length:top},(_,i)=>`<span class="pot-cell ${paired&&secondRow&&i>=base?'leftover':''}">${i<n?pot:''}</span>`).join('')}</div>`;
  return `<div class="pair-panel"><div class="button-row">${[0,1].map(i=>`<button type="button" class="btn small ${Number(second)===i?'':'secondary'}" data-action="pair-tab" data-index="${i}" aria-pressed="${Number(second)===i}">Baris ${i+1} dan ${i+2}</button>`).join('')}</div><div class="pot-pairs ${paired?'paired':''}"><small>Baris ${second?2:1} · ${base} pot</small>${row(base,false)}<small>Baris ${second?3:2} · ${top} pot</small>${row(top,true)}</div><button class="btn soft" type="button" data-action="pair">${paired?'Lepaskan pasangan':'Pasangkan pot'}</button><p class="pair-caption" aria-live="polite">${paired?`${base} pasang sejajar. Pot bergaris putus-putus belum mendapat pasangan. Hitung sendiri: ada berapa pot tambahan?`:'Pasangkan pot dari kedua baris. Perhatikan pot yang tersisa.'}</p></div>`;
}

export function bridgeMarkup(d, kind='increasing') {
  const down=kind==='decreasing';
  const label=down?'Pola mengecil':'Pola membesar';
  const values=down?[35,30,25,20,15]:[6,10,14,18,22];
  const fields=down?['down4','down5']:['row4','row5'];
  const complete=!!d && fields.every((key,i)=>String(d[key]??'').trim()!=='' && Number(d[key])===values[i+3]);
  const shown=values.map((v,i)=>i<3||complete?v:'?');
  return `<h3>${label}</h3><div class="bridge-feedback ${complete?'built':''}" role="img" aria-label="${label}: ${shown.join(', ')}"><div class="bank"></div>${shown.map((x,i)=>`<span class="plank ${i>2&&!complete?'gap':''}">${x}</span>`).join('')}<div class="bank"></div></div><p class="micro">${complete?`Jembatan tersambung! ${label}: setiap langkah ${down?'berkurang 5':'bertambah 4'}.`:`Dua papan pola ${down?'mengecil':'membesar'} belum tersambung. Lengkapi bilangan sesuai aturan, lalu simpan jawabanmu.`}</p>`;
}
