/* KOMATIK · penyimpanan kemajuan belajar di peramban (localStorage) */
window.K = window.K || {};

(function () {
  const PREFIX = 'komatik:v1:';
  const memory = {};

  function lsGet(key) {
    try { const v = localStorage.getItem(key); return v === null ? memory[key] || null : v; }
    catch (e) { return memory[key] || null; }
  }
  function lsSet(key, val) {
    memory[key] = val;
    try { localStorage.setItem(key, val); } catch (e) { /* mode privat: tetap di memori */ }
  }
  function lsDel(key) {
    delete memory[key];
    try { localStorage.removeItem(key); } catch (e) {}
  }
  function readJSON(key, fallback) {
    const raw = lsGet(key);
    if (!raw) return fallback;
    try { return JSON.parse(raw); } catch (e) { return fallback; }
  }

  const ORDER = ['materi', 'a1', 'a2', 'a3', 'a4', 'kuis', 'games', 'evaluasi'];
  const STAGE_NAMES = {
    materi: 'Materi',
    a1: 'Aktivitas 1: Memahami Masalah',
    a2: 'Aktivitas 2: Menemukan Pola',
    a3: 'Aktivitas 3: Membuat Aturan',
    a4: 'Aktivitas 4: Menyusun Langkah',
    kuis: 'Kuis',
    games: 'Games',
    evaluasi: 'Evaluasi'
  };

  function blank(profil) {
    return {
      app: 'KOMATIK', versi: 1,
      profil: profil,
      mulai: new Date().toISOString(),
      progress: {},
      respon: {},
      kuis: { percobaan: [], terbaik: null },
      games: {},
      evaluasi: { draft: {}, dikumpulkan: false, waktuKumpul: null },
      bukaSemua: false
    };
  }

  const S = {
    ORDER, STAGE_NAMES,
    data: null,

    keyFor(kelas, kode) { return PREFIX + 'siswa:' + kelas.trim().toUpperCase() + ':' + kode.trim().toUpperCase(); },

    profiles() { return readJSON(PREFIX + 'profiles', []); },

    login(kode, kelas, nama) {
      kode = kode.trim().toUpperCase(); kelas = kelas.trim().toUpperCase(); nama = (nama || '').trim();
      const key = this.keyFor(kelas, kode);
      let d = readJSON(key, null);
      if (!d) d = blank({ kode, kelas, nama });
      if (nama) d.profil.nama = nama;
      this.data = d;
      this.save();
      const list = this.profiles().filter(p => !(p.kode === kode && p.kelas === kelas));
      list.unshift({ kode, kelas, nama: d.profil.nama });
      lsSet(PREFIX + 'profiles', JSON.stringify(list.slice(0, 40)));
      lsSet(PREFIX + 'aktif', JSON.stringify({ kode, kelas }));
      return d;
    },

    resume() {
      const a = readJSON(PREFIX + 'aktif', null);
      if (!a) return null;
      const d = readJSON(this.keyFor(a.kelas, a.kode), null);
      this.data = d;
      return d;
    },

    logout() { lsDel(PREFIX + 'aktif'); this.data = null; },

    removeProfile(kelas, kode) {
      lsDel(this.keyFor(kelas, kode));
      const list = this.profiles().filter(p => !(p.kode === kode && p.kelas === kelas));
      lsSet(PREFIX + 'profiles', JSON.stringify(list));
    },

    save() { if (this.data) lsSet(this.keyFor(this.data.profil.kelas, this.data.profil.kode), JSON.stringify(this.data)); },

    isDone(stage) { return !!(this.data && this.data.progress[stage]); },
    markDone(stage) {
      if (!this.data.progress[stage]) { this.data.progress[stage] = new Date().toISOString(); this.save(); return true; }
      return false;
    },
    isOpen(stage) {
      if (!this.data) return false;
      if (this.data.bukaSemua) return true;
      const i = ORDER.indexOf(stage);
      if (i <= 0) return true;
      return this.isDone(ORDER[i - 1]);
    },
    current() {
      for (const s of ORDER) if (!this.isDone(s)) return s;
      return 'selesai';
    },
    percent() {
      if (!this.data) return 0;
      return Math.round(ORDER.filter(s => this.isDone(s)).length / ORDER.length * 100);
    },

    /* ---- jawaban awal & perbaikan ---- */
    resp(id) { return this.data.respon[id] || null; },
    record(id, nilai, benar) {
      const now = new Date().toISOString();
      let r = this.data.respon[id];
      if (!r) {
        r = this.data.respon[id] = { awal: { nilai, benar, waktu: now }, perbaikan: [], selesai: false };
      } else {
        const last = r.perbaikan.length ? r.perbaikan[r.perbaikan.length - 1].nilai : r.awal.nilai;
        if (JSON.stringify(last) !== JSON.stringify(nilai)) r.perbaikan.push({ nilai, benar, waktu: now });
      }
      if (benar) r.selesai = true;
      this.save();
      return r;
    },
    latest(id) {
      const r = this.resp(id);
      if (!r) return null;
      return r.perbaikan.length ? r.perbaikan[r.perbaikan.length - 1].nilai : r.awal.nilai;
    },

    /* ---- penilaian guru (di perangkat guru) ---- */
    teacherScores() { return readJSON(PREFIX + 'guru:skor', {}); },
    saveTeacherScores(obj) { lsSet(PREFIX + 'guru:skor', JSON.stringify(obj)); },
    teacherOk() { return lsGet(PREFIX + 'guru:ok') === '1'; },
    setTeacherOk(v) { if (v) lsSet(PREFIX + 'guru:ok', '1'); else lsDel(PREFIX + 'guru:ok'); },

    pref(name, val) {
      if (val === undefined) return lsGet(PREFIX + 'pref:' + name);
      lsSet(PREFIX + 'pref:' + name, String(val));
    }
  };

  K.store = S;
})();
