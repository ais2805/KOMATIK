// Shared by the browser and server so equivalent solutions earn the same points.
export const algorithmItems = [
  'Periksa kembali hasil dan banyak baris setelah menjalankan langkah.',
  'Tulis 6 pot pada baris pertama.',
  'Simpulkan banyak pot pada baris kelima.',
  'Tambahkan 4 untuk setiap baris berikutnya sampai baris kelima.',
  'Baca posisi yang ditanyakan.'
];

function followsDependencies(order, size, dependencies) {
  if (!Array.isArray(order) || order.length !== size || new Set(order).size !== size ||
      order.some(n => !Number.isInteger(n) || n < 0 || n >= size)) return false;
  return dependencies.every(([before, after]) => order.indexOf(before) < order.indexOf(after));
}

export const validActivityOrder = order => followsDependencies(order, 5, [[4,3],[1,3],[3,0],[0,2]]);
// Checking the common difference may happen before or after extending the pattern.
export const validQuizOrder = order => followsDependencies(order, 4, [[2,3],[3,0],[1,0]]);

const hints = {
  a1: [
    ['Cari informasi yang sudah tertulis pada cerita taman.', 'Baca data baris pertama, kedua, dan ketiga. Apakah data itu sudah diberikan atau masih harus dicari?'],
    ['Temukan bagian cerita taman yang masih berupa pertanyaan.', 'Baris mana yang ingin diketahui? Pikirkan pertanyaan kecil yang menghubungkan data awal dengan baris itu.'],
    ['Gunakan data tiga baris awal untuk membuat dugaanmu.', 'Amati perubahan dari 6 ke 10 dan dari 10 ke 14. Bagaimana perubahan itu membantumu memperkirakan baris kelima?']
  ],
  a2: [
    ['Pasangkan pot dari dua baris yang berdekatan. Amati pot yang tersisa.', 'Bandingkan baris 1 dengan 2, lalu baris 2 dengan 3. Apakah banyak pot tambahan pada kedua pasangan sama?'],
    ['Gunakan perubahan yang kamu temukan untuk melanjutkan baris pot.', 'Mulai dari baris ketiga. Terapkan perubahan yang sama sekali untuk baris keempat, lalu sekali lagi untuk baris kelima.'],
    ['Periksa perubahan pada setiap pasangan bilangan, bukan hanya pasangan pertama.', 'Bandingkan 10 − 6, 15 − 10, dan 18 − 15. Bilangan mana yang perlu diperbaiki agar semua perpindahan mengikuti aturan?'],
    ['Perhatikan persediaan pita: 35, 30, 25. Banyak pitanya berkurang.', 'Bandingkan 35 − 30 dan 30 − 25. Apakah pengurangannya sama? Gunakan pengurangan itu untuk hari keempat dan kelima.']
  ],
  a3: [
    ['Pilih informasi yang membantu menentukan banyak pot pada suatu baris.', 'Jika warna atau bentuk pot diganti, apakah banyak pot berubah? Bandingkan dengan pengaruh bilangan awal, perubahan, dan nomor baris.'],
    ['Aturanmu perlu menyebutkan bilangan awal dan perubahan setiap baris.', 'Buktikan aturan dengan dua perpindahan dari pola 6, 10, 14. Apakah aturanmu cocok untuk keduanya?'],
    ['Gunakan aturanmu sampai posisi keenam, lalu periksa banyak perpindahannya.', 'Posisi pertama sudah berisi 6 pot. Catat hasil untuk posisi berikutnya satu per satu sampai posisi keenam.'],
    ['Bandingkan bilangan awal dan perubahan pada kedua pola.', 'Amati 6, 10, 14 dan 9, 13, 17. Bagian mana yang sama? Bagian mana yang berbeda?']
  ],
  a4: [
    ['Nilai awal dan posisi tujuan perlu diketahui sebelum kamu melanjutkan pola.', 'Kamu boleh membaca posisi tujuan atau menulis nilai awal lebih dahulu. Setelah melanjutkan pola, periksa hasilnya sebelum menyimpulkan.'],
    ['Bedakan banyak baris dengan banyak perpindahan antarbaris.', 'Gambarkan posisi 1 sampai 5. Hitung perpindahannya, lalu bandingkan dengan cara Si KOMA.'],
    ['Kesimpulan perlu menjawab pertanyaan taman dengan hasil, satuan, dan alasan.', 'Hubungkan hasil akhir dengan aturanmu. Bandingkan juga dengan dugaan awal yang ditampilkan pada langkah ini.']
  ]
};

export function activityHint(stage, step, level = 1) {
  const pair = hints[stage]?.[step];
  return pair?.[level > 1 ? 1 : 0] || 'Baca kembali informasi pada langkah ini, lalu ceritakan cara berpikirmu.';
}

export function rememberHint(draft, record, stage, step, at = new Date().toISOString()) {
  draft.hintByStep ??= {};
  const level = Math.min(2, (Number(draft.hintByStep[step]) || 0) + 1);
  draft.hintByStep[step] = level;
  const entry = {at, type:'prompt', step:step + 1, level, text:activityHint(stage, step, level)};
  draft.helpLog = [...(draft.helpLog || []), entry].slice(-100);
  if (record) record.hints = [...(record.hints || []), entry].slice(-100);
  return entry;
}
