# Panduan KOMATIK V5

Versi pengembangan, 12 November 2026. Tampilan v4 dipertahankan. Baca laporan pengujian sebelum menerbitkan ke kelas.

## Yang dipertahankan

Repository ais2805/KOMATIK, folder KOMATIK_Final_Email, proyek Netlify yang sama, integrasi Resend, Pulau Pola, robot kotak Si KOMA, gambar pola, serta sepuluh soal evaluasi v4. Soal pertama dimulai 5, 9, 13; soal kedua tentang 42, 36, 30 stiker. Ini evaluasi website, bukan instrumen pretest/posttest baru.

CT menyusun empat aktivitas: Memahami Masalah (dekomposisi), Menemukan Pola (pengenalan pola), Membuat Aturan (abstraksi), dan Menyusun Langkah (berpikir algoritmik). Lima indikator penalaran diukur melalui evaluasi, masing-masing dua soal.

## Sebelum penerbitan produksi

1. Simpan cadangan dari Ruang Guru versi lama. Jangan menghapus proyek Netlify atau penyimpanan Blobs.
2. Uji branch development/komatik-v5 terlebih dahulu. Pastikan Build command adalah npm run build, Base directory KOMATIK_Final_Email, Publish directory dist, Functions directory netlify/functions. Jangan mengulangi nama folder pada Publish dan Functions directory.
3. Variabel rahasia server tetap di Netlify: TEACHER_PASSWORD (minimal 12 karakter), SESSION_SECRET (minimal 32 karakter), RESEND_API_KEY. Isi TEACHER_EMAIL dan MAIL_FROM sesuai konfigurasi Resend sebelumnya. Jangan kirim nilainya melalui chat atau GitHub.
4. Untuk Deploy Preview, sediakan kata sandi dan SESSION_SECRET khusus pengujian melalui Environment variables. Kode secara otomatis memakai tempat penyimpanan pratinjau terpisah dan menonaktifkan email nyata pada pratinjau.
5. Konfirmasi branch produksi di Netlify masih main. Pengaturan akun Netlify belum diverifikasi langsung dalam pekerjaan ini.
6. Periksa data lama sebelum penggabungan. V5 menggunakan skema baru dan belum mengonversi akun/progres versi sebelumnya secara otomatis. Data lama tetap berada di tempatnya; tombol Cadangkan data & arsip lama dapat mengekspor arsip server pada produksi. Jangan menerbitkan saat siswa masih mengerjakan versi lama tanpa rencana transisi.
7. Setelah verifikasi pratinjau memadai, gabungkan perubahan ke main. Tunggu Published. Uji satu akun kelas UJI di produksi, termasuk penerimaan PDF lewat Resend, sebelum membagikan ke kelas.

Build menyiapkan dist dari daftar berkas yang diizinkan. Berkas rubrik server dan JavaScript lama tidak diterbitkan sebagai aset website. Jangan mengunggah public saja melalui Netlify Drop karena login dan penyimpanan memerlukan Functions.

## Penggunaan guru

1. Buka website, pilih Masuk sebagai guru, gunakan kata sandi yang ditetapkan di Netlify.
2. Isi kode, kelas, dan nama pada Daftarkan siswa. Kode harus unik dalam kelas.
3. Sistem membuat token acak delapan karakter berisi huruf dan angka. Unduh kartu akses dan berikan hanya kepada siswa terkait. Token asli hanya tampil saat dibuat atau diatur ulang.
4. Melalui Buka siswa, perbarui identitas, nonaktifkan akun, atau buat token pengganti. Penggantian token membatalkan sesi lama tanpa menghapus progres.
5. Gunakan Sesi pembelajaran untuk membuka/menutup aktivitas atau evaluasi. Penutupan tidak menghapus hasil.
6. Setelah evaluasi dikumpulkan, buka jawaban asli, beri skor 0–4 dan komentar pada tiap butir, lalu Simpan penilaian. Skor kosong berarti belum dinilai.
7. Unduh PDF jawaban siswa, Rubrik PDF, Rekap CSV, atau cadangan. CSV memuat identitas, progres, jawaban, skor per butir, rekap indikator, dan nilai.

