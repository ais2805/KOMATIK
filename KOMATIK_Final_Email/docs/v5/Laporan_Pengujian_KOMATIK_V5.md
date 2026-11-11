# Laporan pengembangan dan pengujian KOMATIK V5

12 November 2026. Sumber: main pada commit 391f116e2f4f0b4723563a51fcd790a9d3ecdc15. Perubahan dikerjakan terpisah dari produksi. Hak akses repository telah diverifikasi melalui integrasi GitHub.

## Hasil otomatis

Perintah npm test: **28 lulus, 0 gagal** pada pemeriksaan terakhir. Terdiri atas 18 regresi modul lama dan 10 pengujian V5. npm run build lulus pemeriksaan sintaks dan menghasilkan dist bersih. Pengujian menggunakan penyimpanan simulasi; bukan layanan Blobs produksi.

| Skenario V5 | Hasil | Bukti/cakupan |
|---|---|---|
| Token 8 karakter, huruf-angka, unik | Lulus | Generator acak, dua akun, token berbeda |
| Salah identitas/token dan pembatasan login | Lulus | Penolakan 401; pembatasan 429 |
| Akses silang siswa dan akses guru | Lulus | Penolakan 403; hash tidak masuk respons |
| Progres lintas dua sesi/perangkat | Lulus | Draf, mode, halaman aktivitas tetap ada |
| Konflik dua perubahan | Lulus | Versi kedaluwarsa ditolak 409 |
| Reset token dan nonaktif akun | Lulus | Sesi lama ditolak; data tidak dihapus |
| Urutan tahap, sesi ditutup, injeksi poin | Lulus | Server menolak tahap palsu dan hitung ulang poin |
| Empat aktivitas, kuis, games, evaluasi | Lulus | Alur API lengkap memakai data simulasi |
| Kesempatan kedua | Lulus | Salah lalu benar = 7; riwayat tidak dapat ditimpa |
| Final evaluasi dan pengumpulan ulang | Lulus | Jawaban awal terkunci; ID pengumpulan sama |
| Penilaian manual | Lulus | Skor 0–4; nilai 5 ditolak; konflik skor ditolak |
| Pengiriman email ganda | Lulus simulasi | Fungsi kirim pengganti dipanggil satu kali |
| PDF jawaban dan rubrik | Lulus | Header PDF, generasi dan determinisme PDF V5 |
| Jawaban panjang | Lulus generasi | Berhasil menghasilkan PDF lebih besar; pemeriksaan visual panjang belum dilakukan |
| Pengiriman ulang saat respons hilang | Lulus API | requestId sama tidak membuat revisi kedua |
| Sesi kedaluwarsa dan cookie rusak | Lulus | Ditolak 401 |
| Kode identitas dilepas lalu digunakan lagi | Lulus | Akun berbeda tanpa menimpa akun lama |

## Pemeriksaan browser lokal

Tampilan v4 (robot kotak, peta asli, sidebar, warna), pemilihan mode, Laboratorium mandiri, penyimpanan status server, materi, Aktivitas 1, dan Aktivitas 2 telah diperiksa melalui interaksi browser. Jembatan pola mengecil menampilkan 35, 30, 25, 20, 15. Pola pembanding diperbaiki setelah ditemukan tidak ikut berubah saat aturan baru diterapkan; pemeriksaan ulang menampilkan pola naik dan turun yang berbeda secara benar.

Mode Serius dan tampilan lebar 390 piksel diperiksa. Hasil pemeriksaan responsif menggunakan iframe berukuran ponsel, bukan perangkat fisik. Rubrik 11 halaman dirender dan ditinjau: teks dan penomoran tidak terpotong.

## Ringkasan perubahan per kelompok berkas

| Berkas | Hasil |
|---|---|
| public/index.html, app.js, v5.css | Tampilan v4, dua mode, narasi CT, aktivitas bertahap, evaluasi final |
| public/content.js, config.js, journey.js | Pemetaan CT–MR, versi, jalur, jembatan turun, soal v4 tetap |
| public/assets/koma-*.svg | Delapan variasi robot kotak dari aset asli |
| public/v5-client.js | Identitas server, autosave, draf lokal, konflik, token, nilai, CSV |
| public/v5-media.js | Musik sintetis opsional dan ikon navigasi |
| server/v5/api.mjs | Auth, hash token, pembatasan login, kontrol akses, CAS, poin, backup, nilai manual |
| server/v5/reports.mjs, rubric.json | PDF jawaban asli, rubrik, Resend idempoten |
| netlify/functions/* | API baru; endpoint lama ditutup dengan 410 |
| scripts/build-v5.mjs, check.mjs, netlify.toml | Publikasi dist, pemisahan preview/production, sintaks |
| tests/v5.test.mjs | Sepuluh skenario utama V5 |
| public/js/*, public/css/*, assessment.js | Implementasi lama yang tidak digunakan dikeluarkan dari publikasi |

## Belum terverifikasi / keterbatasan

- Belum mengklaim penerimaan email nyata oleh guru. Resend pada uji lokal diganti fungsi simulasi, dan email nyata dimatikan pada Deploy Preview.
- Pengaturan akun Netlify dan branch produksi terkini belum dibaca langsung. Status Published lama tidak membuktikan deployment V5.
- Belum ada pengujian Netlify Blobs nyata, koneksi putus pada browser nyata, beban 26 siswa serentak, semua peramban, serta perangkat fisik.
- Akun dan progres skema sebelumnya belum otomatis dimigrasikan ke V5. Penyimpanan lama tidak dihapus. Arsip lama dapat diekspor pada produksi, tetapi memerlukan pemeriksaan sebelum transisi penelitian.
- Tidak ada impor cadangan melalui UI atau PDF massal. Cadangan per revisi server tersedia dan ekspor JSON disediakan.
- Rubrik yang disusun untuk soal v4 masih perlu validasi ahli. Instrumen tesis 1–5 tidak tersedia sebagai berkas lengkap dalam pekerjaan ini; kecocokan seluruh butirnya belum dapat disahkan.
- Soal kuis/games objektif diperiksa otomatis; mutu alasan tetap perlu ditinjau guru. Nilai penalaran hanya dari rubrik manual.
- Repository publik memuat sumber. Memindahkan kunci ke server mencegah pengiriman otomatis ke browser siswa, tetapi tidak membuat kode di repository publik menjadi rahasia.

## Syarat sebelum produksi

Verifikasi Netlify Build Preview, konfigurasi Functions, autentikasi, persistensi Blobs dan transisi data lama. Setelah itu uji Resend dengan akun SIMULASI/UJI di produksi dan pastikan guru menerima PDF. Jangan mengganti aplikasi yang sedang dipakai mengumpulkan data sebelum syarat tersebut terpenuhi.
