import PDFDocument from 'pdfkit';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
const font=resolve(process.cwd(),'server/fonts/DejaVuSans.ttf');
export function evaluationPDF(p){
 return new Promise((resolve,reject)=>{
  const doc=new PDFDocument({size:'A4',margin:48,bufferPages:true,info:{Title:'Evaluasi KOMATIK '+p.student.code,Author:'KOMATIK',CreationDate:new Date(p.createdAt),ModDate:new Date(p.createdAt)}});
  doc._id=createHash('md5').update(p.id).digest();
  const chunks=[];doc.on('data',b=>chunks.push(b));doc.on('end',()=>resolve(Buffer.concat(chunks)));doc.on('error',reject);
  doc.registerFont('Body',font).font('Body');
  const width=499;
  const text=t=>String(t||'(kosong)').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'');
  const ensure=h=>{if(doc.y+h>760)doc.addPage();};
  doc.fontSize(17).text('KOMATIK | Laporan Evaluasi');doc.moveDown(.5);
  doc.fontSize(10).text('Nama siswa: '+text(p.student.code)+'    Kelas: '+text(p.student.className));
  doc.text('Waktu pengumpulan (WIB): '+new Date(p.createdAt).toLocaleString('id-ID',{timeZone:'Asia/Jakarta'}));
  doc.fontSize(8).text('Nomor pengumpulan: '+p.id);doc.moveDown();
  doc.fontSize(10).text('Jawaban awal siswa. Guru memberi skor 0–4 per soal menggunakan rubrik penelitian. Skor maksimum evaluasi website: 40.');doc.moveDown();
  p.answers.forEach((a,i)=>{
   doc.fontSize(11);ensure(105);
   doc.text(`${i+1}. ${a.indicator}`,{width});
   doc.fontSize(10).text(text(a.question),{width,lineGap:2});doc.moveDown(.4);
   doc.text('Jawaban: '+text(a.answer),{width,lineGap:2});
   doc.text('Alasan / langkah: '+text(a.reason),{width,lineGap:2});
   ensure(65);doc.moveDown(.5);
   doc.text('Skor: _____ / 4     Catatan guru:');
   doc.text('________________________________________________________________');doc.moveDown();
  });
  ensure(115);doc.text('Total skor: _____ / 40     Nilai: (total skor / 40) × 100 = _____');
  doc.moveDown();doc.text('Nama guru: _______________________    Tanggal: __________________');
  doc.moveDown();doc.text('Tanda tangan: _____________________');
  const range=doc.bufferedPageRange();
  for(let i=0;i<range.count;i++){doc.switchToPage(i);doc.page.margins.bottom=0;doc.fontSize(8).text(`KOMATIK • ${p.student.code} • ${i+1} / ${range.count}`,48,790,{width,align:'right',lineBreak:false});}
  doc.end();
 });
}
