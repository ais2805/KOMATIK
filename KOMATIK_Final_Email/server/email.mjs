import PDFDocument from 'pdfkit';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
const questions=JSON.parse(readFileSync(resolve(process.cwd(),'server/evaluation.json'),'utf8'));
export async function reportPDF(data){
 return new Promise((done,reject)=>{const doc=new PDFDocument({size:'A4',margin:48,bufferPages:true}),chunks=[];doc.on('data',b=>chunks.push(b));doc.on('end',()=>done(Buffer.concat(chunks)));doc.on('error',reject);doc.registerFont('Body',resolve(process.cwd(),'server/fonts/DejaVuSans.ttf')).font('Body');
 doc.fontSize(16).text('Laporan Evaluasi KOMATIK');doc.moveDown();doc.fontSize(11).text('Nama: '+data.profil.nama).text('Kelas: '+data.profil.kelas+'    Kode: '+data.profil.kode).text('Dikumpulkan: '+new Date(data.evaluasi.waktuKumpul).toLocaleString('id-ID',{timeZone:'Asia/Jakarta'})+' WIB');doc.moveDown();doc.text('Penilaian manual oleh guru. Skor 0–4 per soal; maksimum 40. Poin aktivitas dan kuis tidak memengaruhi nilai evaluasi.');
 for(const q of questions){if(doc.y>620)doc.addPage();const a=data.evaluasi.jawabanKumpul[q.no]||{};doc.moveDown();doc.fontSize(12).text(q.no+'. '+q.soal);doc.moveDown(.3);doc.fontSize(11).text('Jawaban: '+(a.jawaban||'(kosong)'),{lineGap:2}).text('Alasan / langkah: '+(a.alasan||'(kosong)'),{lineGap:2});if(doc.y>710)doc.addPage();doc.moveDown(.5);doc.text('Skor: ____ / 4     Catatan guru: __________________________');}
 if(doc.y>650)doc.addPage();doc.moveDown();doc.text('Total: ____ / 40     Nilai = (total / 40) × 100 = ____');doc.moveDown();doc.text('Penilai: ___________________     Tanggal: ___________________');doc.end();});
}
export async function sendReport(data,key,env){
 if(!env.RESEND_API_KEY||!env.TEACHER_EMAIL||!env.MAIL_FROM)return{sent:false,message:'Email belum dikonfigurasi. Jawaban sudah tersedia di Ruang Guru dan bisa dicetak. Guru perlu mengisi RESEND_API_KEY, TEACHER_EMAIL, dan MAIL_FROM.'};
 const pdf=await reportPDF(data);
 const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':createHash('sha256').update(key).digest('hex')},body:JSON.stringify({from:env.MAIL_FROM,to:[env.TEACHER_EMAIL],subject:`Evaluasi KOMATIK — ${data.profil.kelas} — ${data.profil.nama}`,text:`Laporan jawaban ${data.profil.nama} (${data.profil.kode}) terlampir. Silakan cetak dan nilai menggunakan rubrik evaluasi KOMATIK.`,attachments:[{filename:'Evaluasi_KOMATIK.pdf',content:pdf.toString('base64')}]})});
 if(!r.ok){const e=new Error('Jawaban tetap tersimpan. Pengiriman email belum berhasil; guru perlu memeriksa pengaturan Resend dan alamat penerima.');e.status=502;throw e;}
 const result=await r.json();return{sent:true,id:result.id,waktu:new Date().toISOString()};
}
