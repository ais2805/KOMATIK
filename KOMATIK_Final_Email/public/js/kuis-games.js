/* KOMATIK · Kuis (8 soal) dan Games (5 pos di Pulau Pola) */
(function () {
  const S = K.store, esc = K.esc;

  function lockedPage(app, stage) {
    const prev = S.ORDER[S.ORDER.indexOf(stage) - 1];
    app.innerHTML = `<div class="card center">${K.say(`Bagian ini masih terkunci. Selesaikan <b>${S.STAGE_NAMES[prev]}</b> dulu, ya!`, 'pikir')}<a class="btn btn-primary" href="#/beranda">🏝️ Kembali ke peta</a></div>`;
  }

  /* ================= KUIS ================= */
  const QUIZ = [
    { q: 'Pola 4, 8, 12, 16 adalah pola ...', type: 'choice', answer: 'a',
      options: [{ v: 'a', t: 'membesar, aturannya tambah 4' }, { v: 'b', t: 'membesar, aturannya tambah 8' }, { v: 'c', t: 'mengecil, aturannya kurangi 4' }],
      why: '4 ke 8 bertambah 4, 8 ke 12 bertambah 4, dan 12 ke 16 bertambah 4. Bilangannya makin besar dengan tambahan tetap 4.' },
    { q: 'Bilangan berikutnya dari pola 23, 29, 35, ... adalah', type: 'number', answer: 41,
      why: '23 ke 29 bertambah 6 dan 29 ke 35 bertambah 6. Jadi 35 + 6 = 41.' },
    { q: 'Lengkapi pola berikut: 70, 63, ..., 49', type: 'number', answer: 56, seq: [70, 63, null, 49],
      why: '70 ke 63 berkurang 7. Maka 63 − 7 = 56, dan 56 − 7 = 49 cocok dengan bilangan terakhir.' },
    { q: 'Manakah pola mengecil dengan aturan "kurangi 9"?', type: 'choice', answer: 'a',
      options: [{ v: 'a', t: '90, 81, 72, 63' }, { v: 'b', t: '9, 18, 27, 36' }, { v: 'c', t: '90, 80, 70, 60' }],
      why: 'Pada 90, 81, 72, 63 setiap bilangan berkurang 9. Pola 9, 18, 27, 36 membesar, sedangkan 90, 80, 70, 60 berkurang 10.' },
    { q: 'Pada pola 11, 15, 19, 24, 27 ada satu bilangan yang tidak sesuai. Bilangan itu adalah', type: 'choice', answer: '24',
      options: [{ v: '15', t: '15' }, { v: '19', t: '19' }, { v: '24', t: '24' }, { v: '27', t: '27' }],
      why: 'Aturannya tambah 4: 11, 15, 19, 23, 27. Bilangan 24 seharusnya 23.' },
    { q: 'Lantai pertama sebuah gedung memiliki 5 jendela. Setiap naik satu lantai, jendelanya bertambah 3. Berapa jendela di lantai keempat?', type: 'number', answer: 14,
      why: 'Lantai 1 = 5, lantai 2 = 8, lantai 3 = 11, lantai 4 = 14. Ada 3 kali penambahan dari lantai 1 ke lantai 4.' },
    { q: 'Aturan yang tepat untuk pola 100, 92, 84, 76 adalah', type: 'choice', answer: 'a',
      options: [{ v: 'a', t: 'Mulai dari 100, kurangi 8 setiap kali' }, { v: 'b', t: 'Mulai dari 100, kurangi 6 setiap kali' }, { v: 'c', t: 'Mulai dari 100, tambah 8 setiap kali' }],
      why: '100 − 8 = 92, 92 − 8 = 84, dan 84 − 8 = 76. Aturannya kurangi 8.' },
    { q: 'Ani membaca buku. Hari ke-1 ia membaca sampai halaman 10, hari ke-2 halaman 17, hari ke-3 halaman 24. Polanya tetap. Sampai halaman berapa Ani membaca pada hari ke-6?', type: 'number', answer: 45,
      why: 'Setiap hari bertambah 7 halaman: 10, 17, 24, 31, 38, 45. Jadi pada hari ke-6 Ani membaca sampai halaman 45.' }
  ];

  K.pages.kuis = function(app){
    if(!S.isOpen('kuis'))return lockedPage(app,'kuis');
    const Q=S.data.kuis;Q.active=Q.active||{i:0,answers:[],tries:[],done:false};let run=Q.active;
    function intro(){const active=!run.done&&(run.i>0||run.tries.some(x=>x?.length));app.innerHTML=`<span class="tag">Gua Kuis</span><h1>Uji bekal penjelajahmu</h1>${K.say('Empat aktivitas sudah kamu lewati. Sekarang gunakan cara berpikirmu pada 8 soal. Tiap soal memiliki dua kesempatan: benar pertama mendapat 10 poin, benar kedua 5 poin. Setelah dua jawaban keliru, pembahasan terbuka dan kamu tetap bisa lanjut.','ayo')}<div class="card center"><p>Poin kuis berbeda dari nilai Evaluasi yang diperiksa guru.</p>${Q.terbaik!==null?`<p>Hasil terbaik pada jawaban pertama: ${K.fraction(Q.terbaik,8)}</p>`:''}<button class="btn btn-primary" id="startQ">${active?'Lanjutkan soal tersimpan':run.done?'Lihat hasil':'Mulai kuis'}</button></div>`;K.$('#startQ').onclick=()=>run.done?result():show();}
    function show(){const i=run.i,it=QUIZ[i],tries=run.tries[i]||[],answer=run.answers[i];app.innerHTML=`<div class="quiz-top"><span class="qnum">Soal ${i+1} dari 8</span><span class="tag sun">Kesempatan ${Math.min(tries.length+1,2)} dari 2</span></div><div class="card"><h2>${it.q}</h2>${it.seq?K.seqHTML(it.seq,{q:[it.seq.indexOf(null)]}):''}${it.type==='choice'?`<div class="choices">${it.options.map(o=>`<button type="button" class="choice" data-v="${o.v}">${o.t}</button>`).join('')}</div>`:'<div class="row"><input class="num" type="number" id="qIn" min="0" max="100" aria-label="Jawaban"><button class="btn btn-sea" id="qNumCheck">Periksa</button></div>'}<div class="feedback" id="qFb" role="status"></div><button class="btn btn-primary" id="qNext" hidden>${i===7?'Lihat hasil':'Soal berikutnya →'}</button></div>`;
      if(it.type==='choice')K.$$('.choice',app).forEach(b=>b.onclick=()=>submit(b.dataset.v));else{K.$('#qIn').value=run.draft??'';K.$('#qIn').oninput=e=>{run.draft=e.target.value;S.save();};K.$('#qNumCheck').onclick=()=>{const v=K.num(K.$('#qIn').value);if(v===null)return K.toast('Isi jawaban terlebih dahulu.');submit(v);};}
      K.$('#qNext').onclick=()=>{run.i++;run.draft='';if(run.i===8)finish();else{S.save();show();}};
      if(answer)feedback(answer);else if(tries.length)hint();
    }
    function hint(){const fb=K.$('#qFb');fb.className='feedback show hint';fb.textContent='Belum tepat. Kesempatan kedua bernilai 5 poin. Bandingkan dua pasangan bilangan, lalu periksa arah dan besar perubahannya. Pembahasan lengkap dibuka setelah kesempatan kedua.';}
    function feedback(a){const it=QUIZ[run.i],fb=K.$('#qFb');fb.className='feedback show '+(a.benar?'ok':'hint');fb.innerHTML=`${a.benar?'Jawaban akhir tepat.':'Dua kesempatan sudah digunakan.'} Poin soal ini: <b>${a.points}</b>.<br>${it.why}`;K.$$('.choice,#qNumCheck,#qIn',app).forEach(x=>x.disabled=true);K.$('#qNext').hidden=false;}
    function submit(v){const i=run.i;if(run.answers[i])return;const tries=run.tries[i]=run.tries[i]||[];if(tries.length>=2)return;const ok=v===QUIZ[i].answer;tries.push({jawaban:v,benar:ok,waktu:new Date().toISOString()});K.sound(ok?'ok':'no');if(ok||tries.length===2){run.answers[i]={soal:i+1,benar:ok,pertamaBenar:tries[0].benar,points:ok?(tries.length===1?10:5):0,percobaan:tries};feedback(run.answers[i]);}else hint();S.save();}
    function finish(){if(!run.done){run.done=true;run.skor=run.answers.filter(a=>a.pertamaBenar).length;run.points=run.answers.reduce((t,a)=>t+a.points,0);Q.percobaan.push({skor:run.skor,poin:run.points,jawaban:run.answers,waktu:new Date().toISOString()});Q.terbaik=Math.max(Q.terbaik||0,run.skor);S.markDone('kuis');S.save();K.confetti();}result();}
    function result(){app.innerHTML=`<div class="card center"><span class="tag">Kuis selesai</span><h1>Bekalmu makin lengkap!</h1><div class="score-big">${K.fraction(run.skor,8)}</div><p><b>${run.skor} jawaban benar pada percobaan pertama dari 8 soal</b></p><p>Setelah kesempatan kedua: ${run.answers.filter(a=>a.benar).length} soal benar. Poin penghargaan: <b>${run.points} dari 80</b>.</p>${K.say('Terima kasih sudah mencoba dan memeriksa jawabanmu. Sekarang lanjutkan ke Taman Games!','hore')}<div class="row"><button class="btn btn-ghost" id="again">Latihan ulang</button><a class="btn btn-primary" href="#/games">Ke Games →</a></div></div>`;K.$('#again').onclick=()=>{run=Q.active={i:0,answers:[],tries:[],done:false};S.save();show();};}
    intro();
  };

  /* ================= GAMES ================= */
  const POS = [
    { name: 'Jembatan Batu', ico: '🪨', x: 12, y: 62,
      story: 'Sungai deras menghadang! Batu pijakan mengikuti pola <b>7, 12, 17</b>, ... Injak <b>tiga batu berikutnya</b> secara berurutan agar bisa menyeberang.',
      render() {
        const pool = [27, 21, 32, 22, 26, 37, 23, 31];
        return `${K.seqHTML([7, 12, 17], {})}<div class="bridge" id="bridge">${pool.map(v => `<button type="button" data-v="${v}">${v}</button>`).join('')}</div>
          <div class="path-picked" id="picked"><b>Jejakmu:</b> 7, 12, 17,</div>`;
      },
      mount(el, st) {
        const want = [22, 27, 32]; st.got = st.got || [];
        K.$$("#bridge button",el).forEach(b=>{if(st.got.includes(+b.dataset.v))b.classList.add("picked");});
        K.$("#picked",el).textContent="Jejakmu: 7, 12, 17, "+st.got.join(", ");
        K.$$('#bridge button', el).forEach(b => b.onclick = () => {
          if (st.got.length >= 3 || b.classList.contains('picked')) return;
          if (+b.dataset.v === want[st.got.length]) {
            st.got.push(+b.dataset.v); b.classList.add('picked'); K.sound('ok');
            K.$('#picked', el).innerHTML = '<b>Jejakmu:</b> 7, 12, 17, ' + st.got.join(', ') + (st.got.length === 3 ? ' 🎉' : '');
          } else { st.miss = (st.miss || 0) + 1; b.classList.remove('wrong'); void b.offsetWidth; b.classList.add('wrong'); K.sound('no'); K.toast('🌊 Byur! Batu itu tidak sesuai pola. Coba bandingkan perubahannya.'); }
        });
      },
      value: (el, st) => ({ jawaban: (st.got || []).join(', '), ok: (st.got || []).length === 3, filled: (st.got || []).length === 3, tries: 1 + (st.miss || 0) }),
      fb: 'Pola bertambah 5: 17 + 5 = 22, 22 + 5 = 27, 27 + 5 = 32.' },
    { name: 'Kebun Kelapa', ico: '🥥', x: 30, y: 30,
      story: 'Persediaan kelapa di gudang Si KOMA: hari ke-1 ada <b>60</b>, hari ke-2 <b>54</b>, hari ke-3 <b>48</b>. Jika berkurang tetap, berapa kelapa pada <b>hari ke-5</b>?',
      render: () => `${K.seqHTML([60, 54, 48, null, null], { q: [4] })}<div class="row"><b>Hari ke-5:</b><input class="num" type="number" data-g="a" min="0" max="100"><b>kelapa</b></div>`,
      value: el => { const v = K.num(K.$('[data-g="a"]', el).value); return { jawaban: v, ok: v === 36, filled: v !== null }; },
      hint: 'Bandingkan 60 ke 54 dan 54 ke 48. Berkurang berapa? Lanjutkan sampai hari ke-5.',
      fb: 'Setiap hari berkurang 6: 60, 54, 48, 42, 36.' },
    { name: 'Peti Harta', ico: '🗝️', x: 50, y: 58,
      story: 'Peti harta terkunci! Kodenya adalah <b>tiga bilangan berikutnya</b> dari pola <b>25, 33, 41</b>, ...',
      render: () => `${K.seqHTML([25, 33, 41], { jumps: false })}<div class="lock-dial">${[0, 1, 2].map(i => `<input type="number" data-g="${i}" min="0" max="100" aria-label="kode ${i + 1}">`).join('')}</div>`,
      value: el => { const v = [0, 1, 2].map(i => K.num(K.$(`[data-g="${i}"]`, el).value)); return { jawaban: v.join(', '), ok: v.join() === '49,57,65', filled: v.every(x => x !== null) }; },
      hint: 'Cari perubahan antara 25 dan 33, lalu 33 dan 41. Gunakan perubahan itu tiga kali.',
      fb: 'Aturannya tambah 8: 41 + 8 = 49, 49 + 8 = 57, 57 + 8 = 65. Peti terbuka! 💰' },
    { name: 'Detektif Pantai', ico: '🕵️', x: 70, y: 30,
      story: 'Ada jejak kaki bernomor di pasir: <b>90, 82, 74, 65, 58</b>. Satu jejak dibuat oleh penyusup. Klik bilangan yang tidak sesuai pola, lalu tulis bilangan yang seharusnya.',
      render: () => `<div class="seq">${[90, 82, 74, 65, 58].map(v => `<button type="button" class="n" data-v="${v}">${v}</button>`).join('<span class="arrow">,</span>')}</div>
        <div class="row" style="margin-top:12px"><b>Seharusnya:</b><input class="num" type="number" data-g="b" min="0" max="100"></div>`,
      mount(el, st) { K.$$('.seq button', el).forEach(b => b.onclick = () => { K.$$('.seq button', el).forEach(x => x.classList.remove('on')); b.classList.add('on'); st.pick = +b.dataset.v; K.sound('click'); }); },
      value: (el, st) => { const v = K.num(K.$('[data-g="b"]', el).value); return { jawaban: `${st.pick || '-'} → ${v}`, ok: st.pick === 65 && v === 66, filled: !!st.pick && v !== null }; },
      hint: 'Hitung perubahan setiap pasangan: 90 ke 82, 82 ke 74, 74 ke 65, 65 ke 58. Mana yang berbeda?',
      fb: 'Aturannya kurangi 8: 90, 82, 74, 66, 58. Jejak 65 adalah penyusupnya!' },
    { name: 'Mercusuar', ico: '🗼', x: 88, y: 56,
      story: 'Misi terakhir! Lantai 1 mercusuar memiliki <b>5 lampu</b>. Setiap naik satu lantai, lampunya <b>bertambah 3</b>. Berapa lampu di <b>lantai 8</b>?',
      render: () => `<div class="row"><b>Lantai 8:</b><input class="num" type="number" data-g="c" min="0" max="100"><b>lampu</b></div>`,
      value: el => { const v = K.num(K.$('[data-g="c"]', el).value); return { jawaban: v, ok: v === 26, filled: v !== null }; },
      hint: 'Dari lantai 1 ke lantai 8 ada berapa kali naik? Tambahkan 3 sebanyak itu ke 5.',
      fb: 'Dari lantai 1 ke lantai 8 ada 7 kali naik: 5 + 3 × 7 = 26 (5, 8, 11, 14, 17, 20, 23, 26).' }
  ];

  function posMapSVG() {
    const pts = POS.map(p => `${p.x * 10},${p.y * 4.2}`).join(' ');
    return `<svg viewBox="0 0 1000 420" preserveAspectRatio="none" aria-hidden="true">
      <rect width="1000" height="420" fill="#7fd8e2"/>
      <path d="M30 330 C40 200 160 120 300 110 C440 90 520 160 640 120 C760 80 900 120 970 230 C990 320 920 400 780 400 L120 400 C60 400 25 380 30 330Z" fill="#f6e2b0"/>
      <path d="M70 330 C80 220 180 160 300 150 C430 135 520 200 640 160 C750 125 880 160 930 240 C950 310 890 370 770 370 L130 370 C90 370 65 360 70 330Z" fill="#9ad97a"/>
      <polyline points="${pts}" fill="none" stroke="#fff" stroke-width="8" stroke-dasharray="2 16" stroke-linecap="round"/></svg>`;
  }

  K.pages.games = function (app) {
    if (!S.isOpen('games')) return lockedPage(app, 'games');
    const G = S.data.games;
    const posOpen = i => i === 0 || !!G[i] || !!G[i + 1] || S.data.bukaSemua;

    function mapView() {
      const total = POS.reduce((a, _, i) => a + (G[i + 1] ? G[i + 1].bintang : 0), 0);
      app.innerHTML = `<span class="tag">Taman Games</span><h1 style="margin-top:8px">🎮 Misi Lima Pos Pulau Pola</h1>
        ${K.say(`Selesaikan misi di setiap pos dan jelaskan <b>alasan matematis</b>mu. Kamu sudah mengumpulkan <b>${total} dari 15 bintang</b>!`, 'ayo')}
        <div class="pos-map">${posMapSVG()}${POS.map((p, i) => {
          const g = G[i + 1], open = posOpen(i);
          return `<button type="button" class="pos-btn ${g ? 'done' : open ? '' : 'locked'}" data-i="${i}" style="left:${p.x}%;top:${p.y}%">
            <span class="flag">${open ? p.ico : '🔒'}</span><span class="pl">Pos ${i + 1}: ${p.name}</span>${g ? `<span class="st">${'★'.repeat(g.bintang)}</span>` : ''}</button>`;
        }).join('')}</div>
        ${Object.keys(G).length === 5 ? `<div class="card center">${K.say('Semua pos sudah kamu taklukkan! Mercusuar Evaluasi sudah menunggumu.', 'hore')}<a class="btn btn-primary" href="#/evaluasi">📝 Ke Evaluasi</a></div>` : ''}`;
      K.$$('.pos-btn', app).forEach(b => b.onclick = () => {
        const i = +b.dataset.i;
        if (!posOpen(i)) { K.sound('no'); return K.toast(`🔒 Selesaikan Pos ${i} dulu, ya!`); }
        play(i);
      });
    }

    function play(i) {
      const p = POS[i], saved=S.data.draftAkt?.['game'+i]||{}, st = saved.state||{}, prev = G[i + 1];
      let tries = saved.tries||0;
      app.innerHTML = `<div class="act-head"><span style="font-size:44px">${p.ico}</span><div><span class="tag">Pos ${i + 1} dari 5</span><h1 style="margin:6px 0 0">${p.name}</h1></div></div>
        ${K.say(p.story, 'pikir')}
        <div class="card" id="gCard">${p.render()}
          <div class="field"><div class="q">Jelaskan alasan matematismu:</div><textarea id="gWhy" placeholder="Aku tahu karena ..."></textarea></div>
          <div class="feedback" id="gFb"></div>
          <div class="step-actions"><button class="btn btn-sea" id="gCheck">🔎 Periksa misi</button><button class="btn btn-ghost" id="gBack">🗺️ Kembali ke peta pos</button>
          ${prev ? `<span class="saved-note">Sudah selesai sebelumnya ${K.stars(prev.bintang)}</span>` : ''}</div></div>`;
      const el = K.$('#gCard');
      if (p.mount) p.mount(el, st);
      K.$$('input[data-g]',el).forEach(x=>x.value=saved.values?.[x.dataset.g]??'');
      K.$('#gWhy').value=saved.why||'';
      K.$$('.seq button',el).forEach(b=>b.classList.toggle('on',+b.dataset.v===st.pick));
      function keepGame(){S.data.draftAkt=S.data.draftAkt||{};S.data.draftAkt['game'+i]={state:st,tries,values:Object.fromEntries(K.$$('input[data-g]',el).map(x=>[x.dataset.g,x.value])),why:K.$('#gWhy',el).value};S.save();}
      el.addEventListener('input',keepGame);el.addEventListener('click',()=>{if(el.isConnected)keepGame();});
      K.$('#gBack').onclick = mapView;
      K.$('#gCheck').onclick = () => {
        const v = p.value(el, st), why = K.$('#gWhy').value.trim(), fb = K.$('#gFb');
        if (!v.filled) { fb.className = 'feedback show hint'; fb.innerHTML = '✏️ Selesaikan dulu misinya.'; return; }
        if (why.length < 8) { fb.className = 'feedback show hint'; fb.innerHTML = '✏️ Tulis alasan matematismu dulu, sedikitnya satu kalimat pendek.'; return; }
        tries += v.tries || 1;
        if (!v.ok) { K.sound('no'); fb.className = 'feedback show no'; fb.innerHTML = '🤔 Misi belum berhasil. ' + (p.hint || ''); return; }
        const bintang = 3; // Games memberi apresiasi penyelesaian, tanpa pengurangan poin.
        const best = Math.max(bintang, prev ? prev.bintang : 0);
        G[i + 1] = { pos: p.name, bintang: best, percobaan: tries, jawaban: v.jawaban, alasan: why, waktu: new Date().toISOString() };
        S.save(); K.sound('win');
        let unlocked = '';
        if (Object.keys(G).length === 5 && S.markDone('games')) { unlocked = '<p><b>🔓 Mercusuar Evaluasi sudah terbuka!</b></p>'; K.confetti(); }
        fb.className = 'feedback show ok';
        fb.innerHTML = `🎉 Misi berhasil! ${p.fb}<div style="margin-top:6px">${K.stars(bintang)}</div>${unlocked}`;
        K.$('#gCheck').hidden = true;
        K.$('#gBack').textContent = i < 4 ? `➜ Lanjut ke Pos ${i + 2}` : '🗺️ Kembali ke peta pos';
        K.$('#gBack').className = 'btn btn-primary';
        K.$('#gBack').onclick = () => (i < 4 ? play(i + 1) : mapView());
      };
    }
    mapView();
  };
})();
