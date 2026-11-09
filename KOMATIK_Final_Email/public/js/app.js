/* KOMATIK · router dan kerangka aplikasi */
(function () {
  const S = K.store, esc = K.esc;
  let leaveFns = [];
  K.onLeave = fn => leaveFns.push(fn);

  const NAV_STAGE = { aktivitas: 'a1', kuis: 'kuis', games: 'games', evaluasi: 'evaluasi' };

  function updateChrome(page) {
    const logged = !!S.data;
    K.$('#topbar').hidden = !logged;
    K.$('#syncbar').hidden = !logged;
    K.$('#foot').hidden = false;
    K.$$('.foot-links a[href="#/catatan"]').forEach(a => a.hidden = !logged);
    if (!logged) return;
    K.$$('#mainnav a').forEach(a => {
      const n = a.dataset.nav;
      a.classList.toggle('active', n === page || (n === 'aktivitas' && page === 'aktivitas'));
      const st = NAV_STAGE[n];
      const locked = st && !S.isOpen(st);
      a.classList.toggle('locked', !!locked);
      a.title = locked ? 'Masih terkunci' : '';
    });
    const p = S.data.profil;
    K.$('#userchip').innerHTML = `<button type="button" class="userchip" id="chipBtn">👤 ${esc(p.nama || p.kode)} · ${esc(p.kelas)} · ${S.percent()}%</button>`;
    K.$('#chipBtn').onclick = () => K.modal({
      title: '👤 ' + esc(p.nama || 'Penjelajah'),
      body: `<p>Kode siswa <b>${esc(p.kode)}</b> · Kelas <b>${esc(p.kelas)}</b><br>Kemajuan belajar: <b>${S.percent()}%</b></p><p class="small muted">Jika komputer ini dipakai bergantian, tekan <b>Ganti siswa</b>. Tunggu tanda progres tersimpan di server sebelum berganti perangkat. Gunakan kode, kelas, nama, dan token yang sama untuk masuk kembali.</p>`,
      actions: [{ label: 'Tutup' }, { label: '🔁 Ganti siswa', primary: true, onClick: async () => { try { await S.logout(); location.hash = '#/masuk'; } catch(e) { K.toast(esc(e.message)); } } }]
    });
  }

  function route() {
    leaveFns.forEach(f => { try { f(); } catch (e) {} }); leaveFns = [];
    K.closeModal();
    const parts = location.hash.replace(/^#\/?/, '').split('/');
    let page = parts[0] || (S.data ? 'beranda' : 'masuk');
    if (!S.data && page !== 'masuk' && page !== 'guru') { location.replace('#/masuk'); return; }
    if (S.data && page === 'masuk') page = 'masuk';
    const app = K.$('#app');
    app.classList.remove('ordinary-mode');
    updateChrome(page);
    K.$('#mainnav').classList.remove('open');
    K.$('#menuToggle').setAttribute('aria-expanded', 'false');
    switch (page) {
      case 'masuk': K.pages.masuk(app); break;
      case 'mode': K.pages.mode(app); break;
      case 'beranda': K.pages.beranda(app); break;
      case 'materi': K.pages.materi(app); break;
      case 'lab': K.pages.lab(app); break;
      case 'aktivitas': parts[1] ? K.pages.aktivitas(app, +parts[1]) : K.pages.aktivitasHub(app); break;
      case 'kuis': K.pages.kuis(app); break;
      case 'games': K.pages.games(app); break;
      case 'evaluasi': K.pages.evaluasi(app); break;
      case 'catatan': K.pages.catatan(app); break;
      case 'profil': K.pages.profil(app); break;
      case 'guru': K.pages.guru(app); break;
      default: K.pages.beranda(app);
    }
    K.cloud.afterRoute();
    window.scrollTo(0, 0);
    app.focus({ preventScroll: true });
  }

  async function init() {
    K.$('#brandMark').innerHTML = K.koma(40, 'senang');
    await S.resume();
    K.$('#saveCloud').onclick = async () => { try { await K.cloud.flush(); K.toast('Progres tersimpan. Kamu boleh melanjutkan di perangkat lain.'); } catch(e) { K.toast(esc(e.message)); } };
    const st = K.$('#soundToggle');
    const setSnd = () => st.textContent = K.soundOn() ? '🔊 Suara: nyala' : '🔇 Suara: mati';
    st.onclick = () => { S.pref('suara', K.soundOn() ? '0' : '1'); setSnd(); };
    setSnd();
    K.$('#menuToggle').onclick = () => {
      const nav = K.$('#mainnav'), open = !nav.classList.contains('open');
      nav.classList.toggle('open', open); K.$('#menuToggle').setAttribute('aria-expanded', String(open));
    };
    K.$('#modal').addEventListener('click', e => { if (e.target.id === 'modal') K.closeModal(); });
    // perbarui tampilan menu setelah ada kemajuan (mis. aktivitas selesai)
    const origMark = S.markDone.bind(S);
    S.markDone = stage => { const r = origMark(stage); updateChrome((location.hash.replace(/^#\/?/, '').split('/')[0]) || 'beranda'); return r; };
    window.addEventListener('hashchange', route);
    if(S.data && !S.data.mode) location.hash='#/mode';
    route();
  }
  K.refresh=route;
  document.addEventListener('DOMContentLoaded', init);
})();
