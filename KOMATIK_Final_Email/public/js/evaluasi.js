/* KOMATIK · Evaluasi formatif: 10 soal uraian singkat (2 soal per indikator penalaran matematis) */
(function () {
  const S = K.store, esc = K.esc;

  K.INDIKATOR = {
    dugaan: 'Mengajukan dugaan',
    pola: 'Menemukan pola atau hubungan',
    justifikasi: 'Memberikan justifikasi',
    generalisasi: 'Melakukan generalisasi',
    kesimpulan: 'Menarik kesimpulan'
  };

  K.EVAL = [
    { no: 1, ind: 'dugaan', soal: 'Dina menyusun kelereng ke dalam kotak. Kotak ke-1 berisi 4 kelereng, kotak ke-2 berisi 9 kelereng, dan kotak ke-3 berisi 14 kelereng. Dugalah isi kotak ke-5. Tuliskan dasar dugaanmu.', seq: [4, 9, 14, null, null],
      kunci: '24 kelereng', bahas: 'Setiap kotak bertambah 5 kelereng (4 ke 9, 9 ke 14). Dugaan yang beralasan: kotak ke-4 berisi 19 dan kotak ke-5 berisi 24 kelereng.' },
    { no: 2, ind: 'dugaan', soal: 'Air di tandon sekolah pada hari Senin 100 liter, Selasa 92 liter, dan Rabu 84 liter. Jika berkurang dengan cara yang sama, dugalah banyak air pada hari Jumat. Apa dasar dugaanmu?', seq: [100, 92, 84],
      kunci: '68 liter', bahas: 'Setiap hari berkurang 8 liter. Kamis: 84 − 8 = 76 liter, Jumat: 76 − 8 = 68 liter.' },
    { no: 3, ind: 'pola', soal: 'Perhatikan pola 15, 21, 27, 33. Bandingkan sedikitnya dua pasangan bilangan. Apa hubungan antarbilangannya dan berapa bilangan berikutnya?', seq: [15, 21, 27, 33, null],
      kunci: 'Tambah 6; bilangan berikutnya 39', bahas: '15 ke 21 bertambah 6, 21 ke 27 bertambah 6, 27 ke 33 bertambah 6. Hubungannya tetap tambah 6, jadi 33 + 6 = 39.' },
    { no: 4, ind: 'pola', soal: 'Perhatikan pola 75, 68, 61, 54. Apa hubungan antarbilangannya dan berapa bilangan berikutnya?', seq: [75, 68, 61, 54, null],
      kunci: 'Kurangi 7; bilangan berikutnya 47', bahas: '75 ke 68 berkurang 7, 68 ke 61 berkurang 7, 61 ke 54 berkurang 7. Jadi 54 − 7 = 47.' },
    { no: 5, ind: 'justifikasi', soal: 'Raka berkata bahwa aturan pola 3, 7, 11, 15 adalah "tambah 4". Apakah Raka benar? Buktikan dengan perhitungan.', seq: [3, 7, 11, 15],
      kunci: 'Benar', bahas: 'Raka benar karena 3 + 4 = 7, 7 + 4 = 11, dan 11 + 4 = 15. Aturan tambah 4 cocok untuk semua pasangan.' },
    { no: 6, ind: 'justifikasi', soal: 'Sari berkata bahwa bilangan berikutnya dari pola 50, 44, 38, 32 adalah 28. Setujukah kamu? Berikan alasanmu.', seq: [50, 44, 38, 32, null],
      kunci: 'Tidak setuju; seharusnya 26', bahas: 'Pola berkurang 6 setiap kali (50 − 6 = 44, 44 − 6 = 38, 38 − 6 = 32). Bilangan berikutnya 32 − 6 = 26, bukan 28.' },
    { no: 7, ind: 'generalisasi', soal: 'Baris pertama kursi di aula berisi 9 kursi. Setiap baris berikutnya bertambah 3 kursi. Berapa kursi pada baris ke-7? Jelaskan aturan yang kamu gunakan.',
      kunci: '27 kursi', bahas: 'Aturan: mulai dari 9, tambah 3 setiap baris. Dari baris 1 ke baris 7 ada 6 kali penambahan: 9, 12, 15, 18, 21, 24, 27.' },
    { no: 8, ind: 'generalisasi', soal: 'Banyak buku pada tumpukan di perpustakaan membentuk pola 64, 58, 52, ... Berapa banyak buku pada tumpukan ke-6? Jelaskan aturan yang kamu gunakan.', seq: [64, 58, 52, null, null, null],
      kunci: '34 buku', bahas: 'Aturan: mulai dari 64, kurangi 6 setiap tumpukan. 64, 58, 52, 46, 40, 34. Tumpukan ke-6 berisi 34 buku.' },
    { no: 9, ind: 'kesimpulan', soal: 'Kelereng Beni pada minggu ke-1 ada 12, minggu ke-2 ada 20, dan minggu ke-3 ada 28. Polanya tetap. Pada minggu ke berapa kelereng Beni pertama kali lebih dari 50? Tuliskan langkah dan kesimpulanmu.',
      kunci: 'Minggu ke-6 (52 kelereng)', bahas: 'Bertambah 8 setiap minggu: 12, 20, 28, 36, 44, 52. Pada minggu ke-5 baru 44 (belum lebih dari 50). Kesimpulan: minggu ke-6, dengan 52 kelereng.' },
    { no: 10, ind: 'kesimpulan', soal: 'Sisa halaman buku cerita Ani yang belum dibaca: hari ke-1 90 halaman, hari ke-2 78 halaman, hari ke-3 66 halaman. Pada hari ke berapa sisa halamannya tinggal 30? Tuliskan langkah dan kesimpulanmu.',
      kunci: 'Hari ke-6', bahas: 'Berkurang 12 setiap hari: 90, 78, 66, 54, 42, 30. Kesimpulan: sisa halaman tinggal 30 pada hari ke-6.' }
  ];

  K.buildReport = function () {
    const d = S.data, ev = d.evaluasi;
    const src = ev.dikumpulkan ? ev.jawabanKumpul : ev.draft;
    const aktivitas = [];
    K.ACTS.forEach((A, ai) => A.steps.forEach((st, si) => {
      const r = d.respon[`a${ai + 1}.s${si + 1}`];
      if (r) aktivitas.push({ aktivitas: `Aktivitas ${ai + 1}: ${A.title}`, komponenCT: A.ct, langkah: `${si + 1}. ${st.title}`, jawabanAwal: r.awal, perbaikan: r.perbaikan, selesai: r.selesai });
    }));
    return {
      app: 'KOMATIK', jenis: 'laporan-evaluasi', versi: 1,
      siswa: d.profil,
      dibuat: new Date().toISOString(),
      evaluasi: { dikumpulkan: ev.dikumpulkan, waktuKumpul: ev.waktuKumpul,
        butir: K.EVAL.map(e => ({ no: e.no, indikator: K.INDIKATOR[e.ind], kodeIndikator: e.ind, soal: e.soal, jawaban: (src[e.no] || {}).jawaban || '', alasan: (src[e.no] || {}).alasan || '' })) },
      aktivitas,
      kuis: d.kuis,
      games: d.games,
      kemajuan: d.progress
    };
  };

  function downloadReport() {
    const p = S.data.profil;
    K.download(`KOMATIK_${p.kelas}_${p.kode}.json`.replace(/[^\w.\-]+/g, '_'), JSON.stringify(K.buildReport(), null, 2));
    K.toast('📥 Laporan diunduh. Serahkan berkas ini kepada Bapak/Ibu Guru.');
  }

  K.pages.evaluasi = function (app) {
    if (!S.isOpen('evaluasi')) {
      const prev = S.ORDER[S.ORDER.indexOf('evaluasi') - 1];
      app.innerHTML = `<div class="card center">${K.say(`Mercusuar Evaluasi masih terkunci. Selesaikan <b>${S.STAGE_NAMES[prev]}</b> dulu, ya!`, 'pikir')}<a class="btn btn-primary" href="#/beranda">🏝️ Kembali ke peta</a></div>`;
      return;
    }
    const ev = S.data.evaluasi;
    if (ev.dikumpulkan) return doneView(app);
    formView(app);
  };

  function formView(app) {
    const ev = S.data.evaluasi;
    app.innerHTML = `<div id="evalWrap"><span class="tag">Mercusuar Evaluasi</span><h1 style="margin-top:8px">📝 Evaluasi Penalaran Pola Bilangan</h1>
      ${K.say('Ada <b>10 soal uraian singkat</b>. Kerjakan sendiri, ya. Tulis <b>jawaban akhir</b> dan <b>alasan atau langkahmu</b>. Jawabanmu tersimpan otomatis. Setelah selesai, tinjau dulu sebelum dikumpulkan.', 'senang')}
      <div class="card soft row" style="justify-content:space-between"><b id="fillCount"></b><div class="progress" style="flex:1;max-width:420px"><i id="fillBar"></i></div></div>
      ${K.EVAL.map(e => `<div class="eval-item" data-no="${e.no}">
        <div class="head"><span class="no">${e.no}</span><span class="tag ${['', 'coral', 'sun', 'berry', 'leaf'][Object.keys(K.INDIKATOR).indexOf(e.ind)]}">${K.INDIKATOR[e.ind]}</span></div>
        <p style="font-weight:700">${e.soal}</p>${e.seq ? K.seqHTML(e.seq, { q: e.seq.map((v, i) => v === null ? i : -1) }) : ''}
        <div class="ans"><div><label class="lbl" for="j${e.no}">Jawaban akhir</label><input type="text" id="j${e.no}" data-k="jawaban" maxlength="80"></div>
        <div><label class="lbl" for="a${e.no}">Alasan atau langkah penyelesaian</label><textarea id="a${e.no}" data-k="alasan"></textarea></div></div></div>`).join('')}
      <div class="row"><button class="btn btn-primary" id="review">👀 Tinjau jawabanku</button><a class="btn btn-ghost" href="#/beranda">🏝️ Kembali ke peta</a></div></div>`;
    K.EVAL.forEach(e => {
      const d = ev.draft[e.no] || {};
      K.$(`#j${e.no}`).value = d.jawaban || ''; K.$(`#a${e.no}`).value = d.alasan || '';
    });
    function update() {
      if (!K.$('#evalWrap')) return 0;
      let n = 0;
      K.EVAL.forEach(e => {
        const d = ev.draft[e.no] = { jawaban: K.$(`#j${e.no}`).value.trim(), alasan: K.$(`#a${e.no}`).value.trim() };
        const full = d.jawaban && d.alasan; if (full) n++;
        K.$(`.eval-item[data-no="${e.no}"]`).classList.toggle('filled', !!full);
      });
      K.$('#fillCount').textContent = `✏️ ${n} dari 10 soal terisi lengkap`;
      K.$('#fillBar').style.width = n * 10 + '%';
      return n;
    }
    K.$('#evalWrap').addEventListener('input', () => { update(); S.save(); });
    update();
    K.$('#review').onclick = () => { update(); S.save(); reviewView(app); };
  }

  function reviewView(app) {
    const ev = S.data.evaluasi;
    const empty = K.EVAL.filter(e => !(ev.draft[e.no] && ev.draft[e.no].jawaban && ev.draft[e.no].alasan));
    app.innerHTML = `<h1>👀 Tinjau Jawabanmu</h1>
      ${K.say(empty.length ? `Masih ada <b>${empty.length} soal</b> yang belum lengkap (nomor ${empty.map(e => e.no).join(', ')}). Lengkapi dulu agar Bapak/Ibu Guru bisa membaca alasanmu.` : 'Semua soal sudah terisi. Baca sekali lagi. Apakah alasanmu sudah jelas? Jika sudah yakin, kumpulkan!', empty.length ? 'pikir' : 'hore')}
      <div class="card" style="overflow-x:auto"><table class="review-table"><thead><tr><th>No</th><th>Indikator</th><th>Jawaban akhir</th><th>Alasan atau langkah</th></tr></thead><tbody>
      ${K.EVAL.map(e => { const d = ev.draft[e.no] || {}; return `<tr><td><b>${e.no}</b></td><td class="small">${K.INDIKATOR[e.ind]}</td>
        <td>${d.jawaban ? esc(d.jawaban) : '<span class="empty">(kosong)</span>'}</td><td>${d.alasan ? esc(d.alasan) : '<span class="empty">(kosong)</span>'}</td></tr>`; }).join('')}
      </tbody></table></div>
      <div class="tip">🔒 Setelah dikumpulkan, jawaban <b>terkunci</b> dan tidak bisa diubah lagi. Setelah itu kamu bisa membuka laporan untuk guru. Nilai diberikan secara manual.</div>
      <div class="row"><button class="btn btn-ghost" id="edit">✏️ Ubah jawaban</button><button class="btn btn-primary" id="submit">📤 Kumpulkan jawaban</button></div>`;
    K.$('#edit').onclick = () => formView(app);
    K.$('#submit').onclick = () => K.modal({
      title: 'Kumpulkan jawaban?',
      body: `<p>${empty.length ? `<b>${empty.length} soal masih belum lengkap.</b> ` : ''}Setelah dikumpulkan, jawaban tidak bisa diubah lagi.</p>`,
      actions: [{ label: 'Periksa lagi' }, { label: 'Ya, kumpulkan', primary: true, onClick: async () => {
        try { await K.cloud.flush(); } catch(e) { K.toast(esc(e.message)); return; }
        ev.dikumpulkan = true; ev.waktuKumpul = new Date().toISOString();
        ev.jawabanKumpul = JSON.parse(JSON.stringify(ev.draft));
        S.markDone('evaluasi'); S.save(); K.sound('win'); K.confetti();
        try { await K.cloud.flush(); } catch(e) { K.toast(esc(e.message)); }
        doneView(app);
      } }]
    });
  }

  function doneView(app) {
    const ev=S.data.evaluasi,src=ev.jawabanKumpul||ev.draft;
    app.innerHTML=`<span class="tag">Mercusuar Evaluasi</span><h1>Jawaban evaluasimu sudah dicatat</h1>
      ${K.say('Terima kasih sudah menuliskan pemikiranmu! Guru akan membaca jawaban dan alasanmu, lalu menilainya dengan rubrik. Evaluasi tidak mengurangi poin aktivitas atau kuis.','hore')}
      <div class="card"><p id="submissionStatus" role="status">${K.cloud.isDirty()?'Masih menunggu sinkronisasi. Tekan Simpan progres sebelum keluar.':'✓ Jawaban tersimpan di server dan tersedia di Ruang Guru.'}</p><p>Jawaban dikunci setelah dikumpulkan. Belum ada nilai otomatis.</p><div class="row"><button class="btn btn-primary" id="sendTeacher">Kirim PDF ke email guru</button><button class="btn btn-ghost" id="dl">Unduh cadangan jawaban</button><button class="btn btn-ghost" id="printEval">Cetak jawaban</button></div><p id="emailStatus" role="status"></p></div>
      ${K.EVAL.map(e=>{const a=src[e.no]||{};return `<div class="eval-item"><h3>Soal ${e.no}</h3><p>${e.soal}</p><p><b>Jawaban:</b> ${esc(a.jawaban||'(kosong)')}</p><p><b>Alasan:</b> ${esc(a.alasan||'(kosong)')}</p></div>`;}).join('')}`;
    K.$('#dl').onclick=downloadReport;K.$('#printEval').onclick=()=>window.print();
    K.$('#sendTeacher').onclick=async e=>{e.target.disabled=true;try{await K.cloud.flush();const r=await K.api('email');K.$('#emailStatus').textContent=r.sent?'✓ PDF jawaban diterima layanan pengiriman email. Guru dapat memeriksa kotak masuk atau spam.':r.message;K.$('#submissionStatus').textContent='✓ Jawaban tersimpan di server dan tersedia di Ruang Guru.';}catch(x){K.$('#emailStatus').textContent=x.message;}finally{e.target.disabled=false;}};
  }
})();
