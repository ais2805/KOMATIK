/* KOMATIK · Empat aktivitas berbasis berpikir komputasional
   Masalah berkelanjutan: Si KOMA menata pot: baris 1 = 6, baris 2 = 10, baris 3 = 14. Berapa pot pada baris kelima? */
(function () {
  const S = K.store, esc = K.esc;

  /* ---------- gambar kebun ---------- */
  function garden(rows, opt) {
    opt = opt || {};
    return `<div class="garden">${rows.map((n, i) => {
      const lbl = `Baris ${opt.labels ? opt.labels[i] : i + 1}`;
      if (n === null) return `<div class="grow"><span class="glabel">${lbl}</span><span class="mystery">? pot</span></div>`;
      return `<div class="grow"><span class="glabel">${lbl}</span>${K.potRow(n, { each: opt.each, extraFrom: opt.extra ? opt.extra[i] : null })}<span class="gcount">${opt.hideCount ? '' : n + ' pot'}</span></div>`;
    }).join('')}</div>`;
  }
  const COLORS = ['#d9733b', '#5b8def', '#e8b23a', '#d9733b', '#8a5cf6', '#e8b23a'];
  const mixed = i => ({ color: COLORS[(i * 7) % COLORS.length], rim: '#5a4a3a', shape: i % 3 === 1 ? 'kotak' : 'bulat', flower: ['#ff5d8f', '#ffd84d', '#ffffff'][i % 3] });

  function pairWidget(a, b) {
    return `<div class="pair-wrap card soft" style="margin:0">
      <div class="garden" style="background:transparent;padding:0">
        <div class="grow"><span class="glabel">Baris ${a.row}</span>${K.potRow(a.n)}<span class="gcount">${a.n} pot</span></div>
        <div class="grow pairtarget"><span class="glabel">Baris ${b.row}</span>${K.potRow(b.n, { extraFrom: 999 })}<span class="gcount">${b.n} pot</span></div>
      </div>
      <div class="row" style="margin-top:10px"><button type="button" class="btn btn-sun btn-sm pairbtn" data-a="${a.n}">🔗 Pasangkan pot</button><span class="pairmsg muted small"></span></div></div>`;
  }
  function mountPair(el) {
    const btn = el.querySelector('.pairbtn'); if (!btn) return;
    btn.onclick = () => {
      const a = +btn.dataset.a, row = el.querySelector('.pairtarget .potrow'), pots = row.querySelectorAll('.pot');
      const on = !row.classList.contains('paired');
      row.classList.toggle('paired', on);
      pots.forEach((p, i) => p.classList.toggle('pot-extra', on && i >= a));
      el.querySelector('.pairmsg').innerHTML = on ? `Pot redup sudah punya pasangan di baris atas. Pot <b>bercahaya</b> adalah pot tambahan. Hitung pot bercahaya!` : '';
      btn.textContent = on ? '↩ Lepaskan pasangan' : '🔗 Pasangkan pot';
      K.sound('click');
    };
  }

  /* ---------- definisi aktivitas ---------- */
  const STORY = 'Si KOMA menata pot bunga di taman. Baris pertama ada <b>6 pot</b>, baris kedua <b>10 pot</b>, dan baris ketiga <b>14 pot</b>. Banyak pot bertambah tetap pada setiap baris. <b>Berapa banyak pot pada baris kelima? Bagaimana cara memperolehnya?</b>';
  const TXT_HINT_KEYS = (keys, msg) => ({ keys, msg });

  K.ACTS = [
    {
      title: 'Memahami Masalah', ico: '🔍', ct: 'Dekomposisi', ind: 'Mengajukan dugaan', place: 'Pantai Memahami',
      desc: 'Pecah masalah pot bunga menjadi bagian kecil, lalu ajukan dugaan awalmu.',
      steps: [
        { title: 'Kenali masalahnya', mood: 'senang', say: STORY,
          visual: () => garden([6, 10, 14, null, null]),
          fields: [{ id: 'tanya', type: 'choice', q: 'Apa yang ditanyakan Si KOMA?', answer: 'b',
            options: [{ v: 'a', t: 'Banyak semua pot di taman' }, { v: 'b', t: 'Banyak pot pada baris kelima dan cara memperolehnya' }, { v: 'c', t: 'Warna pot pada baris pertama' }],
            hint: 'Baca lagi kalimat terakhir Si KOMA. Baris ke berapa yang ditanyakan?' }],
          okMsg: 'Tepat! Kita harus mencari banyak pot pada <b>baris kelima</b> dan menjelaskan caranya.' },
        { title: 'Pilah informasi', mood: 'pikir', say: 'Dekomposisi artinya memecah masalah. Pilah setiap kartu: termasuk yang <b>diketahui</b>, yang <b>ditanyakan</b>, atau <b>tidak diperlukan</b>?',
          fields: [{ id: 'kartu', type: 'cards', cats: [{ v: 'tahu', t: 'Diketahui' }, { v: 'tanya', t: 'Ditanyakan' }, { v: 'tidak', t: 'Tidak diperlukan' }],
            items: [{ t: 'Baris pertama ada 6 pot', a: 'tahu' }, { t: 'Si KOMA memakai topi cokelat', a: 'tidak' }, { t: 'Baris kedua ada 10 pot', a: 'tahu' },
              { t: 'Banyak pot pada baris kelima', a: 'tanya' }, { t: 'Baris ketiga ada 14 pot', a: 'tahu' }, { t: 'Taman Si KOMA dekat pantai', a: 'tidak' },
              { t: 'Cara memperoleh banyak pot baris kelima', a: 'tanya' }],
            hint: 'Informasi yang diketahui berupa bilangan dari cerita. Informasi yang tidak memengaruhi banyak pot tidak diperlukan.' }],
          okMsg: 'Hebat! Kamu sudah memisahkan informasi penting dari yang tidak diperlukan.' },
        { title: 'Pecah jadi pertanyaan kecil', mood: 'pikir', say: 'Masalah besar lebih mudah jika dipecah menjadi <b>pertanyaan kecil</b>. Pilih semua pertanyaan kecil yang membantu menjawab masalah Si KOMA.',
          visual: () => garden([6, 10, 14]),
          fields: [{ id: 'kecil', type: 'multi', q: 'Pertanyaan kecil yang membantu (boleh lebih dari satu):',
            options: [{ v: 'a', t: 'Berapa perubahan banyak pot dari baris 1 ke baris 2?', ok: true }, { v: 'b', t: 'Apa warna bunga di dalam pot?', ok: false },
              { v: 'c', t: 'Apakah perubahan dari baris 2 ke baris 3 sama besarnya?', ok: true }, { v: 'd', t: 'Berapa harga satu pot bunga?', ok: false },
              { v: 'e', t: 'Berapa banyak pot pada baris keempat?', ok: true }],
            hint: 'Pilih pertanyaan yang berhubungan dengan <b>banyak pot</b> dan <b>perubahannya</b>. Ada tiga pertanyaan yang membantu.' }],
          okMsg: 'Keren! Tiga pertanyaan kecil itu akan menuntun kita ke jawaban.' },
        { title: 'Dugaan awalku', mood: 'ayo', say: 'Sekarang ajukan <b>dugaanmu</b>. Tidak apa-apa kalau belum yakin. Dugaan ini akan kita periksa di aktivitas berikutnya.',
          visual: () => garden([6, 10, 14, null, null]),
          autoOk: true,
          fields: [{ id: 'dugaan', type: 'number', q: 'Menurut dugaanku, baris kelima berisi ... pot', suffix: 'pot' },
            { id: 'dasar', type: 'text', q: 'Dasar dugaanku (mengapa aku menduga begitu?)', ph: 'Aku menduga begitu karena ...',
              soft: TXT_HINT_KEYS([['6', '10', '14', 'tambah', 'bertambah', 'baris']], 'Dugaan yang kuat memakai informasi dari cerita. Coba sebutkan bilangan atau perubahan yang kamu lihat.') }],
          okMsg: '📒 Dugaanmu sudah tersimpan di <b>Catatan Penjelajahku</b>. Kita akan memeriksanya bersama nanti!' }
      ]
    },
    {
      title: 'Menemukan Pola', ico: '🌴', ct: 'Pengenalan pola', ind: 'Menemukan pola atau hubungan', place: 'Hutan Pola',
      desc: 'Pasangkan pot, bandingkan perubahan antarbaris, dan temukan keteraturannya pada pola membesar dan mengecil.',
      steps: [
        { title: 'Pasangkan pot: baris 1 dan baris 2', mood: 'pikir', say: 'Tekan <b>Pasangkan pot</b>. Setiap pot di baris 1 akan berpasangan dengan pot di baris 2. Pot yang tidak punya pasangan adalah <b>pot tambahan</b>.',
          visual: () => pairWidget({ row: 1, n: 6 }, { row: 2, n: 10 }), mount: mountPair,
          fields: [{ id: 'tambah12', type: 'number', q: 'Berapa pot tambahan pada baris kedua?', suffix: 'pot', answer: 4,
            hint: n => n === 10 ? '10 adalah <b>banyak seluruh pot</b> di baris kedua. Yang ditanya adalah pot <b>tambahannya</b> saja. Hitung pot bercahaya.' : 'Tekan tombol Pasangkan pot, lalu hitung pot bercahaya yang tidak punya pasangan.' }],
          okMsg: 'Betul! Dari 6 ke 10 bertambah <b>4 pot</b>.' },
        { title: 'Pasangkan pot: baris 2 dan baris 3', mood: 'pikir', say: 'Satu pasangan belum cukup! Bandingkan juga <b>pasangan kedua</b>: baris 2 dan baris 3.',
          visual: () => pairWidget({ row: 2, n: 10 }, { row: 3, n: 14 }), mount: mountPair,
          fields: [{ id: 'tambah23', type: 'number', q: 'Berapa pot tambahan pada baris ketiga?', suffix: 'pot', answer: 4,
            hint: n => n === 14 ? '14 adalah banyak seluruh pot di baris ketiga. Hitung pot tambahannya saja.' : 'Pasangkan pot baris 2 dan baris 3, lalu hitung pot bercahaya.' },
            { id: 'pola', type: 'choice', q: 'Keteraturan apa yang kamu temukan?', answer: 'a',
              options: [{ v: 'a', t: 'Setiap baris bertambah 4 pot' }, { v: 'b', t: 'Setiap baris bertambah 10 pot' }, { v: 'c', t: 'Banyak pot selalu dikali 2' }],
              hint: 'Lihat kembali dua jawabanmu: dari baris 1 ke 2 bertambah berapa? Dari baris 2 ke 3 bertambah berapa?' },
            { id: 'jelas', type: 'text', q: 'Jelaskan hubungan yang kamu temukan dengan kata-katamu sendiri.', ph: 'Aku menemukan bahwa ...',
              soft: TXT_HINT_KEYS([['4', 'empat'], ['tambah', 'bertambah', 'lebih', '+']], 'Penjelasan akan lebih kuat jika menyebut <b>berapa</b> pot bertambah dan bahwa perubahannya <b>sama</b> pada kedua pasangan.') }],
          okMsg: 'Kamu menemukan polanya! Kedua pasangan sama-sama bertambah <b>4</b>.' },
        { title: 'Lengkapi baris 4 dan baris 5', mood: 'ayo', say: 'Gunakan keteraturan yang kamu temukan untuk melengkapi baris berikutnya.',
          visual: () => K.seqHTML([6, 10, 14, null, null], { jumps: false, q: [3, 4] }),
          fields: [{ id: 'b4', type: 'number', q: 'Baris keempat berisi', suffix: 'pot', answer: 18, hint: 'Baris ketiga ada 14 pot. Tambahkan pot tambahan yang sama seperti sebelumnya.' },
            { id: 'b5', type: 'number', q: 'Baris kelima berisi', suffix: 'pot', answer: 22, hint: 'Mulai dari banyak pot baris keempat, lalu tambahkan 4.' }],
          okMsg: 'Mantap! 14 + 4 = 18 dan 18 + 4 = 22. Bandingkan dengan dugaan awalmu di Catatan Penjelajahku!' },
        { title: 'Detektif pola', mood: 'pikir', say: 'Teman Si KOMA menulis susunan pot <b>6, 10, 15, 18</b>. Ada satu bilangan yang membuat perubahannya tidak sama. Temukan!',
          visual: () => K.seqHTML([6, 10, 15, 18], { jumps: true }),
          fields: [{ id: 'salah', type: 'choice', q: 'Bilangan mana yang perlu diperbaiki?', answer: '15',
            options: [{ v: '6', t: '6' }, { v: '10', t: '10' }, { v: '15', t: '15' }, { v: '18', t: '18' }],
            hint: 'Lihat label perubahan di antara bilangan. Perubahan mana yang berbeda dari yang lain?' },
            { id: 'benar', type: 'number', q: 'Seharusnya bilangan itu adalah', answer: 14, hint: 'Agar perubahannya tetap 4, bilangan setelah 10 adalah 10 + 4.' },
            { id: 'alasan', type: 'text', q: 'Mengapa bilangan itu perlu diperbaiki?', ph: 'Bilangan itu perlu diperbaiki karena ...',
              soft: TXT_HINT_KEYS([['4', 'empat', '5', 'lima', 'sama']], 'Coba jelaskan perubahan yang seharusnya tetap sama pada setiap pasangan.') }],
          okMsg: 'Detektif hebat! Dengan 14, perubahannya tetap: 6, 10, 14, 18 selalu bertambah 4.' },
        { title: 'Pola mengecil', mood: 'senang', say: 'Si KOMA membagikan bibit bunga kepada teman-temannya. Sisa bibitnya setiap hari: <b>35, 30, 25</b>, ... Bandingkan perubahannya!',
          visual: () => K.seqHTML([35, 30, 25, null, null], { q: [3, 4] }),
          fields: [{ id: 'k1', type: 'number', q: 'Dari 35 ke 30 berkurang', answer: 5, hint: 'Hitung 35 − 30.' },
            { id: 'k2', type: 'number', q: 'Dari 30 ke 25 berkurang', answer: 5, hint: 'Hitung 30 − 25.' },
            { id: 'n4', type: 'number', q: 'Bilangan keempat', answer: 20, hint: 'Pola ini mengecil. Kurangi 25 dengan perubahan yang sama.' },
            { id: 'n5', type: 'number', q: 'Bilangan kelima', answer: 15, hint: 'Kurangi bilangan keempat dengan 5.' },
            { id: 'alasan', type: 'text', q: 'Jelaskan bagaimana kamu memperoleh dua bilangan tersebut.', ph: 'Aku memperolehnya dengan ...',
              soft: TXT_HINT_KEYS([['5', 'lima'], ['kurang', 'berkurang', '−', '-', 'dikurangi']], 'Sebutkan bahwa kedua pasangan sama-sama <b>berkurang 5</b>, lalu tunjukkan perhitungannya.') }],
          okMsg: 'Tepat! Kedua pasangan sama-sama berkurang 5, jadi 25 − 5 = 20 dan 20 − 5 = 15.' },
        { title: 'Latihan tambahan', mood: 'ayo', say: 'Satu latihan lagi agar kamu makin jago menemukan pola. Bandingkan sedikitnya dua pasangan pada setiap pola!',
          visual: () => `<div class="grid2"><div><b>Pola A</b>${K.seqHTML([12, 15, 18, null], { q: [3] })}</div><div><b>Pola B</b>${K.seqHTML([80, 72, 64, null], { q: [3] })}</div></div>`,
          fields: [{ id: 'pa', type: 'number', q: 'Bilangan berikutnya pada Pola A', answer: 21, hint: '12 ke 15 bertambah berapa? 15 ke 18 bertambah berapa?' },
            { id: 'pb', type: 'number', q: 'Bilangan berikutnya pada Pola B', answer: 56, hint: '80 ke 72 berkurang berapa? 72 ke 64 berkurang berapa?' },
            { id: 'jelas', type: 'text', q: 'Pola mana yang membesar dan mana yang mengecil? Jelaskan aturannya.', ph: 'Pola A ... karena ..., Pola B ... karena ...',
              soft: TXT_HINT_KEYS([['membesar', 'naik', 'tambah', 'bertambah'], ['mengecil', 'turun', 'kurang', 'berkurang']], 'Sebutkan jenis pola A dan B serta besar perubahannya (3 dan 8).') }],
          okMsg: 'Luar biasa! Pola A membesar (tambah 3) dan Pola B mengecil (kurangi 8).' }
      ]
    },
    {
      title: 'Membuat Aturan', ico: '⛰️', ct: 'Abstraksi', ind: 'Memberikan justifikasi dan melakukan generalisasi', place: 'Bukit Aturan',
      desc: 'Pilih informasi penting, rumuskan aturan, buktikan, lalu gunakan pada baris baru.',
      steps: [
        { title: 'Pilih informasi penting', mood: 'pikir', say: 'Pot di taman Si KOMA warna dan bentuknya berbeda-beda. Apakah itu memengaruhi <b>banyak</b> pot? Pilah mana informasi yang penting.',
          visual: () => garden([6, 10, 14], { each: mixed }),
          fields: [{ id: 'info', type: 'cards', cats: [{ v: 'p', t: 'Penting' }, { v: 'x', t: 'Tidak penting' }],
            items: [{ t: 'Banyak pot pada baris pertama (6 pot)', a: 'p' }, { t: 'Warna pot (oranye, biru, kuning, ungu)', a: 'x' }, { t: 'Perubahan setiap baris (4 pot)', a: 'p' },
              { t: 'Bentuk pot (bulat atau kotak)', a: 'x' }, { t: 'Baris yang ditanyakan (baris kelima)', a: 'p' }, { t: 'Warna bunga di dalam pot', a: 'x' }],
            hint: 'Tanyakan pada dirimu: jika informasi ini diubah, apakah banyak pot berubah? Jika tidak, berarti tidak penting.' }],
          okMsg: 'Itulah abstraksi: memilih hanya informasi yang penting untuk menghitung.' },
        { title: 'Rumuskan aturannya', mood: 'ayo', say: 'Sekarang susun <b>aturan</b> pola pot dengan melengkapi kalimat di bawah.',
          fields: [{ id: 'kal', type: 'sentence', parts: ['Mulai dari', { id: 'awal', num: true, answer: 6 }, 'pot, lalu', { id: 'op', options: ['pilih', 'tambahkan', 'kurangi'], answer: 'tambahkan' },
            { id: 'ubah', num: true, answer: 4 }, 'pot setiap berpindah satu baris.'],
            hint: 'Lihat banyak pot pada baris pertama dan besar perubahan yang kamu temukan di Hutan Pola. Polanya membesar atau mengecil?' },
            { id: 'kataku', type: 'text', q: 'Tulis aturanmu dengan kata-katamu sendiri.', ph: 'Aturannya adalah ...',
              soft: TXT_HINT_KEYS([['6', 'enam'], ['4', 'empat']], 'Aturan yang lengkap menyebut <b>bilangan awal</b> (6) dan <b>besar perubahan</b> (4).') }],
          okMsg: 'Aturanmu: mulai dari 6 pot, lalu tambahkan 4 pot setiap berpindah satu baris.' },
        { title: 'Buktikan aturanmu', mood: 'pikir', say: 'Penjelajah hebat selalu <b>membuktikan</b> aturannya. Periksa aturanmu pada dua perpindahan baris.',
          visual: () => garden([6, 10, 14], { extra: [null, 6, 10] }),
          fields: [{ id: 'bukti1', type: 'sentence', parts: ['Baris 1 ke baris 2: 6 + 4 =', { id: 'h1', num: true, answer: 10 }], hint: 'Hitung 6 + 4.' },
            { id: 'bukti2', type: 'sentence', parts: ['Baris 2 ke baris 3: 10 + 4 =', { id: 'h2', num: true, answer: 14 }], hint: 'Hitung 10 + 4.' },
            { id: 'cocok', type: 'choice', q: 'Apakah hasilnya sama dengan banyak pot di taman?', answer: 'ya', options: [{ v: 'ya', t: 'Ya, sama: 10 dan 14' }, { v: 'tidak', t: 'Tidak sama' }], hint: 'Bandingkan hasil hitunganmu dengan banyak pot pada gambar.' },
            { id: 'alasan', type: 'text', q: 'Mengapa aturanmu benar? Tuliskan buktinya.', ph: 'Aturanku benar karena ...',
              soft: TXT_HINT_KEYS([['10'], ['14']], 'Tunjukkan buktinya, misalnya: 6 + 4 = 10 dan 10 + 4 = 14, sama dengan banyak pot di taman.') }],
          okMsg: 'Terbukti! Aturanmu cocok untuk dua perpindahan baris.' },
        { title: 'Gunakan aturan pada baris baru', mood: 'ayo', say: 'Aturan yang benar bisa dipakai untuk baris <b>mana saja</b>. Coba gunakan aturanmu!',
          visual: () => K.seqHTML([6, 10, 14, 18, 22, null, null, null], { q: [5, 7] }),
          fields: [{ id: 'b6', type: 'number', q: 'Baris keenam berisi', suffix: 'pot', answer: 26, hint: 'Baris kelima ada 22 pot. Gunakan aturan: tambahkan 4.' },
            { id: 'b8', type: 'number', q: 'Baris kedelapan berisi', suffix: 'pot', answer: 34, hint: 'Lanjutkan aturan dari baris keenam: tambah 4 untuk baris ketujuh, lalu tambah 4 lagi.' },
            { id: 'cara', type: 'text', q: 'Bagaimana caramu menemukan banyak pot baris keenam?', ph: 'Caraku adalah ...',
              soft: TXT_HINT_KEYS([['4', 'empat'], ['22', '26', 'tambah', 'aturan']], 'Sebutkan aturan yang kamu gunakan dan hitungannya, misalnya 22 + 4 = 26.') }],
          okMsg: 'Kamu berhasil melakukan <b>generalisasi</b>: memakai aturan untuk baris yang belum terlihat!' }
      ]
    },
    {
      title: 'Menyusun Langkah', ico: '🧩', ct: 'Berpikir algoritmik', ind: 'Menarik kesimpulan', place: 'Menara Langkah',
      desc: 'Urutkan, jalankan, dan periksa langkah penyelesaian, lalu tarik kesimpulan.',
      steps: [
        { title: 'Urutkan langkahnya', mood: 'pikir', say: 'Langkah penyelesaian masalah pot teracak! Gunakan tombol ⬆️ dan ⬇️ untuk menyusunnya dengan urutan yang benar.',
          fields: [{ id: 'urut', type: 'order', start: [2, 4, 0, 3, 1],
            items: ['Lihat banyak pot pada baris pertama: 6 pot.', 'Tentukan perubahan setiap baris: tambah 4 pot.', 'Hitung banyaknya perpindahan dari baris 1 ke baris 5: 4 kali.',
              'Tambahkan 4 sebanyak 4 kali: 6, 10, 14, 18, 22.', 'Tuliskan kesimpulan: baris kelima berisi 22 pot.'],
            hint: 'Mulailah dari informasi yang diketahui (baris pertama). Kesimpulan selalu ditulis paling akhir.' }],
          okMsg: 'Urutan langkahmu runtut. Itulah <b>algoritma</b>!' },
        { title: 'Jalankan langkahnya', mood: 'ayo', say: 'Mari jalankan algoritmanya seperti komputer. Tentukan berapa kali menambah 4 untuk sampai ke baris kelima, lalu tekan <b>Jalankan</b>.',
          visual: () => `<div class="runner" id="runner"><div class="muted small" style="color:#9fdde4">Tekan ▶ Jalankan untuk melihat langkah demi langkah</div></div>`,
          mount: el => {
            const run = el.querySelector('.runbtn');
            if (!run) return;
            run.onclick = () => {
              const n = K.num(el.querySelector('[data-f="kali"]').value);
              const box = el.querySelector('#runner');
              if (n === null || n < 1 || n > 8) { K.toast('Isi dulu banyaknya penambahan (1 sampai 8).'); return; }
              const lines = ['Mulai: baris 1 = 6 pot'];
              let v = 6;
              for (let i = 1; i <= n; i++) { v += 4; lines.push(`Tambah 4 → baris ${i + 1} = ${v} pot`); }
              box.innerHTML = lines.map(l => `<div class="line">${l}</div>`).join('') + '<div class="result" hidden></div>';
              const ls = box.querySelectorAll('.line');
              ls.forEach((l, i) => setTimeout(() => { l.classList.add('on'); K.sound('click'); }, 450 * i));
              setTimeout(() => { const r = box.querySelector('.result'); r.hidden = false; r.textContent = `Selesai: berhenti di baris ${n + 1} dengan ${v} pot.`; }, 450 * ls.length);
            };
          },
          fields: [{ id: 'kali', type: 'number', q: 'Dari baris 1 ke baris 5, berapa kali menambah 4?', suffix: 'kali', answer: 4, runner: true,
            hint: n => n === 5 ? 'Coba jalankan! Jika menambah 5 kali, kamu berhenti di baris <b>keenam</b>. Baris 1 sudah ada, jadi cukup berapa kali?' : 'Hitung perpindahannya: baris 1 ke 2, 2 ke 3, 3 ke 4, 4 ke 5.' }],
          okMsg: 'Benar! Ada <b>4 perpindahan</b> dari baris 1 ke baris 5, sehingga hasilnya 22 pot.' },
        { title: 'Periksa langkah teman', mood: 'pikir', say: 'Dodo menulis langkah berikut: <b>6 + 4 + 4 + 4 + 4 + 4 = 26</b>. "Jadi baris kelima ada 26 pot," kata Dodo. Periksa langkahnya!',
          fields: [{ id: 'benar', type: 'choice', q: 'Apakah langkah Dodo benar?', answer: 'tidak', options: [{ v: 'ya', t: 'Ya, benar' }, { v: 'tidak', t: 'Tidak, ada yang keliru' }],
            hint: 'Hitung berapa kali Dodo menambahkan 4. Bandingkan dengan banyaknya perpindahan dari baris 1 ke baris 5.' },
            { id: 'kenapa', type: 'choice', q: 'Apa yang keliru?', answer: 'a',
              options: [{ v: 'a', t: 'Dodo menambah 4 sebanyak 5 kali, padahal dari baris 1 ke baris 5 hanya ada 4 perpindahan.' }, { v: 'b', t: 'Dodo seharusnya menambah 5, bukan 4.' }, { v: 'c', t: 'Dodo seharusnya mulai dari 10.' }],
              hint: 'Baris pertama sudah berisi 6 pot. Berapa kali berpindah baris untuk sampai ke baris kelima?' },
            { id: 'alasan', type: 'text', q: 'Jelaskan kepada Dodo cara yang benar.', ph: 'Dodo, seharusnya ...',
              soft: TXT_HINT_KEYS([['4', 'empat'], ['22', 'kali', 'pindah', 'perpindahan']], 'Jelaskan bahwa cukup menambah 4 sebanyak <b>4 kali</b> sehingga hasilnya 22.') }],
          okMsg: 'Kamu teliti! Dodo menambah satu kali terlalu banyak, sehingga yang ia hitung adalah baris keenam.' },
        { title: 'Tarik kesimpulan', mood: 'hore', say: 'Langkah sudah diperiksa. Sekarang tuliskan <b>kesimpulan</b> yang menjawab pertanyaan Si KOMA.',
          visual: () => garden([6, 10, 14, 18, 22], { extra: [null, 6, 10, 14, 18] }),
          fields: [{ id: 'banyak', type: 'number', q: 'Jadi, baris kelima berisi', suffix: 'pot', answer: 22, hint: 'Lihat hasil langkah yang sudah kamu jalankan.' },
            { id: 'kalimat', type: 'text', q: 'Tuliskan kesimpulanmu lengkap dengan alasannya.', ph: 'Jadi, baris kelima berisi ... pot karena ...',
              soft: TXT_HINT_KEYS([['22'], ['4', 'empat', 'tambah']], 'Kesimpulan yang lengkap menyebut <b>jawaban</b> (22 pot) dan <b>alasannya</b> (mulai dari 6, tambah 4 sebanyak 4 kali).') }],
          okMsg: 'Kesimpulanmu menjawab pertanyaan Si KOMA. Hebat!' },
        { title: 'Refleksi: Catatan Penjelajahku', mood: 'senang', say: 'Mari lihat perjalanan berpikirmu. Bandingkan dugaan awalmu dengan kesimpulan akhirmu.',
          visual: () => {
            const r = S.resp('a1.s4'); const dg = r ? r.awal.nilai.dugaan : '?';
            return `<div class="compare"><div class="box"><div class="muted">Dugaan awalku</div><div class="big">${esc(dg)}</div><div>pot</div></div>
              <div style="font-size:40px">➡️</div><div class="box"><div class="muted">Kesimpulan akhirku</div><div class="big" style="color:var(--leaf)">22</div><div>pot</div></div></div>`;
          },
          autoOk: true,
          fields: [{ id: 'pilih', type: 'choice', q: 'Setelah menjelajah, apa yang terjadi pada dugaanmu?', options: [{ v: 'tetap', t: 'Aku mempertahankan dugaanku' }, { v: 'ubah', t: 'Aku mengubah dugaanku' }] },
            { id: 'alasan', type: 'text', q: 'Mengapa kamu mempertahankan atau mengubah dugaanmu?', ph: 'Aku ... dugaanku karena ...',
              soft: TXT_HINT_KEYS([['pola', 'tambah', '4', 'aturan', 'pasang', 'langkah']], 'Ceritakan bagian mana (pola, aturan, atau langkah) yang membuatmu yakin.') }],
          okMsg: '📒 Refleksimu tersimpan. Kamu sudah menyelesaikan seluruh aktivitas penjelajah!' }
      ]
    }
  ];

  /* ---------- mesin aktivitas ---------- */
  function fieldHTML(f) {
    const q = f.q ? `<div class="q">${f.q}</div>` : '';
    switch (f.type) {
      case 'number':
        return `<div class="field">${q}<div class="row"><input class="num" type="number" inputmode="numeric" min="0" max="100" data-f="${f.id}" aria-label="${esc((f.q || '').replace(/<[^>]+>/g, ''))}"> ${f.suffix ? `<b>${f.suffix}</b>` : ''}
          ${f.runner ? '<button type="button" class="btn btn-sea btn-sm runbtn">▶ Jalankan</button>' : ''}</div></div>`;
      case 'choice':
        return `<div class="field">${q}<div class="choices">${f.options.map(o => `<button type="button" class="choice" data-f="${f.id}" data-v="${esc(o.v)}">${o.t}</button>`).join('')}</div></div>`;
      case 'multi':
        return `<div class="field">${q}<div class="choices">${f.options.map(o => `<button type="button" class="choice" data-m="${f.id}" data-v="${esc(o.v)}">☐ ${o.t}</button>`).join('')}</div></div>`;
      case 'cards':
        return `<div class="field">${q}${f.items.map((it, i) => `<div class="sort-card" data-card="${f.id}" data-i="${i}"><span class="txt">${it.t}</span>
          <div class="seg">${f.cats.map(c => `<button type="button" data-v="${c.v}">${c.t}</button>`).join('')}</div></div>`).join('')}</div>`;
      case 'order':
        return `<div class="field">${q}<ol class="order-list" data-order="${f.id}"></ol></div>`;
      case 'text':
        return `<div class="field">${q}<textarea data-f="${f.id}" placeholder="${esc(f.ph || '')}" aria-label="${esc(f.q)}"></textarea></div>`;
      case 'sentence':
        return `<div class="field blank-sentence">${f.parts.map(p => typeof p === 'string' ? `<span>${p}</span>` :
          p.num ? `<input class="num" type="number" inputmode="numeric" data-f="${p.id}" aria-label="isian">` :
            `<select data-f="${p.id}">${p.options.map(o => `<option value="${o === 'pilih' ? '' : o}">${o === 'pilih' ? '(pilih)' : o}</option>`).join('')}</select>`).join(' ')}</div>`;
    }
    return '';
  }

  function renderOrder(ul, f, arr) {
    ul.innerHTML = arr.map((idx, pos) => `<li data-i="${idx}"><span class="no">${pos + 1}</span><span>${f.items[idx]}</span>
      <span class="mv"><button type="button" data-up aria-label="naikkan">⬆️</button><button type="button" data-down aria-label="turunkan">⬇️</button></span></li>`).join('');
    K.$$('li', ul).forEach((li, pos) => {
      li.querySelector('[data-up]').onclick = () => { if (pos > 0) { const a = cur(ul); [a[pos - 1], a[pos]] = [a[pos], a[pos - 1]]; renderOrder(ul, f, a); K.sound('click'); } };
      li.querySelector('[data-down]').onclick = () => { const a = cur(ul); if (pos < a.length - 1) { [a[pos + 1], a[pos]] = [a[pos], a[pos + 1]]; renderOrder(ul, f, a); K.sound('click'); } };
    });
    function cur(u) { return K.$$('li', u).map(l => +l.dataset.i); }
  }

  function subFields(step) {
    const out = [];
    step.fields.forEach(f => {
      if (f.type === 'sentence') f.parts.forEach(p => { if (typeof p !== 'string') out.push(Object.assign({ parent: f }, p, { type: p.num ? 'number' : 'select' })); });
      else out.push(f);
    });
    return out;
  }

  function collect(el, step) {
    const v = {};
    subFields(step).forEach(f => {
      if (f.type === 'number') v[f.id] = K.num(el.querySelector(`[data-f="${f.id}"]`).value);
      else if (f.type === 'select') v[f.id] = el.querySelector(`[data-f="${f.id}"]`).value || null;
      else if (f.type === 'choice') { const b = el.querySelector(`.choice.on[data-f="${f.id}"]`); v[f.id] = b ? b.dataset.v : null; }
      else if (f.type === 'multi') v[f.id] = K.$$(`.choice.on[data-m="${f.id}"]`, el).map(b => b.dataset.v);
      else if (f.type === 'cards') v[f.id] = K.$$(`[data-card="${f.id}"]`, el).map(c => { const b = c.querySelector('.seg .on'); return b ? b.dataset.v : null; });
      else if (f.type === 'order') v[f.id] = K.$$(`[data-order="${f.id}"] li`, el).map(l => +l.dataset.i);
      else if (f.type === 'text') v[f.id] = el.querySelector(`[data-f="${f.id}"]`).value.trim();
    });
    return v;
  }

  function fill(el, step, v) {
    subFields(step).forEach(f => {
      const val = v ? v[f.id] : undefined;
      if (f.type === 'order') { renderOrder(el.querySelector(`[data-order="${f.id}"]`), f, Array.isArray(val) ? val : f.start); return; }
      if (val == null) return;
      if (f.type === 'number' || f.type === 'select' || f.type === 'text') el.querySelector(`[data-f="${f.id}"]`).value = val;
      else if (f.type === 'choice') K.$$(`.choice[data-f="${f.id}"]`, el).forEach(b => b.classList.toggle('on', b.dataset.v === val));
      else if (f.type === 'multi') K.$$(`.choice[data-m="${f.id}"]`, el).forEach(b => setMulti(b, val.includes(b.dataset.v)));
      else if (f.type === 'cards') K.$$(`[data-card="${f.id}"]`, el).forEach((c, i) => K.$$('.seg button', c).forEach(b => b.classList.toggle('on', b.dataset.v === val[i])));
    });
  }
  function setMulti(b, on) { b.classList.toggle('on', on); b.innerHTML = (on ? '☑ ' : '☐ ') + b.innerHTML.replace(/^[☐☑] /, ''); }

  function filled(f, val) {
    if (f.type === 'text') return val && val.length >= (f.min || 5);
    if (f.type === 'multi') return val.length > 0;
    if (f.type === 'cards') return val.every(x => x);
    if (f.type === 'order') return true;
    return val !== null && val !== undefined && val !== '';
  }

  function evaluate(step, v) {
    const res = []; let ok = true;
    subFields(step).forEach(f => {
      const val = v[f.id];
      let good = true;
      if (f.type === 'number' || f.type === 'select' || f.type === 'choice') good = f.answer === undefined || val === f.answer;
      else if (f.type === 'multi') { const want = f.options.filter(o => o.ok).map(o => o.v).sort(); good = JSON.stringify([...val].sort()) === JSON.stringify(want); }
      else if (f.type === 'cards') good = val.every((x, i) => x === f.items[i].a);
      else if (f.type === 'order') good = val.every((x, i) => x === i);
      if (step.autoOk) good = true;
      const hintSrc = f.hint || (f.parent && f.parent.hint);
      res.push({ f, good, hint: good ? null : (typeof hintSrc === 'function' ? hintSrc(val) : hintSrc) });
      if (!good) ok = false;
    });
    return { ok, res };
  }

  function softHints(step, v) {
    const out = [];
    step.fields.forEach(f => {
      if (f.type !== 'text' || !f.soft) return;
      const t = (v[f.id] || '').toLowerCase();
      const pass = f.soft.keys.every(group => group.some(k => t.includes(k)));
      if (!pass) out.push(f.soft.msg);
    });
    return out;
  }

  K.pages.aktivitas = function (app, n) {
    n = Math.max(1, Math.min(4, n | 0));
    const A = K.ACTS[n - 1], stage = 'a' + n;
    if (!S.isOpen(stage)) {
      const prev = S.ORDER[S.ORDER.indexOf(stage) - 1];
      app.innerHTML = `<div class="card center">${K.say(`Aktivitas ini masih terkunci. Selesaikan <b>${S.STAGE_NAMES[prev]}</b> dulu, ya!`, 'pikir')}<a class="btn btn-primary" href="#/beranda">🏝️ Kembali ke peta</a></div>`;
      return;
    }
    const key = i => `${stage}.s${i + 1}`;
    const isStepDone = i => { const r = S.resp(key(i)); return !!(r && r.selesai); };
    let cur = 0;
    while (cur < A.steps.length - 1 && isStepDone(cur)) cur++;
    S.data.cursor = S.data.cursor || {};
    if (Number.isInteger(S.data.cursor[stage])) cur = Math.min(cur, S.data.cursor[stage]);

    function maxReach() { let m = 0; while (m < A.steps.length - 1 && isStepDone(m)) m++; return m; }

    function render() {
      const st = A.steps[cur], reach = maxReach(), r = S.resp(key(cur));
      S.data.cursor[stage]=cur; S.save();
      app.innerHTML = `
        <div class="act-head"><span style="font-size:44px">${A.ico}</span>
          <div><span class="tag">${A.place}</span> <span class="tag sun">CT: ${A.ct}</span> <span class="tag coral">${A.ind}</span>
          <h1 style="margin:6px 0 0">Aktivitas ${n}: ${A.title}</h1></div>
          <div class="dots" aria-label="Langkah">${A.steps.map((s, i) => `<button type="button" data-go="${i}" class="${i === cur ? 'cur' : isStepDone(i) ? 'done' : ''}" ${i > reach ? 'disabled' : ''} title="${esc(s.title)}">${i + 1}</button>`).join('')}</div>
        </div>
        <div class="step-bridge"><b>Hubungan langkah ini</b><br>${K.stepLinks[n-1][cur]}</div>
        ${K.say(st.say, st.mood)}
        <div class="card step-card" id="stepCard">
          <h3><span class="tag">Langkah ${cur + 1} dari ${A.steps.length}</span> ${st.title}</h3>
          ${st.visual ? st.visual() : ''}
          ${st.fields.map(fieldHTML).join('')}
          <p class="point-rule">${st.autoOk ? 'Dugaan dan refleksimu dicatat tanpa pengurangan poin. Guru akan membaca alasanmu.' : 'Dua kesempatan: benar pertama 10 poin, benar kedua 5 poin. Setelah dua jawaban keliru, baca pembahasan dan lanjut belajar (0 poin). Alasan terbuka ditelaah guru.'}</p><div id="pointStatus" class="tag sun"></div>
          <div class="feedback" id="fb"></div>
          <div class="step-actions">
            <button type="button" class="btn btn-sea" id="checkBtn">🔎 Periksa jawabanku</button>
            <button type="button" class="btn btn-primary" id="nextBtn" ${isStepDone(cur) ? '' : 'hidden'}>${cur === A.steps.length - 1 ? '🏁 Selesaikan aktivitas' : 'Lanjut ➜'}</button>
            <span class="saved-note" id="savedNote">${r ? `💾 Jawaban awal tersimpan ${K.fmtTime(r.awal.waktu)}${r.perbaikan.length ? ` · ${r.perbaikan.length} perbaikan` : ''}` : ''}</span>
          </div>
        </div>
        <div class="row"><a class="btn btn-ghost btn-sm" href="#/aktivitas">← Daftar aktivitas</a><a class="btn btn-ghost btn-sm" href="#/catatan">📒 Catatan Penjelajahku</a></div>`;

      const el = K.$('#stepCard');
      fill(el, st, S.data.draftAkt?.[key(cur)] || S.latest(key(cur)));
      const keepDraft=()=>{S.data.draftAkt=S.data.draftAkt||{};S.data.draftAkt[key(cur)]=collect(el,st);S.save();};
      el.addEventListener('input',keepDraft);el.addEventListener('change',keepDraft);el.addEventListener('click',()=>setTimeout(()=>{if(el.isConnected)keepDraft();},0));
      if(r?.closed){K.$$('input,textarea,select,.choice,.seg button,.mv button',el).forEach(x=>x.disabled=true);K.$('#checkBtn').disabled=true;K.$('#nextBtn').hidden=false;K.$('#fb').className='feedback show hint';K.$('#fb').innerHTML='Langkah ini sudah dicatat. '+(r.assisted?'Pembahasan: '+st.okMsg:'Alasanmu akan ditelaah guru.');}
      K.$('#pointStatus').textContent = r?.closed ? `Poin langkah: ${S.data.awards?.[key(cur)]?.points||0}` : (st.autoOk?'Tulis pemikiranmu. Tidak ada pengurangan poin.':`Kesempatan terpakai: ${r?.attempts||0} dari 2`);
      if (st.mount) st.mount(el);

      K.$$('.choice[data-f]', el).forEach(b => b.onclick = () => { K.$$(`.choice[data-f="${b.dataset.f}"]`, el).forEach(x => x.classList.remove('on', 'ok', 'bad')); b.classList.add('on'); K.sound('click'); });
      K.$$('.choice[data-m]', el).forEach(b => b.onclick = () => { b.classList.remove('ok', 'bad'); setMulti(b, !b.classList.contains('on')); K.sound('click'); });
      K.$$('.sort-card', el).forEach(c => K.$$('.seg button', c).forEach(b => b.onclick = () => { K.$$('.seg button', c).forEach(x => x.classList.remove('on')); b.classList.add('on'); c.classList.remove('ok', 'bad'); K.sound('click'); }));
      K.$$('[data-go]', app).forEach(b => b.onclick = () => { cur = +b.dataset.go; render(); scrollTo({ top: 0, behavior: 'smooth' }); });

      K.$('#checkBtn').onclick = () => {
        if(S.resp(key(cur))?.closed)return;
        const v = collect(el, st);
        const missing = subFields(st).filter(f => !filled(f, v[f.id]));
        if (missing.length) {
          K.sound('no');
          const fb = K.$('#fb'); fb.className = 'feedback show hint';
          fb.innerHTML = missing.some(f => f.type === 'text') ? '✏️ Lengkapi dulu semua jawaban. Tulis alasanmu sedikitnya satu kalimat pendek, ya.' : '✏️ Lengkapi dulu semua jawaban sebelum diperiksa.';
          return;
        }
        const ev = evaluate(st, v);
        const rec = S.record(key(cur), v, ev.ok);
        rec.attempts=(rec.attempts||0)+1;
        const assisted=!st.autoOk&&!ev.ok&&rec.attempts>=2;
        if(ev.ok||assisted){rec.closed=true;rec.selesai=true;rec.assisted=assisted;S.data.awards=S.data.awards||{};S.data.awards[key(cur)]={points:st.autoOk?0:ev.ok?(rec.attempts===1?10:5):0};}
        S.save(); // jawaban dicatat SEBELUM umpan balik ditampilkan
        // tandai benar/salah
        ev.res.forEach(x => {
          const f = x.f;
          if (st.autoOk || f.answer === undefined && !['multi', 'cards', 'order'].includes(f.type)) return;
          if (f.type === 'number' || f.type === 'select') { const i = el.querySelector(`[data-f="${f.id}"]`); i.classList.remove('ok', 'bad'); i.classList.add(x.good ? 'ok' : 'bad'); }
          if (f.type === 'choice') { const b = el.querySelector(`.choice.on[data-f="${f.id}"]`); if (b) b.classList.add(x.good ? 'ok' : 'bad'); }
          if (f.type === 'multi') K.$$(`.choice[data-m="${f.id}"]`, el).forEach(b => { const o = f.options.find(o => o.v === b.dataset.v); if (b.classList.contains('on')) b.classList.add(o.ok ? 'ok' : 'bad'); });
          if (f.type === 'cards') K.$$(`[data-card="${f.id}"]`, el).forEach((c, i) => { c.classList.remove('ok', 'bad'); c.classList.add(v[f.id][i] === f.items[i].a ? 'ok' : 'bad'); });
          if (f.type === 'order') K.$$(`[data-order="${f.id}"] li`, el).forEach((li, i) => { li.classList.remove('ok', 'bad'); li.classList.add(+li.dataset.i === i ? 'ok' : 'bad'); });
        });
        const fb = K.$('#fb'), soft = softHints(st, v);
        if (ev.ok) {
          K.sound('ok');
          fb.className = 'feedback show ok';
          fb.innerHTML = `🎉 ${st.okMsg}${soft.length ? `<div style="margin-top:8px;color:#6b5200">💡 Saran Si KOMA: ${soft.join(' ')}</div><div class="small" style="font-weight:600">Simpan saran ini untuk langkah berikutnya. Guru akan membaca alasanmu.</div>` : ''}`;
          K.$('#nextBtn').hidden = false;
        } else {
          K.sound('no');
          const hints = [...new Set(ev.res.filter(x => !x.good && x.hint).map(x => x.hint))];
          fb.className = 'feedback show no';
          fb.innerHTML = `🤔 Hampir! Coba periksa lagi bagian yang bertanda oranye.<ul>${hints.map(h => `<li>${h}</li>`).join('')}</ul>${soft.length ? `<div style="margin-top:6px">💡 ${soft.join(' ')}</div>` : ''}`;
        }
        if(assisted){fb.className='feedback show hint';fb.innerHTML='Kamu sudah mencoba dua kali. Baca pembahasan ini, lalu lanjutkan. Poin langkah ini 0; kamu tetap boleh belajar.<br><b>Pembahasan:</b> '+st.okMsg;K.$('#nextBtn').hidden=false;}
        if(rec.closed){K.$('#checkBtn').disabled=true;K.$$('input,textarea,select,.choice,.seg button,.mv button',el).forEach(x=>x.disabled=true);}
        K.$('#pointStatus').textContent=rec.closed?`Poin langkah: ${S.data.awards[key(cur)].points}`:`Jawaban pertama belum tepat. Kesempatan kedua bernilai 5 poin.`;
        K.$('#savedNote').textContent = `💾 Jawaban awal tersimpan ${K.fmtTime(rec.awal.waktu)}${rec.perbaikan.length ? ` · ${rec.perbaikan.length} perbaikan` : ''}`;
        K.$$('[data-go]', app).forEach((b, i) => { b.disabled = i > maxReach(); b.classList.toggle('done', isStepDone(i) && i !== cur); });
      };

      K.$('#nextBtn').onclick = () => {
        if (cur < A.steps.length - 1) { cur++; render(); scrollTo({ top: 0, behavior: 'smooth' }); return; }
        const first = S.markDone(stage);
        K.sound('win'); K.confetti();
        const nextStage = S.ORDER[S.ORDER.indexOf(stage) + 1];
        const nextHref = n < 4 ? `#/aktivitas/${n + 1}` : '#/kuis';
        K.modal({
          title: `🏅 Aktivitas ${n} selesai!`,
          body: `${K.say(`${first ? 'Hore! ' : ''}Kamu sudah menyelesaikan kegiatan <b>${A.title}</b> dan berlatih menjelaskan pemikiranmu. ${first ? `<b>${S.STAGE_NAMES[nextStage]}</b> sekarang terbuka.` : ''}`, 'hore')}`,
          actions: [{ label: 'Ke peta', onClick: () => { location.hash = '#/beranda'; } }, { label: `Lanjut: ${S.STAGE_NAMES[nextStage]} ➜`, primary: true, onClick: () => { location.hash = nextHref; } }]
        });
      };
    }
    render();
  };
})();
