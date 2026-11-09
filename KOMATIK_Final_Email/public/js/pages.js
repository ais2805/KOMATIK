/* KOMATIK · halaman Masuk, Beranda, Materi, Laboratorium Pola, Aktivitas, Catatan, Profil */
(function () {
  const S = K.store, esc = K.esc;
  K.pages = K.pages || {};

  /* ---------- deret bilangan bergambar ---------- */
  K.seqHTML = function (arr, o) {
    o = o || {};
    let s = '<div class="seq">';
    arr.forEach((v, i) => {
      const cls = (o.q || []).includes(i) ? 'q' : (o.bad || []).includes(i) ? 'bad' : (o.hl || []).includes(i) ? 'hl' : '';
      s += `<span class="n ${cls}">${v === null ? '?' : v}</span>`;
      if (i < arr.length - 1) {
        if (o.jumps && arr[i] !== null && arr[i + 1] !== null && typeof arr[i] === 'number') {
          const d = arr[i + 1] - arr[i];
          s += `<span class="jump ${d < 0 ? 'down' : ''}">${d < 0 ? '−' + (-d) : '+' + d}</span>`;
        } else s += '<span class="arrow">,</span>';
      }
    });
    return s + '</div>';
  };

  /* ---------- peta Pulau Pola ---------- */
  const STATIONS = [
    { id: 'materi', x: 13, y: 70, ico: '📖', name: 'Bekal Penjelajahanku', href: '#/materi' },
    { id: 'lab', x: 24, y: 40, ico: '🔬', name: 'Lab Pola', href: '#/lab' },
    { id: 'a1', x: 36, y: 76, ico: '🔍', name: 'Pantai Memahami', href: '#/aktivitas/1' },
    { id: 'a2', x: 49, y: 51, ico: '🌴', name: 'Hutan Pola', href: '#/aktivitas/2' },
    { id: 'a3', x: 41, y: 22, ico: '⛰️', name: 'Bukit Aturan', href: '#/aktivitas/3' },
    { id: 'a4', x: 61, y: 20, ico: '🧩', name: 'Menara Langkah', href: '#/aktivitas/4' },
    { id: 'kuis', x: 77, y: 38, ico: '❓', name: 'Gua Kuis', href: '#/kuis' },
    { id: 'games', x: 66, y: 74, ico: '🎮', name: 'Taman Games', href: '#/games' },
    { id: 'evaluasi', x: 88, y: 68, ico: '🗼', name: 'Mercusuar Evaluasi', href: '#/evaluasi' }
  ];

  function islandSVG() {
    const route = STATIONS.filter(s => s.id !== 'lab').map(s => `${s.x * 10},${s.y * 6}`).join(' ');
    return `<svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id="sea" cx="50%" cy="45%" r="70%"><stop offset="0" stop-color="#7fd8e2"/><stop offset="1" stop-color="#2aa2b3"/></radialGradient>
        <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9ad97a"/><stop offset="1" stop-color="#5fb85a"/></linearGradient>
      </defs>
      <rect width="1000" height="600" fill="url(#sea)"/>
      ${Array.from({ length: 14 }, (_, i) => `<path d="M${(i * 137) % 980} ${40 + (i * 97) % 540} q12 -8 24 0 q12 8 24 0" stroke="#e3f7f8" stroke-width="3" fill="none" opacity=".55"/>`).join('')}
      <path d="M80 470 C50 380 120 250 240 200 C320 90 520 50 660 80 C800 100 940 190 950 330 C960 450 905 545 760 565 C600 590 420 575 300 565 C180 555 100 535 80 470 Z" fill="#f6e2b0" stroke="#fff3d6" stroke-width="10"/>
      <path d="M118 460 C95 385 155 270 260 225 C340 125 520 95 650 120 C780 140 900 215 905 330 C912 440 860 515 745 530 C600 552 430 540 310 532 C205 524 135 510 118 460 Z" fill="url(#grass)"/>
      <path d="M330 175 L410 60 L470 140 L520 90 L585 175 Z" fill="#8cbf6e" stroke="#6ea456" stroke-width="4"/>
      <path d="M395 82 L410 60 L425 82 Z" fill="#fff"/>
      <ellipse cx="500" cy="330" rx="70" ry="34" fill="#5fc9d6" stroke="#bfe7ea" stroke-width="5"/>
      ${[[200, 300], [300, 380], [560, 400], [700, 300], [820, 250], [600, 250], [260, 470], [470, 470]].map(([x, y]) => `
        <g transform="translate(${x} ${y})"><path d="M0 0 Q4 -30 0 -52" stroke="#8b5a2b" stroke-width="7" fill="none"/>
        <path d="M0 -52 q-26 -6 -40 8 q22 -2 40 -8 q-10 -24 -32 -26 q18 10 32 26 q10 -24 34 -24 q-20 8 -34 24 q28 -4 40 12 q-22 -8 -40 -12Z" fill="#3a9a4a"/></g>`).join('')}
      <polyline points="${route}" fill="none" stroke="#fff" stroke-width="7" stroke-dasharray="2 16" stroke-linecap="round" opacity=".9"/>
      <g transform="translate(70 520)"><path d="M0 0 h70 l-12 18 h-46 z" fill="#c98b3a"/><path d="M34 0 v-46 l26 34 z" fill="#fff"/></g>
    </svg>`;
  }

  K.pages.beranda = function (app) {
    const d = S.data, cur = S.current(), pct = S.percent();
    const nama = d.profil.nama || d.profil.kode;
    const curSt = STATIONS.find(s => s.id === cur) || STATIONS[STATIONS.length - 1];
    const msg = cur === 'selesai'
      ? `Hebat, ${esc(nama)}! Semua tahap di Pulau Pola sudah kamu jelajahi. Evaluasimu tersedia di Ruang Guru untuk dinilai.`
      : `Halo, <b>${esc(nama)}</b>! Sekarang kamu berada di <b>${curSt.name}</b>. Yuk, lanjutkan petualangan!`;
    app.innerHTML = `
      <div class="home-head">
        <div><span class="tag">Kelas ${esc(d.profil.kelas)} · Kode ${esc(d.profil.kode)}</span><h1 style="margin-top:8px">Peta Pulau Pola</h1></div>
        <div style="min-width:260px"><div class="row" style="justify-content:space-between"><b>Kemajuan belajar</b><b>${pct}%</b></div>
        <div class="progress" aria-label="Kemajuan ${pct} persen"><i style="width:${pct}%"></i></div></div>
      </div>
      ${K.say(msg, cur === 'selesai' ? 'hore' : 'senang', 'big')}
      <div class="map" id="map">${islandSVG()}
        ${STATIONS.map(s => {
          const isLab = s.id === 'lab';
          const done = !isLab && S.isDone(s.id), open = isLab || S.isOpen(s.id);
          const cls = done ? 'done' : !open ? 'locked' : s.id === cur ? 'current' : '';
          return `<a class="station ${cls}" href="${s.href}" data-stage="${s.id}" style="left:${s.x}%;top:${s.y}%" aria-label="${s.name}${done ? ', selesai' : !open ? ', terkunci' : ''}">
            <span class="pin" style="position:relative">${s.ico}<span class="badge">${done ? '✅' : !open ? '🔒' : ''}</span></span><span class="lab">${s.name}</span></a>`;
        }).join('')}
        <div class="you" style="left:${curSt.x}%;top:${curSt.y - 5}%">${K.koma(60, 'senang')}</div>
      </div>
      <nav class="stage-list" aria-label="Daftar tahap">${STATIONS.map(s => {
        const isLab = s.id === 'lab', done = !isLab && S.isDone(s.id), open = isLab || S.isOpen(s.id);
        return `<a class="station-li ${done ? 'done' : !open ? 'locked' : s.id === cur ? 'current' : ''}" href="${s.href}" data-stage="${s.id}">${s.ico} ${s.name} ${done ? '✅' : !open ? '🔒' : ''}</a>`;
      }).join('')}</nav>
      <div class="legend"><span>✅ sudah selesai</span><span>🟠 posisimu sekarang</span><span>🔒 masih terkunci</span><span>🔬 Lab Pola selalu terbuka</span></div>
      <div class="row" style="margin:22px 0">
        ${cur !== 'selesai' ? `<a class="btn btn-primary" href="${curSt.href}">🚀 Lanjutkan: ${curSt.name}</a>` : `<a class="btn btn-primary" href="#/evaluasi">📥 Lihat hasil evaluasiku</a>`}
        <a class="btn btn-ghost" href="#/catatan">📒 Catatan Penjelajahku</a>
      </div>
      <div class="grid2">
        <div class="card howto"><h3>🧭 Petunjuk Penggunaan</h3><ol>
          <li>Mulai dari <b>Bekal Penjelajahanku</b>. Baca, tonton tayangan, lalu coba <b>Lab Pola</b>.</li>
          <li>Kerjakan <b>empat aktivitas</b> secara berurutan. Aktivitas berikutnya terbuka setelah aktivitas sebelumnya selesai.</li>
          <li>Tulis jawaban <b>dan alasanmu</b>. Jawaban pertamamu disimpan sebelum Si KOMA memberi petunjuk.</li>
          <li>Boleh memperbaiki jawaban. Perbaikanmu juga dicatat.</li>
          <li>Setelah itu kerjakan <b>Kuis</b>, <b>Games</b>, lalu <b>Evaluasi</b>. Kumpulkan evaluasi agar guru dapat menilai.</li>
        </ol></div>
        <div class="card"><h3>🧠 Empat Jurus Berpikir Komputasional</h3>
          <table class="ct-table"><tr><td>🔍 Dekomposisi</td><td>Memecah masalah menjadi bagian kecil</td></tr>
          <tr><td>🌴 Pengenalan pola</td><td>Mencari keteraturan yang sama</td></tr>
          <tr><td>⛰️ Abstraksi</td><td>Memilih info penting dan membuat aturan</td></tr>
          <tr><td>🧩 Berpikir algoritmik</td><td>Menyusun langkah yang runtut</td></tr></table></div>
      </div>`;
    K.$$('.station, .station-li', app).forEach(a => a.addEventListener('click', e => {
      const st = a.dataset.stage;
      if (st !== 'lab' && !S.isOpen(st)) {
        e.preventDefault(); K.sound('no');
        const i = S.ORDER.indexOf(st);
        K.toast(`🔒 Selesaikan <b>${S.STAGE_NAMES[S.ORDER[i - 1]]}</b> dulu, ya!`);
      }
    }));
  };

  /* ---------- Materi ---------- */
  K.pages.materi = function (app) {
    const done = S.isDone('materi');
    app.innerHTML = `
      <span class="tag">Bekal Penjelajahanku</span>
      <h1 style="margin-top:8px">📖 Pola Bilangan Membesar dan Mengecil</h1>
      <nav class="lesson-nav" aria-label="Bagian materi"><a href="#cp" data-jump>🎯 Tujuan</a><a href="#bacaan" data-jump>📚 Bacaan</a><a href="#contoh" data-jump>✏️ Contoh</a><a href="#video" data-jump>🎬 Tayangan</a><a href="#cek" data-jump>✅ Cek Kilat</a></nav>
      ${K.say('Sebelum menjelajah, kita bekali diri dulu. Baca pelan-pelan, tonton tayangannya, lalu coba di <b>Lab Pola</b>!', 'senang')}

      <section class="card" id="cp">
        <h2>🎯 Capaian dan Tujuan Pembelajaran</h2>
        <div class="cp"><b>Capaian Pembelajaran (Fase B, elemen Aljabar)</b><br>
        Peserta didik dapat mengidentifikasi, meniru, dan mengembangkan pola gambar atau objek sederhana dan pola bilangan membesar dan mengecil yang melibatkan penjumlahan dan pengurangan pada bilangan cacah sampai 100.</div>
        <h3 style="margin-top:18px">Setelah belajar di Pulau Pola, kamu dapat:</h3>
        <ol class="tp-list">
          <li>mengajukan dugaan bilangan berikutnya berdasarkan informasi yang diketahui;</li>
          <li>menemukan hubungan antarbilangan dengan membandingkan sedikitnya dua pasangan bilangan;</li>
          <li>membuat aturan pola dan memberikan alasan mengapa aturan itu benar;</li>
          <li>menggunakan aturan untuk menentukan bilangan pada urutan yang lebih jauh;</li>
          <li>menyusun langkah penyelesaian dan menarik kesimpulan yang menjawab pertanyaan.</li>
        </ol>
      </section>

      <section class="card" id="bacaan">
        <h2>📚 Apa Itu Pola Bilangan?</h2>
        <p><b>Pola bilangan</b> adalah susunan bilangan yang mengikuti <b>aturan tertentu</b>. Kalau kita tahu aturannya, kita bisa menebak bilangan berikutnya dengan yakin.</p>
        <div class="grid2">
          <div class="card soft" style="margin:0"><h3>⬆️ Pola Membesar</h3>
            <p>Bilangannya makin besar karena <b>ditambah bilangan yang sama</b> setiap berpindah.</p>
            ${K.seqHTML([3, 7, 11, 15, 19], { jumps: true })}
            <p class="small muted">Aturan: mulai dari 3, tambah 4 setiap kali.</p></div>
          <div class="card soft" style="margin:0;background:#fff1eb"><h3>⬇️ Pola Mengecil</h3>
            <p>Bilangannya makin kecil karena <b>dikurangi bilangan yang sama</b> setiap berpindah.</p>
            ${K.seqHTML([50, 45, 40, 35, 30], { jumps: true })}
            <p class="small muted">Aturan: mulai dari 50, kurangi 5 setiap kali.</p></div>
        </div>
        <h3 style="margin-top:22px">🖼️ Pola pada Benda di Sekitar Kita</h3>
        <p>Si KOMA menyusun pot bunga. Perhatikan pot yang <span style="background:#fff4c2;padding:0 6px;border-radius:6px">bercahaya</span>: itulah pot tambahannya.</p>
        <div class="garden">
          <div class="grow"><span class="glabel">Baris 1</span>${K.potRow(3)}<span class="gcount">3 pot</span></div>
          <div class="grow"><span class="glabel">Baris 2</span>${K.potRow(5, { extraFrom: 3 })}<span class="gcount">5 pot</span></div>
          <div class="grow"><span class="glabel">Baris 3</span>${K.potRow(7, { extraFrom: 5 })}<span class="gcount">7 pot</span></div>
        </div>
        <p style="margin-top:12px">Setiap baris bertambah <b>2 pot</b>. Polanya: 3, 5, 7, ... Baris berikutnya pasti berisi <b>9 pot</b>.</p>
        <div class="tip">💡 <b>Rahasia penjelajah:</b> jangan hanya melihat satu pasangan! Bandingkan <b>sedikitnya dua pasangan</b> bilangan berurutan. Kalau perubahannya sama, berarti kamu sudah menemukan aturannya.</div>
      </section>

      <section class="card" id="contoh">
        <h2>✏️ Contoh Menyelesaikan Masalah Pola</h2>
        <div class="grid2">
          <div><h3>Contoh 1: Pola membesar</h3>
            <p>Tentukan bilangan berikutnya: 12, 18, 24, ...</p>
            ${K.seqHTML([12, 18, 24, null], { jumps: false, q: [3] })}
            <ol><li>Pasangan pertama: 12 ke 18, bertambah <b>6</b>.</li><li>Pasangan kedua: 18 ke 24, bertambah <b>6</b>.</li><li>Perubahannya sama, aturannya <b>tambah 6</b>.</li><li>24 + 6 = <b>30</b>. Jadi, bilangan berikutnya 30.</li></ol></div>
          <div><h3>Contoh 2: Pola mengecil</h3>
            <p>Tentukan dua bilangan berikutnya: 64, 57, 50, ...</p>
            ${K.seqHTML([64, 57, 50, null, null], { q: [3, 4] })}
            <ol><li>64 ke 57, berkurang <b>7</b>.</li><li>57 ke 50, berkurang <b>7</b>.</li><li>Aturannya <b>kurangi 7</b>.</li><li>50 − 7 = <b>43</b>, lalu 43 − 7 = <b>36</b>.</li></ol></div>
        </div>
        <div class="tip">🧐 <b>Hati-hati!</b> Pada pola 5, 10, 15, 21 ada bilangan yang tidak cocok. 5 ke 10 bertambah 5, 10 ke 15 bertambah 5, tetapi 15 ke 21 bertambah 6. Seharusnya bilangan keempat adalah <b>20</b>.</div>
      </section>

      <section class="card" id="video">
        <h2>🎬 Tayangan: Mengenal Pola Bilangan</h2>
        <div id="videoHost"></div>
      </section>

      <section class="card" id="cek">
        <h2>✅ Cek Kilat</h2>
        <p>Jawab dua pertanyaan singkat ini untuk memeriksa pemahamanmu.</p>
        <div class="field"><div class="q">1. Pola 20, 26, 32, 38 termasuk pola ...</div>
          <div class="choices" data-cek="1"><button class="choice" data-v="naik">membesar, tambah 6</button><button class="choice" data-v="turun">mengecil, kurangi 6</button><button class="choice" data-v="lima">membesar, tambah 5</button></div></div>
        <div class="field"><div class="q">2. Bilangan berikutnya dari 90, 80, 70, ... adalah</div>
          <div class="row"><input class="num" type="number" id="cek2" min="0" max="100"><button class="btn btn-sea btn-sm" id="cek2b">Periksa</button></div></div>
        <div class="feedback" id="cekFb"></div>
      </section>

      <div class="card" style="display:flex;gap:16px;align-items:center;flex-wrap:wrap;justify-content:space-between">
        <div><h3 style="margin:0">Sudah siap menjelajah?</h3><p class="muted" style="margin:0">Coba dulu Lab Pola, lalu tandai materi selesai untuk membuka Aktivitas 1.</p></div>
        <div class="row"><a class="btn btn-sea" href="#/lab">🔬 Buka Lab Pola</a>
        <button class="btn btn-primary" id="doneMateri">${done ? '✅ Materi selesai, ke Aktivitas 1' : 'Saya sudah paham ✔'}</button></div>
      </div>`;

    const vp = K.videoPlayer(K.$('#videoHost'));
    K.onLeave(() => vp.stop());
    K.$$('[data-jump]', app).forEach(a => a.onclick = e => { e.preventDefault(); K.$(a.getAttribute('href')).scrollIntoView({ behavior: 'smooth' }); });

    const fb = K.$('#cekFb');
    K.$$('[data-cek="1"] .choice', app).forEach(b => b.onclick = () => {
      K.$$('[data-cek="1"] .choice', app).forEach(x => x.classList.remove('ok', 'bad'));
      const ok = b.dataset.v === 'naik';
      b.classList.add(ok ? 'ok' : 'bad'); K.sound(ok ? 'ok' : 'no');
      fb.className = 'feedback show ' + (ok ? 'ok' : 'no');
      fb.innerHTML = ok ? '🎉 Tepat! 20 ke 26 bertambah 6 dan 26 ke 32 juga bertambah 6.' : '🤔 Coba bandingkan 20 dan 26, lalu 26 dan 32. Bilangannya makin besar atau makin kecil? Bertambah berapa?';
    });
    K.$('#cek2b').onclick = () => {
      const v = K.num(K.$('#cek2').value), ok = v === 60;
      K.$('#cek2').className = 'num ' + (ok ? 'ok' : 'bad'); K.sound(ok ? 'ok' : 'no');
      fb.className = 'feedback show ' + (ok ? 'ok' : 'no');
      fb.innerHTML = ok ? '🎉 Benar! Setiap kali berkurang 10, jadi 70 − 10 = 60.' : '🤔 Bandingkan 90 ke 80 dan 80 ke 70. Berkurang berapa setiap kali?';
    };
    K.$('#doneMateri').onclick = () => {
      if (S.markDone('materi')) { K.sound('win'); K.confetti(); K.toast('🔓 Aktivitas 1: Memahami Masalah sudah terbuka!'); }
      location.hash = '#/aktivitas/1';
    };
  };

  /* ---------- Laboratorium Pola ---------- */
  K.pages.lab = function (app) {
    const st = { awal: 6, ubah: 4, jenis: 'naik', suku: 6, tunjuk: true, uji: false };
    app.innerHTML = `
      <span class="tag">Lab Pola</span><h1 style="margin-top:8px">🔬 Laboratorium Pola</h1>
      ${K.say('Atur <b>bilangan awal</b> dan <b>besar perubahan</b>, lalu amati batu loncatannya. Mau menguji dugaan? Nyalakan mode <b>Uji Dugaan</b>!', 'pikir')}
      <div class="lab-panel">
        <div class="card">
          <div class="ctrl-group"><label class="lbl">Jenis pola</label>
            <div class="seg" id="labJenis"><button data-v="naik" class="on">⬆️ Membesar</button><button data-v="turun">⬇️ Mengecil</button></div></div>
          <div class="ctrl-group"><label class="lbl" for="labAwal">Bilangan awal</label>
            <div class="valrow"><input type="range" id="labAwal" min="0" max="100"><output id="oAwal" class="mystery"></output></div></div>
          <div class="ctrl-group"><label class="lbl">Besar perubahan</label>
            <div class="stepper"><button data-d="-1" aria-label="kurangi">−</button><output id="oUbah"></output><button data-d="1" aria-label="tambah">+</button></div></div>
          <div class="ctrl-group"><label class="lbl" for="labSuku">Banyak bilangan</label>
            <div class="valrow"><input type="range" id="labSuku" min="4" max="8"><output id="oSuku" class="mystery"></output></div></div>
          <div class="ctrl-group"><label class="row" style="font-weight:800;cursor:pointer"><input type="checkbox" id="labTunjuk" checked style="width:24px;height:24px"> Tunjukkan perubahan</label></div>
          <div class="row"><button class="btn btn-sun btn-sm" id="labAcak">🎲 Pola acak</button><button class="btn btn-sea btn-sm" id="labUji">🧪 Uji Dugaan</button></div>
        </div>
        <div>
          <div class="card"><h3>Batu loncatan Pulau Pola</h3><div class="stones" id="stones"></div>
            <p class="small muted" id="labNote" style="margin-top:10px"></p>
            <div id="ujiBox" hidden class="card soft" style="margin:14px 0 0">
              <b>🧪 Uji dugaanmu:</b> berapa bilangan pada batu kuning?
              <div class="row" style="margin-top:8px"><input class="num" type="number" id="ujiIn" min="0" max="100"><button class="btn btn-primary btn-sm" id="ujiCek">Periksa</button></div>
              <div class="feedback" id="ujiFb"></div></div></div>
          <div class="card soft"><b>📝 Coba amati:</b><ul style="margin:6px 0 0">
            <li>Apa yang terjadi jika besar perubahan diganti menjadi 10?</li>
            <li>Mengapa pada pola mengecil bilangannya bisa habis sebelum batu terakhir?</li>
            <li>Bisakah kamu membuat pola yang dimulai dari 6 dan bilangan ketiganya 14?</li></ul></div>
        </div>
      </div>`;
    const awal = K.$('#labAwal'), suku = K.$('#labSuku');
    awal.value = st.awal; suku.value = st.suku;

    function terms() {
      const out = []; let v = st.awal;
      for (let i = 0; i < st.suku; i++) {
        if (v < 0 || v > 100) break;
        out.push(v); v += st.jenis === 'naik' ? st.ubah : -st.ubah;
      }
      return out;
    }
    function draw(pop) {
      K.$('#oAwal').textContent = st.awal; K.$('#oUbah').textContent = st.ubah; K.$('#oSuku').textContent = st.suku;
      K.$$('#labJenis button').forEach(b => b.classList.toggle('on', b.dataset.v === st.jenis));
      const t = terms(), hideIdx = st.uji ? t.length - 1 : -1;
      K.$('#stones').innerHTML = t.map((v, i) => `<div class="stone ${pop ? 'pop' : ''}" style="animation-delay:${i * 60}ms">
        <span class="jumpl ${st.jenis === 'turun' ? 'down' : ''}">${i > 0 && st.tunjuk && i !== hideIdx ? (st.jenis === 'naik' ? '+' : '−') + st.ubah : i > 0 && st.tunjuk ? '?' : ''}</span>
        <span class="rock ${i === hideIdx ? 'q' : ''}">${i === hideIdx ? '?' : v}</span><span class="pos">ke-${i + 1}</span></div>`).join('');
      const note = t.length < st.suku ? `⚠️ Hanya ${t.length} bilangan yang muat, karena bilangan berikutnya ${st.jenis === 'naik' ? 'lebih dari 100' : 'kurang dari 0'}. Di KOMATIK kita memakai bilangan cacah sampai 100.` :
        `Aturan: mulai dari ${st.awal}, lalu ${st.jenis === 'naik' ? 'tambah' : 'kurangi'} ${st.ubah} setiap berpindah satu batu.`;
      K.$('#labNote').textContent = st.uji ? 'Amati batu-batu sebelumnya, lalu tebak bilangan pada batu kuning.' : note;
      K.$('#ujiBox').hidden = !st.uji;
      K.$('#ujiFb').className = 'feedback'; K.$('#ujiIn').value = ''; K.$('#ujiIn').className = 'num';
    }
    awal.oninput = () => { st.awal = +awal.value; draw(); };
    suku.oninput = () => { st.suku = +suku.value; draw(); };
    K.$$('#labJenis button').forEach(b => b.onclick = () => { st.jenis = b.dataset.v; K.sound('click'); draw(true); });
    K.$$('.stepper button', app).forEach(b => b.onclick = () => { st.ubah = Math.max(1, Math.min(20, st.ubah + +b.dataset.d)); K.sound('click'); draw(); });
    K.$('#labTunjuk').onchange = e => { st.tunjuk = e.target.checked; draw(); };
    K.$('#labAcak').onclick = () => {
      st.jenis = Math.random() < .5 ? 'naik' : 'turun'; st.ubah = 2 + Math.floor(Math.random() * 9); st.suku = 6;
      st.awal = st.jenis === 'naik' ? Math.floor(Math.random() * 30) : 60 + Math.floor(Math.random() * 40);
      awal.value = st.awal; suku.value = st.suku; st.uji = true; st.tunjuk = false; K.$('#labTunjuk').checked = false; draw(true);
    };
    K.$('#labUji').onclick = () => { st.uji = !st.uji; draw(true); };
    K.$('#ujiCek').onclick = () => {
      const t = terms(), ans = t[t.length - 1], v = K.num(K.$('#ujiIn').value), ok = v === ans, fb = K.$('#ujiFb');
      K.$('#ujiIn').className = 'num ' + (ok ? 'ok' : 'bad'); K.sound(ok ? 'ok' : 'no');
      fb.className = 'feedback show ' + (ok ? 'ok' : 'hint');
      fb.innerHTML = ok ? `🎉 Dugaanmu tepat! ${t[t.length - 2]} ${st.jenis === 'naik' ? '+' : '−'} ${st.ubah} = ${ans}.`
        : `🤔 Belum tepat. Bandingkan dua pasangan batu yang berurutan. Berapa perubahannya? Lalu terapkan pada batu sebelum batu kuning.`;
      if (ok) { st.tunjuk = true; K.$('#labTunjuk').checked = true; setTimeout(() => { st.uji = false; draw(); }, 1800); }
    };
    draw(true);
  };

  /* ---------- Daftar aktivitas ---------- */
  K.pages.aktivitasHub = function (app) {
    const A = K.ACTS;
    app.innerHTML = `<span class="tag">Aktivitas</span><h1 style="margin-top:8px">🧭 Empat Aktivitas Penjelajah</h1>
      ${K.say('Keempat aktivitas memakai satu masalah yang sama: <b>pot bunga di taman Si KOMA</b>. Kerjakan berurutan, ya!', 'senang')}
      <div class="grid2">${A.map((a, i) => {
        const id = 'a' + (i + 1), open = S.isOpen(id), done = S.isDone(id);
        return `<a class="act-tile ${open ? '' : 'locked'}" href="#/aktivitas/${i + 1}" data-stage="${id}">
          <span class="state">${done ? '✅ Selesai' : open ? '🟠 Terbuka' : '🔒 Terkunci'}</span>
          <span class="ico">${a.ico}</span><h3 style="margin:0">Aktivitas ${i + 1}: ${a.title}</h3>
          <div class="row"><span class="tag">${a.ct}</span><span class="tag coral">${a.ind}</span></div>
          <p class="muted" style="margin:0">${a.desc}</p></a>`;
      }).join('')}</div>`;
    K.$$('.act-tile', app).forEach(t => t.addEventListener('click', e => {
      if (!S.isOpen(t.dataset.stage)) { e.preventDefault(); K.sound('no'); K.toast('🔒 Selesaikan aktivitas sebelumnya dulu, ya!'); }
    }));
  };

  /* ---------- Catatan Penjelajahku ---------- */
  K.pages.catatan = function (app) {
    const g = id => S.latest(id) || {};
    const r1 = S.resp('a1.s4');
    const dugaanAwal = r1 ? r1.awal.nilai : null;
    const kes = g('a4.s4'), ref = g('a4.s5');
    const rows = [
      ['🔍 Dugaan awalku (Aktivitas 1)', dugaanAwal ? `<b>${esc(dugaanAwal.dugaan)} pot</b> pada baris kelima. Alasan: ${esc(dugaanAwal.dasar)}` : null],
      ['🌴 Keteraturan yang kutemukan', g('a2.s2').jelas ? esc(g('a2.s2').jelas) : null],
      ['⛰️ Aturan dengan kata-kataku', g('a3.s2').kataku ? esc(g('a3.s2').kataku) : null],
      ['⛰️ Mengapa aturanku benar', g('a3.s3').alasan ? esc(g('a3.s3').alasan) : null],
      ['🧩 Kesimpulan akhirku', kes.kalimat ? `<b>${esc(kes.banyak)} pot</b>. ${esc(kes.kalimat)}` : null],
      ['💭 Refleksiku', ref.alasan ? `${ref.pilih === 'tetap' ? 'Aku mempertahankan dugaanku.' : 'Aku mengubah dugaanku.'} ${esc(ref.alasan)}` : null]
    ];
    const revCount = Object.values(S.data.respon).reduce((a, r) => a + r.perbaikan.length, 0);
    app.innerHTML = `<span class="tag">Catatan</span><h1 style="margin-top:8px">📒 Catatan Penjelajahku</h1>
      ${K.say('Ini buku catatanmu. Lihat bagaimana pemikiranmu berkembang dari dugaan awal sampai kesimpulan akhir!', 'senang')}
      ${dugaanAwal && kes.banyak ? `<div class="card"><div class="compare">
        <div class="box"><div class="muted">Dugaan awal</div><div class="big">${esc(dugaanAwal.dugaan)}</div><div>pot</div></div>
        <div style="font-size:40px">➡️</div>
        <div class="box"><div class="muted">Kesimpulan akhir</div><div class="big" style="color:var(--leaf)">${esc(kes.banyak)}</div><div>pot</div></div></div></div>` : ''}
      <div class="journal">${rows.map(([t, v]) => `<div class="entry"><b>${t}</b><br>${v || '<span class="muted">Belum ada catatan. Kerjakan aktivitasnya dulu, ya.</span>'}</div>`).join('')}
      <div class="entry"><b>✏️ Banyaknya perbaikan jawaban</b><br>${revCount} kali. Memperbaiki jawaban adalah tanda penjelajah yang hebat!</div></div>
      <div class="row" style="margin-top:18px"><a class="btn btn-ghost" href="#/beranda">🏝️ Kembali ke peta</a><button class="btn btn-sea" onclick="window.print()">🖨️ Cetak catatan</button></div>`;
  };

  /* ---------- Profil Developer ---------- */
  K.pages.profil = function (app) {
    app.innerHTML = `<span class="tag">Profil Developer</span><h1 style="margin-top:8px">👩‍🏫 Tentang KOMATIK</h1>
      <div class="card dev-card"><div class="avatar">NA</div><div>
        <h2 style="margin-bottom:4px">Nurul Azizah</h2>
        <p class="muted" style="margin:0 0 8px">NIM 252103830620 · Program Studi S2 Pendidikan Dasar<br>Sekolah Pascasarjana, Universitas Negeri Malang · 2026</p>
        <p>KOMATIK dikembangkan dalam penelitian tesis <i>"Pengembangan Konten Matematika Interaktif dan Komputasional (KOMATIK) untuk Meningkatkan Penalaran Matematis Siswa Sekolah Dasar"</i> dengan model pengembangan ADDIE.</p></div></div>
      <div class="grid2">
        <div class="card"><h3>📦 Tentang Produk</h3>
          <p><b>KOMATIK</b> (Konten Matematika Interaktif dan Komputasional) adalah bahan ajar digital berbasis website untuk memfasilitasi penalaran matematis siswa kelas IV pada materi pola bilangan cacah sampai 100 yang membesar melalui penambahan tetap atau mengecil melalui pengurangan tetap.</p>
          <p>Tema tampilan <b>Pulau Pola</b> dengan maskot pemandu <b>Si KOMA</b>. Website digunakan melalui peramban dengan kartu akses dari guru. Kemajuan belajar tersimpan di server dan dapat dilanjutkan dari perangkat berbeda.</p></div>
        <div class="card"><h3>🔗 Integrasi Berpikir Komputasional dan Penalaran</h3>
          <table class="ct-table">
            <tr><td>Memahami Masalah</td><td>Dekomposisi → mengajukan dugaan</td></tr>
            <tr><td>Menemukan Pola</td><td>Pengenalan pola → menemukan pola atau hubungan</td></tr>
            <tr><td>Membuat Aturan</td><td>Abstraksi → memberikan justifikasi dan melakukan generalisasi</td></tr>
            <tr><td>Menyusun Langkah</td><td>Berpikir algoritmik → menarik kesimpulan</td></tr></table></div>
      </div>
      <div class="card"><h3>📚 Rujukan Utama</h3><ul class="small">
        <li>Grover, S., & Pea, R. (2013). Computational thinking in K–12: A review of the state of the field. <i>Educational Researcher, 42</i>(1), 38–43.</li>
        <li>Jeannotte, D., & Kieran, C. (2017). A conceptual model of mathematical reasoning for school mathematics. <i>Educational Studies in Mathematics, 96</i>(1), 1–16.</li>
        <li>Wing, J. M. (2006). Computational thinking. <i>Communications of the ACM, 49</i>(3), 33–35.</li>
        <li>Ye, H., Liang, B., Ng, O. L., & Chai, C. S. (2023). Integration of computational thinking in K-12 mathematics education. <i>International Journal of STEM Education, 10</i>(1).</li></ul></div>`;
  };
})();
