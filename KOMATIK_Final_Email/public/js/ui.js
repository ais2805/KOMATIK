/* KOMATIK · komponen tampilan bersama */
(function () {
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  K.$ = $; K.$$ = $$;

  K.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  };

  /* ---------- Si KOMA, maskot pemandu ---------- */
  K.koma = function (size, mood) {
    size = size || 110; mood = mood || 'senang';
    const mouth = {
      senang: '<path d="M50 84 Q60 94 70 84" stroke="#1d3b40" stroke-width="3.5" fill="none" stroke-linecap="round"/>',
      hore: '<path d="M48 82 Q60 100 72 82 Z" fill="#1d3b40"/><path d="M53 89 Q60 95 67 89" fill="#ff8a7a"/>',
      pikir: '<path d="M53 87 Q60 84 67 87" stroke="#1d3b40" stroke-width="3.5" fill="none" stroke-linecap="round"/>',
      ayo: '<ellipse cx="60" cy="87" rx="6" ry="5" fill="#1d3b40"/>'
    }[mood] || '';
    const pupilY = mood === 'pikir' ? 64 : 67;
    const arms = mood === 'hore'
      ? '<path d="M24 76 Q12 62 14 48" stroke="#0b8f8a" stroke-width="8" stroke-linecap="round" fill="none"/><path d="M96 76 Q108 62 106 48" stroke="#0b8f8a" stroke-width="8" stroke-linecap="round" fill="none"/>'
      : mood === 'pikir'
        ? '<path d="M24 86 Q14 92 18 102" stroke="#0b8f8a" stroke-width="8" stroke-linecap="round" fill="none"/><path d="M95 84 Q104 76 92 68" stroke="#0b8f8a" stroke-width="8" stroke-linecap="round" fill="none"/>'
        : '<path d="M24 84 Q12 90 14 100" stroke="#0b8f8a" stroke-width="8" stroke-linecap="round" fill="none"/><path d="M96 84 Q108 90 106 100" stroke="#0b8f8a" stroke-width="8" stroke-linecap="round" fill="none"/>';
    return `<svg class="koma koma-${mood}" width="${size}" height="${size * 1.1}" viewBox="0 0 120 132" role="img" aria-label="Si KOMA">
      <ellipse cx="60" cy="127" rx="30" ry="4" fill="rgba(0,0,0,.12)"/>
      ${arms}
      <path d="M86 104 C98 114 96 126 80 130 C88 122 86 114 76 108 Z" fill="#0b8f8a"/>
      <circle cx="60" cy="76" r="40" fill="#14b3a8"/>
      <ellipse cx="60" cy="92" rx="24" ry="18" fill="#bff3e9"/>
      <ellipse cx="44" cy="122" rx="9" ry="5" fill="#0b8f8a"/><ellipse cx="76" cy="122" rx="9" ry="5" fill="#0b8f8a"/>
      <circle cx="46" cy="66" r="11" fill="#fff"/><circle cx="74" cy="66" r="11" fill="#fff"/>
      <circle cx="47" cy="${pupilY}" r="6" fill="#1d3b40"/><circle cx="75" cy="${pupilY}" r="6" fill="#1d3b40"/>
      <circle cx="49" cy="${pupilY - 2}" r="2" fill="#fff"/><circle cx="77" cy="${pupilY - 2}" r="2" fill="#fff"/>
      <circle cx="34" cy="80" r="5" fill="#ff9e8f" opacity=".7"/><circle cx="86" cy="80" r="5" fill="#ff9e8f" opacity=".7"/>
      ${mouth}
      <path d="M22 44 Q60 30 98 44 L92 50 Q60 40 28 50 Z" fill="#c98b3a"/>
      <path d="M34 44 Q36 16 60 14 Q84 16 86 44 Z" fill="#e8b45a"/>
      <path d="M35 40 Q60 32 85 40 L85 45 Q60 37 35 45 Z" fill="#7a4a1c"/>
      <circle cx="80" cy="38" r="4" fill="#ff7b54"/>
    </svg>`;
  };

  K.say = function (text, mood, extraClass) {
    return `<div class="say ${extraClass || ''}">${K.koma(84, mood)}<div class="bubble">${text}</div></div>`;
  };

  /* ---------- pot bunga ---------- */
  K.pot = function (opt) {
    opt = opt || {};
    const c = opt.color || '#d9733b', rim = opt.rim || '#b85a26';
    const extra = opt.extra ? ' pot-extra' : '';
    const body = opt.shape === 'kotak'
      ? `<rect x="9" y="24" width="22" height="18" rx="2" fill="${c}"/><rect x="7" y="20" width="26" height="6" rx="2" fill="${rim}"/>`
      : `<path d="M9 24 L31 24 L28 42 L12 42 Z" fill="${c}"/><rect x="7" y="20" width="26" height="6" rx="3" fill="${rim}"/>`;
    const flower = opt.flower || '#ff5d8f';
    return `<svg class="pot${extra}" viewBox="0 0 40 44" width="${opt.size || 34}" height="${(opt.size || 34) * 1.1}" aria-hidden="true">
      <path d="M20 21 Q19 12 20 8" stroke="#3a9a4a" stroke-width="2.5" fill="none"/>
      <ellipse cx="14" cy="15" rx="5" ry="3" fill="#4cb25c" transform="rotate(-25 14 15)"/>
      <ellipse cx="26" cy="13" rx="5" ry="3" fill="#4cb25c" transform="rotate(25 26 13)"/>
      <circle cx="20" cy="7" r="4.5" fill="${flower}"/><circle cx="20" cy="7" r="1.8" fill="#ffd84d"/>
      ${body}</svg>`;
  };

  K.potRow = function (n, opts) {
    opts = opts || {};
    let s = '';
    for (let i = 0; i < n; i++) {
      const o = Object.assign({}, opts.each ? opts.each(i) : {});
      if (opts.extraFrom != null && i >= opts.extraFrom) o.extra = true;
      s += K.pot(o);
    }
    return `<div class="potrow">${s}</div>`;
  };

  /* ---------- notifikasi, modal, suara, konfeti ---------- */
  let toastT;
  K.toast = function (msg) {
    const t = $('#toast');
    t.innerHTML = msg; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2800);
  };

  K.modal = function (o) {
    const m = $('#modal');
    $('#modalTitle').innerHTML = o.title || '';
    $('#modalBody').innerHTML = o.body || '';
    const acts = $('#modalActions'); acts.innerHTML = '';
    (o.actions || [{ label: 'Tutup', primary: true }]).forEach(a => {
      const b = document.createElement('button');
      b.className = 'btn ' + (a.primary ? 'btn-primary' : 'btn-ghost');
      b.textContent = a.label; b.type = 'button';
      b.onclick = () => { if (a.keepOpen !== true) K.closeModal(); if (a.onClick) a.onClick(); };
      acts.appendChild(b);
    });
    m.hidden = false;
    const first = acts.querySelector('.btn-primary') || acts.querySelector('button');
    if (first) first.focus();
  };
  K.closeModal = function () { $('#modal').hidden = true; };
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#modal').hidden) K.closeModal(); });

  let actx = null;
  K.soundOn = function () { return K.store.pref('suara') !== '0'; };
  K.sound = function (type) {
    if (!K.soundOn()) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const seq = { ok: [660, 880], no: [300, 220], win: [523, 659, 784, 1046], click: [520] }[type] || [440];
      seq.forEach((f, i) => {
        const o = actx.createOscillator(), g = actx.createGain();
        o.type = type === 'no' ? 'triangle' : 'sine'; o.frequency.value = f;
        const t0 = actx.currentTime + i * 0.11;
        g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.18, t0 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.16);
        o.connect(g); g.connect(actx.destination); o.start(t0); o.stop(t0 + 0.18);
      });
    } catch (e) {}
  };

  let confettiRun = 0;
  K.stopConfetti = function () { confettiRun++; const cv = $('#confetti'); cv.getContext('2d').clearRect(0, 0, cv.width, cv.height); cv.style.display = 'none'; };
  K.confetti = function () {
    const cv = $('#confetti'); const ctx = cv.getContext('2d'); const run = ++confettiRun;
    cv.width = innerWidth; cv.height = innerHeight; cv.style.display = 'block';
    const colors = ['#ff7b54', '#ffd84d', '#14b3a8', '#5b8def', '#ff5d8f', '#7bd389'];
    const parts = Array.from({ length: 140 }, () => ({
      x: Math.random() * cv.width, y: -20 - Math.random() * cv.height * 0.4,
      vx: (Math.random() - 0.5) * 3, vy: 2 + Math.random() * 3.5, r: 4 + Math.random() * 5,
      a: Math.random() * 6, va: (Math.random() - 0.5) * 0.3, c: colors[(Math.random() * colors.length) | 0]
    }));
    let frame = 0;
    (function loop() {
      if (run !== confettiRun) return;
      ctx.clearRect(0, 0, cv.width, cv.height);
      parts.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.a += p.va;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = p.c;
        ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r); ctx.restore();
      });
      if (++frame < 170) requestAnimationFrame(loop); else { ctx.clearRect(0, 0, cv.width, cv.height); cv.style.display = 'none'; }
    })();
  };

  K.stars = function (n, max) {
    max = max || 3; let s = '';
    for (let i = 0; i < max; i++) s += `<span class="star ${i < n ? 'on' : ''}">★</span>`;
    return `<span class="stars" aria-label="${n} dari ${max} bintang">${s}</span>`;
  };

  K.download = function (filename, text, mime) {
    const blob = new Blob([text], { type: mime || 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  };

  K.fmtTime = function (iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  /* mengubah teks jawaban siswa menjadi angka (mis. "22 pot" -> 22) */
  K.num = function (v) {
    const m = String(v == null ? '' : v).replace(',', '.').match(/-?\d+/);
    return m ? parseInt(m[0], 10) : null;
  };
})();
