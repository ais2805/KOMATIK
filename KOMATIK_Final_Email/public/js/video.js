/* KOMATIK · Tayangan animasi "Mengenal Pola Bilangan" (diputar seperti video, tanpa berkas besar) */
(function () {
  const W = 960, H = 540;
  const C = { sea: '#0e7c86', seaD: '#075961', foam: '#e3f7f8', coral: '#ff7b54', coralD: '#e05a33', sun: '#ffd84d', leaf: '#3a9a4a', ink: '#1d3b40', sand: '#fff6e2' };

  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function text(ctx, s, x, y, size, color, weight, align) {
    ctx.font = `${weight || 700} ${size}px Fredoka, 'Trebuchet MS', sans-serif`;
    ctx.fillStyle = color || C.ink; ctx.textAlign = align || 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(s, x, y);
  }
  const ease = u => u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u);
  const clamp01 = u => Math.max(0, Math.min(1, u));

  function bg(ctx) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#d9f4f2'); g.addColorStop(1, '#fff6e2');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(95,201,214,.25)';
    for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(80 + i * 170, 520, 70, Math.PI, 0); ctx.fill(); }
  }
  function caption(ctx, s) {
    if (!s) return;
    ctx.fillStyle = 'rgba(7,89,97,.92)'; rr(ctx, 40, H - 92, W - 80, 64, 18); ctx.fill();
    ctx.font = `700 25px Nunito, 'Segoe UI', sans-serif`;
    // bungkus teks jika terlalu panjang
    const words = s.split(' '); let line = '', lines = [];
    words.forEach(w => { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > W - 140) { lines.push(line); line = w; } else line = t; });
    lines.push(line);
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const y0 = H - 60 - (lines.length - 1) * 14;
    lines.forEach((l, i) => ctx.fillText(l, W / 2, y0 + i * 28));
  }

  /* garis bilangan dengan lompatan */
  function numberLine(ctx, p, o) {
    const x0 = 90, x1 = 870, y = 300;
    const map = v => x0 + (v - o.min) / (o.max - o.min) * (x1 - x0);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x0 - 20, y); ctx.lineTo(x1 + 20, y); ctx.stroke();
    for (let v = o.min; v <= o.max; v++) {
      const big = v % o.labelEvery === 0;
      ctx.lineWidth = big ? 3 : 2; ctx.beginPath(); ctx.moveTo(map(v), y - (big ? 12 : 6)); ctx.lineTo(map(v), y + (big ? 12 : 6)); ctx.stroke();
      if (big) text(ctx, String(v), map(v), y + 34, 20, C.ink, 600);
    }
    const seq = o.seq, n = seq.length - 1;
    const hopP = clamp01(p) * n; // berapa lompatan sudah berjalan
    // lingkaran pada bilangan yang sudah dicapai
    for (let i = 0; i <= Math.min(n, Math.floor(hopP)); i++) {
      ctx.fillStyle = o.down ? C.coral : C.sea; ctx.beginPath(); ctx.arc(map(seq[i]), y, 13, 0, Math.PI * 2); ctx.fill();
      text(ctx, String(seq[i]), map(seq[i]), y - 2, 15, '#fff', 700);
    }
    // busur lompatan yang selesai
    for (let i = 0; i < Math.min(n, Math.floor(hopP)); i++) {
      const a = map(seq[i]), b = map(seq[i + 1]), mid = (a + b) / 2, h = 90;
      ctx.setLineDash([8, 6]); ctx.strokeStyle = o.down ? C.coralD : C.leaf; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(a, y - 14); ctx.quadraticCurveTo(mid, y - 14 - h * 2, b, y - 14); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = o.down ? '#ffe6dc' : '#dff3df'; rr(ctx, mid - 34, y - 14 - h - 22, 68, 34, 12); ctx.fill();
      text(ctx, o.label, mid, y - 14 - h - 5, 22, o.down ? C.coralD : C.leaf, 700);
    }
    // bola yang sedang melompat
    const i = Math.min(n - 1, Math.floor(hopP)), u = hopP >= n ? 1 : hopP - i;
    const a = map(seq[i]), b = map(seq[i + 1]);
    const bx = a + (b - a) * ease(u), by = y - 30 - Math.sin(Math.PI * u) * 170;
    ctx.fillStyle = C.sun; ctx.strokeStyle = '#d9b21f'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(hopP >= n ? b : bx, hopP >= n ? y - 30 : by, 18, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }

  function shellRow(ctx, x, y, count, color) {
    for (let i = 0; i < count; i++) {
      ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x + i * 34, y, 13, Math.PI, 0); ctx.lineTo(x + i * 34 + 13, y + 6); ctx.lineTo(x + i * 34 - 13, y + 6); ctx.fill();
    }
  }

  const SCENES = [
    { d: 6, cap: 'Halo! Aku Si KOMA. Yuk, kita kenali pola bilangan di Pulau Pola!',
      draw(ctx, p, img) {
        text(ctx, 'Mengenal', W / 2 + 90, 170, 46, C.seaD);
        text(ctx, 'Pola Bilangan', W / 2 + 90, 230, 64, C.coralD);
        text(ctx, 'Kelas IV · Pulau Pola', W / 2 + 90, 292, 26, C.sea, 600);
        if (img) { const s = 1 + Math.sin(p * Math.PI * 4) * 0.03; ctx.drawImage(img, 120, 120 + Math.sin(p * 6) * 6, 200 * s, 220 * s); }
      } },
    { d: 8, cap: 'Pola bilangan adalah susunan bilangan yang mengikuti aturan tertentu.',
      draw(ctx, p) {
        text(ctx, 'Si KOMA menyusun kerang di pantai', W / 2, 70, 32, C.seaD);
        const rows = [2, 4, 6, 8];
        rows.forEach((n, i) => {
          const show = clamp01(p * 5 - i);
          if (show <= 0) return;
          ctx.globalAlpha = show;
          text(ctx, 'Baris ' + (i + 1), 170, 140 + i * 72, 24, C.sea, 700, 'left');
          shellRow(ctx, 330, 145 + i * 72, n, i % 2 ? '#ff9e8f' : '#ffb347');
          ctx.fillStyle = '#fff'; rr(ctx, 700, 120 + i * 72, 90, 46, 14); ctx.fill();
          text(ctx, String(n), 745, 143 + i * 72, 28, C.coralD);
          ctx.globalAlpha = 1;
        });
        if (p > .85) text(ctx, '2, 4, 6, 8 → selalu bertambah 2', W / 2, 432, 26, C.leaf);
      } },
    { d: 13, cap: null,
      draw(ctx, p) {
        text(ctx, 'Pola Membesar', W / 2, 70, 40, C.seaD);
        numberLine(ctx, clamp01((p - .05) / .8), { min: 0, max: 16, labelEvery: 1, seq: [2, 5, 8, 11, 14], label: '+3' });
        this.cap = p < .3 ? 'Lihat bolanya! Dari 2 ke 5, bilangannya bertambah 3.'
          : p < .6 ? 'Dari 5 ke 8 juga bertambah 3. Lompatannya sama!'
            : 'Pola 2, 5, 8, 11, 14 membesar dengan aturan: tambah 3.';
      } },
    { d: 13, cap: null,
      draw(ctx, p) {
        text(ctx, 'Pola Mengecil', W / 2, 70, 40, C.coralD);
        numberLine(ctx, clamp01((p - .05) / .8), { min: 0, max: 35, labelEvery: 5, seq: [30, 25, 20, 15, 10], label: '−5', down: true });
        this.cap = p < .3 ? 'Sekarang mundur! Dari 30 ke 25, bilangannya berkurang 5.'
          : p < .6 ? 'Dari 25 ke 20 juga berkurang 5. Lompatannya tetap!'
            : 'Pola 30, 25, 20, 15, 10 mengecil dengan aturan: kurangi 5.';
      } },
    { d: 10, cap: 'Bandingkan sedikitnya dua pasangan bilangan. Kalau perubahannya sama, kamu menemukan aturannya!',
      draw(ctx, p) {
        text(ctx, 'Rahasia Penjelajah Pola', W / 2, 70, 40, C.seaD);
        const tips = ['1. Bandingkan bilangan pertama dan kedua.', '2. Bandingkan bilangan kedua dan ketiga.', '3. Perubahannya sama? Itulah aturannya!', '4. Gunakan aturan untuk bilangan berikutnya.'];
        tips.forEach((t, i) => {
          const s = clamp01(p * 6 - i);
          if (s <= 0) return;
          ctx.globalAlpha = s;
          ctx.fillStyle = i % 2 ? '#fff4c2' : '#e3f7f8'; rr(ctx, 150 - (1 - s) * 40, 120 + i * 74, 660, 58, 18); ctx.fill();
          text(ctx, t, 180 - (1 - s) * 40, 149 + i * 74, 26, C.ink, 700, 'left');
          ctx.globalAlpha = 1;
        });
      } },
    { d: 6, cap: 'Sekarang giliranmu! Coba sendiri di Laboratorium Pola, ya.',
      draw(ctx, p, img) {
        text(ctx, 'Ayo Menjelajah!', W / 2 + 80, 200, 58, C.coralD);
        text(ctx, 'Laboratorium Pola sudah menunggumu', W / 2 + 80, 262, 26, C.sea, 600);
        if (img) ctx.drawImage(img, 130, 120 - Math.abs(Math.sin(p * 10)) * 30, 190, 210);
      } }
  ];
  const TOTAL = SCENES.reduce((a, s) => a + s.d, 0);

  K.videoPlayer = function (host) {
    host.innerHTML = `<div class="video">
      <canvas width="${W}" height="${H}" aria-label="Tayangan animasi: Mengenal Pola Bilangan"></canvas>
      <div class="ctrl"><button type="button" class="pp">▶ Putar</button>
      <div class="bar" role="slider" aria-label="Posisi tayangan" tabindex="0"><i></i></div>
      <span class="time">0:00 / ${fmt(TOTAL)}</span></div></div>`;
    const cv = host.querySelector('canvas'), ctx = cv.getContext('2d');
    const btn = host.querySelector('.pp'), bar = host.querySelector('.bar'), fill = bar.querySelector('i'), tm = host.querySelector('.time');
    let t = 0, playing = false, last = 0, raf = 0, img = null, watched = false;
    const im = new Image();
    im.onload = () => { img = im; render(); };
    im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(K.koma(200, 'hore').replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '));

    function fmt(s) { s = Math.floor(s); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
    function render() {
      bg(ctx);
      let acc = 0;
      for (const sc of SCENES) {
        if (t < acc + sc.d || sc === SCENES[SCENES.length - 1]) {
          const p = clamp01((t - acc) / sc.d);
          sc.draw(ctx, p, img); caption(ctx, sc.cap);
          break;
        }
        acc += sc.d;
      }
      fill.style.width = (t / TOTAL * 100) + '%';
      tm.textContent = fmt(t) + ' / ' + fmt(TOTAL);
    }
    function loop(now) {
      if (!playing) return;
      t += (now - last) / 1000; last = now;
      if (t >= TOTAL) { t = TOTAL; K.music?.pauseVideo(false); playing = false; btn.textContent = '↺ Ulangi'; watched = true; host.dispatchEvent(new CustomEvent('selesai')); }
      render();
      if (playing) raf = requestAnimationFrame(loop);
    }
    btn.onclick = () => {
      if (playing) { K.music?.pauseVideo(false); playing = false; btn.textContent = '▶ Putar'; return; }
      if (t >= TOTAL) t = 0;
      K.music?.pauseVideo(true); playing = true; btn.textContent = '❚❚ Jeda'; last = performance.now(); raf = requestAnimationFrame(loop);
    };
    function seek(e) {
      const r = bar.getBoundingClientRect();
      t = clamp01((e.clientX - r.left) / r.width) * TOTAL; render();
    }
    bar.addEventListener('click', seek);
    bar.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { t = Math.min(TOTAL, t + 5); render(); }
      if (e.key === 'ArrowLeft') { t = Math.max(0, t - 5); render(); }
    });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(render);
    render();
    return { stop() { K.music?.pauseVideo(false); playing = false; cancelAnimationFrame(raf); }, watched: () => watched };
  };
})();
