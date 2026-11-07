export const stages = [
 {id:'materi',label:'Materi',name:'Bekal penjelajah',icon:'▤',color:'mint'},
 {id:'a1',label:'Aktivitas 1',name:'Memahami masalah',icon:'◈',color:'peach'},
 {id:'a2',label:'Aktivitas 2',name:'Menemukan pola',icon:'▥',color:'yellow'},
 {id:'a3',label:'Aktivitas 3',name:'Membuat aturan',icon:'◇',color:'lavender'},
 {id:'a4',label:'Aktivitas 4',name:'Menyusun langkah',icon:'↝',color:'blue'},
 {id:'kuis',label:'Kuis',name:'Tantangan bintang',icon:'☆',color:'yellow'},
 {id:'game',label:'Games',name:'Games Pulau Pola',icon:'⚑',color:'mint'},
 {id:'evaluasi',label:'Evaluasi',name:'Tunjukkan caramu',icon:'✎',color:'peach'}
];
export const quiz = [
 {q:'Bilangan apa yang datang berikutnya?',pattern:'4, 8, 12, …',options:['14','16','18','20'],key:1,why:'Setiap langkah bertambah 4. Jadi 12 + 4 = 16.'},
 {q:'Lanjutkan pola mengecil ini.',pattern:'45, 40, 35, …',options:['25','40','30','34'],key:2,why:'Setiap langkah berkurang 5. Jadi 35 − 5 = 30.'},
 {q:'Isi bilangan yang hilang.',pattern:'3, …, 11, 15',options:['5','8','9','7'],key:3,why:'Selisihnya 4. Bilangan yang hilang adalah 7: 3, 7, 11, 15.'},
 {q:'Bilangan apa yang cocok di tengah?',pattern:'36, 30, …, 18',options:['24','26','20','28'],key:0,why:'Kurangi 6 setiap langkah: 36, 30, 24, 18.'},
 {q:'Pilih aturan yang sesuai.',pattern:'7, 10, 13, 16',options:['Tambah 2','Kurang 3','Tambah 3','Tambah 7'],key:2,why:'10 − 7 = 3 dan 13 − 10 = 3, sehingga aturannya tambah 3.'},
 {q:'Mengapa aturan pola ini kurang 4?',pattern:'24, 20, 16',options:['Karena semua angkanya genap','Karena 24 − 20 dan 20 − 16 sama-sama 4','Karena dimulai dari 24','Karena ada tiga bilangan'],key:1,why:'Aturan dibuktikan dengan perubahan antarbilangan, bukan hanya sifat genapnya.'},
 {q:'Perbaiki satu bilangan agar selalu bertambah 5.',pattern:'5, 10, 16, 20',options:['Ganti 5 menjadi 6','Ganti 20 menjadi 21','Ganti 16 menjadi 15','Ganti 10 menjadi 11'],key:2,why:'Pola yang sesuai ialah 5, 10, 15, 20.'},
 {q:'Susun langkah mencari posisi keempat dari 8, 11, 14.',type:'order',items:['Simpulkan: posisi keempat adalah 17.','Periksa bahwa setiap perpindahan bertambah 3.','Mulai dari 8 pada posisi pertama.','Tambahkan 3 sampai posisi keempat.'],answer:[2,3,1,0],why:'Mulai 8, tambah 3 hingga posisi keempat, periksa, lalu simpulkan 17.'}
];
export const evaluation = [
 ['Mengajukan dugaan','Perhatikan 5, 9, 13. Perkirakan bilangan selanjutnya dan tuliskan informasi yang mendasari dugaanmu.'],
 ['Mengajukan dugaan','Pada hari pertama tersedia 42 stiker, hari kedua 36, dan hari ketiga 30. Jumlahnya berkurang tetap. Perkirakan jumlah stiker hari kelima dan jelaskan dasar perkiraanmu.'],
 ['Menemukan pola atau hubungan','Tentukan hubungan antarbilangan pada 8, 13, 18, 23. Jelaskan dengan membandingkan sekurang-kurangnya dua pasangan bilangan bersebelahan.'],
 ['Menemukan pola atau hubungan','Lengkapi 48, 41, …, 27. Jelaskan perubahan antarbilangan sebelum dan sesudah bagian yang kosong.'],
 ['Memberikan justifikasi','Rani mengatakan bahwa setelah 7, 11, 15, bilangan berikutnya adalah 20. Apakah kamu setuju? Berikan alasan berdasarkan perubahan tetap pada pola tersebut.'],
 ['Memberikan justifikasi','Bima mengisi 15 pada pola 30, 25, 20, …. Jelaskan mengapa jawabannya sesuai dengan aturan pola. Tunjukkan bukti dari dua perpindahan.'],
 ['Melakukan generalisasi','Perhatikan 3, 7, 11. Tuliskan aturan untuk melanjutkan pola, lalu gunakan aturan itu untuk menentukan bilangan pada posisi ketujuh.'],
 ['Melakukan generalisasi','Perhatikan 60, 54, 48. Tuliskan aturan pola dan gunakan untuk menentukan bilangan pada posisi kedelapan.'],
 ['Menarik kesimpulan','Jumlah kursi pada baris pertama 8, baris kedua 11, dan baris ketiga 14. Pertambahannya tetap. Tuliskan langkah singkat dan simpulkan jumlah kursi pada baris keenam.'],
 ['Menarik kesimpulan','Kotak pertama berisi 50 manik, kotak kedua 45, dan kotak ketiga 40. Pengurangannya tetap. Tuliskan langkah singkat dan simpulkan jumlah manik di kotak ketujuh.']
];
export const activityMeta = [
 {title:'Memahami masalah',ct:'Dekomposisi',place:'Taman Si KOMA',goal:'Pisahkan informasi, lalu sampaikan dugaanmu.',indicator:'Mengajukan dugaan',hint:'Apa yang sudah diketahui? Baris ke berapa yang ingin kita cari?'},
 {title:'Menemukan pola',ct:'Pengenalan pola',place:'Jembatan Pola',goal:'Bandingkan jumlah pot dan temukan perubahannya.',indicator:'Menemukan pola atau hubungan',hint:'Pasangkan pot yang sama. Hitung pot tambahan pada setiap baris.'},
 {title:'Membuat aturan',ct:'Abstraksi',place:'Gua Aturan',goal:'Pilih informasi penting dan uji aturanmu.',indicator:'Memberikan justifikasi dan melakukan generalisasi',hint:'Apakah warna pot menentukan jumlahnya? Tunjukkan dua perpindahan yang cocok.'},
 {title:'Menyusun langkah',ct:'Berpikir algoritma',place:'Mercusuar Pola',goal:'Jalankan langkahmu, periksa, lalu simpulkan.',indicator:'Menarik kesimpulan',hint:'Baris pertama sudah ada. Untuk sampai baris kelima, berapa kali kamu perlu menambah?'}
];
export const missions = [
 {title:'Taman Informasi',icon:'♧',x:15,y:70,q:'Kursi per baris: 4, 7, 10. Pertambahannya tetap. Apa yang diketahui dan ditanyakan jika mencari baris ke-5? Tuliskan dugaan jumlahnya.',key:'16',hint:'Pisahkan data tiga baris awal dari baris yang ingin dicari. Perubahannya +3.',guide:'Diketahui 4, 7, 10 dan pertambahan tetap; dicari baris 5. Lanjutan 13, 16.'},
 {title:'Jembatan Selisih',icon:'▥',x:34,y:47,q:'Pilih dua papan jembatan berikutnya: 12, 17, 22, …, …. Apa perubahan antarbilangannya?',key:'27,32',hint:'Bandingkan 17 − 12 dengan 22 − 17.',guide:'Keduanya +5. Dua bilangan selanjutnya 27 dan 32.'},
 {title:'Gua Aturan',icon:'◇',x:55,y:70,q:'Buka peti: 48, 42, 36. Apa aturannya? Tentukan bilangan posisi kelima dan buktikan aturanmu.',key:'24',hint:'Jumlah berkurang sama pada setiap perpindahan.',guide:'Kurang 6: 48, 42, 36, 30, 24.'},
 {title:'Bengkel Langkah',icon:'⚙',x:70,y:34,q:'Susun langkah mencari posisi keenam dari 3, 7, 11. Tuliskan hasil dan periksa banyak penambahannya.',key:'23',hint:'Mulai pada posisi 1. Butuh lima perpindahan untuk sampai posisi 6.',guide:'Mulai 3, tambah 4 sebanyak lima kali: 3, 7, 11, 15, 19, 23.'},
 {title:'Mercusuar Kesimpulan',icon:'⚑',x:88,y:69,q:'Pilih salah satu misi tadi. Tulis kembali hasilnya dan kesimpulan yang menjawab masalah dengan alasanmu.',key:null,hint:'Sebutkan yang dicari, hasilnya, dan aturan yang mendukungnya.',guide:'Kesimpulanmu tersimpan untuk ditinjau guru.'}
];
