# Panduan KOMATIK Final Email

Paket 7 November 2026. Tujuan: siswa menekan **Kirim Evaluasi ke Guru**, guru menerima PDF melalui email, lalu mencetak dan mengoreksi. PDF memuat 10 soal evaluasi website, jawaban dan alasan, skor 0–4 per soal, total maksimum 40, serta ruang catatan guru. PDF ini bukan instrumen pretest–posttest penelitian.

## 1. Siapkan akun dan alamat

Siapkan akun Netlify, GitHub, Resend (https://resend.com), dan alamat email guru. Siswa tidak memerlukan akun email. Alamat penerima ditentukan di server; siswa tidak dapat memilih penerima lain.

Untuk penggunaan sungguhan, siapkan domain pengirim yang DNS-nya dapat Anda kelola (domain sekolah dapat digunakan dengan izin pengelola). Alamat netlify.app tidak memberikan akses DNS untuk memverifikasi domain pengirim. Penerima tetap dapat menggunakan Gmail. Website tidak wajib memakai domain khusus yang sama dengan domain email.

Untuk uji awal saja, Resend menyediakan pengirim onboarding@resend.dev dan hanya mengizinkan pengiriman ke alamat yang terhubung dengan akun Resend Anda. Untuk mengirim ke alamat guru yang berbeda, verifikasi domain terlebih dahulu. Periksa kuota layanan pada akun sebelum penggunaan kelas; paket ini tidak menjanjikan layanan gratis tanpa batas.

## 2. Aktifkan Resend

1. Masuk ke Resend, buka Domains, pilih Add Domain.
2. Masukkan domain/subdomain milik Anda, ikuti instruksi DNS yang ditampilkan. Tambahkan record yang diminta melalui pengelola domain, lalu verifikasi. Jangan menghapus record email sekolah yang sudah ada.
3. Tunggu status pengiriman domain terverifikasi.
4. Buka API Keys dan buat kunci dengan izin pengiriman pada domain tersebut. Simpan nilainya di pengaturan Netlify pada langkah 4, bukan di kode atau GitHub.
5. Tentukan pengirim, misalnya `KOMATIK <evaluasi@domain-anda.sch.id>`. Contoh ini harus diganti dengan domain yang benar-benar Anda verifikasi.

## 3. Ekstrak ZIP dan unggah proyek ke GitHub

1. Ekstrak ZIP. Buka folder KOMATIK_Final_Email.
2. Buat repositori GitHub baru, sebaiknya private.
3. Unggah ISI folder tersebut, termasuk folder public, server, netlify, scripts, tests, serta package.json, package-lock.json dan netlify.toml. Pada akar repositori harus langsung terlihat package.json dan netlify.toml, bukan folder pembungkus lagi.
4. Jangan unggah node_modules, .netlify, .env atau kunci rahasia.
5. Simpan perubahan (Commit).

## 4. Hubungkan ke Netlify dan atur email

1. Di Netlify pilih Add new project → Import an existing project → GitHub.
2. Izinkan akses ke repositori KOMATIK, lalu pilih repositorinya.
3. Gunakan Base directory kosong (akar repositori), Build command `npm run build`, Publish directory `public`. Konfigurasi fungsi `netlify/functions` dan font PDF sudah tercantum dalam netlify.toml. Node 22 sudah diatur.
4. Tambahkan Environment variables melalui konfigurasi proyek, sebelum deploy jika tersedia. Jika proyek sudah terbit, tambahkan lalu deploy ulang:

| Nama | Nilai |
|---|---|
| RESEND_API_KEY | API key asli dari Resend |
| MAIL_FROM | KOMATIK <alamat-pengirim@domain-terverifikasi> |
| TEACHER_EMAIL | Email guru penerima laporan |
| TEACHER_ACCESS_KEY | Opsional: kunci acak minimal 16 karakter untuk rekap server Ruang guru |

Bila pilihan scope tersedia, pastikan variabel dapat digunakan oleh Functions. Pilih konteks Production untuk situs utama. API key jangan ditulis di public/config.js atau netlify.toml.

5. Klik Publish/Deploy. Jika variabel ditambahkan setelah deploy pertama, jalankan deploy baru dari halaman Deploys.
6. Periksa hasil build dan daftar Functions. Harus tersedia submit-evaluation, evaluation-pdf, activity, dan teacher. Penyimpanan memakai Netlify Blobs yang diakses dari fungsi; tidak perlu menambahkan database eksternal.
7. Buka alamat produksi situs. Jika situs dibatasi akses oleh pengaturan akun, sesuaikan akses untuk kebutuhan kelas.

Jika memperbarui situs KOMATIK lama, hubungkan repositori melalui pengaturan deployment situs yang sama untuk mempertahankan URL. Membuat proyek baru menghasilkan URL baru dan data browser lama tidak otomatis berpindah. Cadangkan sesi lama terlebih dahulu jika diperlukan.

## 5. Alternatif melalui terminal tanpa GitHub

Pasang Node.js 22 dan npm. Buka terminal di folder yang memuat package.json, kemudian jalankan satu per satu:

```bash
npm ci
npm test
npm run build
npx netlify-cli login
npx netlify-cli link
```

Pilih situs Netlify yang sudah dibuat. Tambahkan variabel email melalui dashboard Netlify seperti langkah 4. Lalu:

```bash
npx netlify-cli deploy --build --prod
```

Pastikan Anda berada pada situs tujuan yang benar sebelum deploy produksi. Metode ini menerapkan public dan fungsi server bersama-sama. Mengunggah ZIP atau public melalui Drop saja tidak cukup untuk fitur email.

## 6. Uji sebelum dipakai kelas

1. Gunakan kode siswa uji, misalnya UJI-01 dan kelas UJI.
2. Selesaikan alur Materi → Aktivitas 1–4 → Kuis → Games → Evaluasi. Tahap tetap berurutan.
3. Isi jawaban dan alasan, tinjau, lalu tekan Kirim Evaluasi ke Guru. Jawaban terkunci setelah dikumpulkan.
4. Tunggu status. “Layanan email menerima laporan PDF” berarti layanan menerima permintaan, bukan bukti guru sudah membaca atau email pasti masuk inbox.
5. Guru memeriksa inbox dan spam. Buka lampiran PDF, periksa semua 10 soal, kemudian cetak ukuran A4. CSV dan JSON ikut dikirim untuk cadangan.
6. Periksa Resend Logs jika email tidak masuk. Uji ulang tombol kirim setelah berhasil: aplikasi tidak mengirim ulang laporan yang sudah mempunyai konfirmasi tersimpan.
7. Uji tombol Unduh PDF untuk dicetak. Tombol ini mengambil laporan yang sudah disimpan server dan memerlukan koneksi serta sesi siswa yang sama. Bila server tidak tersedia, cadangan JSON/CSV tetap dapat diunduh dari perangkat.
8. Jika mengganti siswa pada komputer yang sama, gunakan menu sesi untuk berganti siswa setelah menyimpan cadangan. Jangan menghapus data browser sebelum pengumpulan selesai.

## 7. Jika ada kendala

| Gejala | Tindakan |
|---|---|
| Email belum diaktifkan | Periksa ketiga variabel wajib, cakupan Functions jika tersedia, dan deploy ulang. |
| Server tidak tersedia/404 | Pastikan proyek lengkap dipublikasikan; bukan hanya public melalui Drop. |
| Resend menolak pengiriman | Periksa API key, domain MAIL_FROM, penerima uji, serta kuota di Resend. |
| Email diterima layanan tetapi tidak muncul | Periksa inbox/spam dan log delivered/bounced di Resend; status aplikasi tidak membuktikan pengantaran inbox. |
| PDF belum tersedia | Kirim/periksa evaluasi dahulu; gunakan sesi asal dan tunggu konfirmasi penyimpanan server. |
| Build gagal | Periksa log Netlify, Node 22, package-lock.json, server/fonts dan netlify.toml. |
| Ruang guru menolak akses server | Atur TEACHER_ACCESS_KEY minimal 16 karakter, deploy ulang; fitur ini opsional untuk alur cetak lewat email. |

Jika koneksi gagal, jawaban lokal tetap tersedia. Gunakan Coba kirim email lagi setelah koneksi pulih. Unduh cadangan JSON/CSV sebelum mengganti perangkat. Guru dapat mengimpor JSON melalui Ruang guru sebagai jalur cadangan.

## 8. Cakupan perubahan dan pengujian

Yang ditambahkan: lampiran PDF siap cetak, unduhan PDF terautentikasi setelah penyimpanan, tombol Kirim Evaluasi ke Guru, serta konfigurasi bundel font PDF. Materi, empat aktivitas, kuis, games, dan navigasi satu tab dipertahankan. Sumber data dan penilaian tetap dipisahkan antara evaluasi formatif website dan pretest–posttest penelitian.

Paket telah diuji secara lokal untuk pembuatan PDF, jawaban panjang, pengiriman simulasi, kegagalan layanan, dan pengiriman ulang setelah berhasil. Email sungguhan serta deploy pada akun Anda belum diuji karena memerlukan akun dan pengaturan milik Anda. Tidak ada email yang dikirim kepada guru selama penyusunan paket.

Kategori waktu tunggu yang tidak pasti atau retry setelah masa berlaku idempotency layanan masih perlu diperiksa melalui log; tidak ada klaim jaminan exactly-once dalam semua kondisi jaringan.

## Dokumentasi resmi

- Netlify Functions: https://docs.netlify.com/build/functions/get-started/
- Deploy repositori: https://docs.netlify.com/start/quickstarts/deploy-from-repository/
- Environment variables: https://docs.netlify.com/build/functions/environment-variables/
- Batas pengirim uji Resend: https://resend.com/docs/knowledge-base/403-error-resend-dev-domain
- Domain Resend: https://resend.com/docs/dashboard/domains/introduction