## Penggunaan siswa

1. Masukkan kode, kelas, nama, dan token dari kartu guru.
2. Pilih Petualangan untuk Pulau Pola atau Serius untuk daftar tahap. Kedua mode memakai data yang sama.
3. Baca Bekal Penjelajah, lanjutkan empat aktivitas, kuis, games, lalu evaluasi. Laboratorium Pola dapat dibuka kapan saja setelah masuk.
4. Di Laboratorium, ubah bilangan awal, tambah/kurang, banyak posisi, dan uji dugaan. Gunakan Jadikan pola pembanding sebelum mengganti aturan untuk membandingkan dua pola.
5. Aktivitas menyimpan jawaban awal dan perbaikan. Uraian diperiksa guru; poin hanya untuk komponen objektif. Benar pertama 10, benar kedua 7, dua kali belum benar 0. Penyelesaian aktivitas tetap mendapat lencana.
6. Musik awalnya OFF. Nyalakan, atur volume, atau matikan melalui kontrol di atas.
7. Sebelum menutup atau pindah perangkat, tekan Simpan sekarang dan tunggu Progres telah tersimpan di server. Masuk di perangkat lain dengan kartu yang sama, lalu pilih Lanjutkan belajar.
8. Saat koneksi putus, draf tetap disimpan lokal. Sistem mencoba lagi ketika koneksi kembali. Draf lokal yang belum diterima server belum tersedia pada perangkat lain.
9. Bila dua perangkat mengubah data bersamaan, unduh draf terlebih dahulu sebelum Muat data server. Penggabungan jawaban berbeda memerlukan pemeriksaan manual.
10. Sesi berlaku delapan jam. Jika berakhir, gunakan Masuk kembali; draf perangkat dipertahankan.
11. Tinjau sepuluh jawaban evaluasi, lalu konfirmasi pengumpulan. Jawaban final terkunci. Email dapat gagal tanpa menghapus jawaban yang telah diterima server.

## Penilaian penelitian

Skor maksimum 40; nilai = total skor / 40 × 100. Dua butir per indikator memiliki maksimum 8; capaian indikator = skor dua butir / 8 × 100. Poin aktivitas, kuis, dan games tidak masuk perhitungan ini. Rubrik PDF merupakan pedoman untuk soal v4 dan tetap perlu divalidasi ahli sebelum menjadi instrumen penelitian final.

## Berkas yang diedit jika isi berubah

| Bagian | Berkas |
|---|---|
| CP/TP, bacaan, narasi dan formulir aktivitas | public/app.js |
| Soal evaluasi, kuis, games, metadata CT–MR | public/content.js |
| Video YouTube, profil developer | public/config.js |
| Peta, jalur, jembatan pola | public/journey.js |
| Tampilan utama / tambahan | public/style.css dan public/v5.css |
| Login, sinkronisasi, Ruang Guru, CSV | public/v5-client.js |
| Musik dan ikon | public/v5-media.js |
| Autentikasi, penyimpanan, validasi, skor | server/v5/api.mjs |
| Kunci dan rubrik khusus tiap butir | server/v5/rubric.json |
| PDF dan pengiriman Resend | server/v5/reports.mjs |

Jika soal penelitian berubah, selaraskan rubrik, PDF, dan validasi instrumen; jangan mengganti butir saat siswa sedang mengerjakannya. Dokumen panduan versi sebelumnya di repository merupakan arsip, bukan petunjuk konfigurasi V5.

## Batasan yang perlu diketahui

Belum ada migrasi otomatis akun/progres lama, impor ulang cadangan melalui UI, atau ekspor PDF massal. Cadangan JSON dapat diunduh, tetapi pemulihan perlu bantuan teknis. Verifikasi Netlify Blobs nyata, penerimaan email Resend, dan uji perangkat fisik masih diperlukan. Pengujian lokal bukan bukti keberhasilan layanan produksi.
