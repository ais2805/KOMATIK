import {liveStore} from '../../server/api.mjs';
import {sessionAccess,isUUID,fail} from '../../server/classroom.mjs';
import {evaluationPDF} from '../../server/report.mjs';
export default async function handler(req,context){
 try{
  if(req.method!=='POST')fail(405,'Gunakan POST.');
  if(req.headers.get('origin')&&req.headers.get('origin')!==new URL(req.url).origin)fail(403,'Asal permintaan tidak sesuai.');
  const raw=await req.text();if(raw.length>2000)fail(413,'Permintaan terlalu besar.');
  const p=JSON.parse(raw);if(!isUUID(p.id))fail(400,'Nomor laporan tidak valid.');
  const store=liveStore(context);
  await sessionAccess(store,p.sessionId,req.headers.get('authorization')?.replace(/^Bearer /,''),null,false);
  const entry=await store.get('responses/'+p.id+'.json',{type:'json',consistency:'strong'});
  if(!entry||entry.payload.sessionId!==p.sessionId)fail(404,'Laporan belum tersedia untuk sesi ini.');
  return new Response(await evaluationPDF(entry.payload),{headers:{'Content-Type':'application/pdf','Cache-Control':'no-store','Content-Disposition':`attachment; filename="KOMATIK-${p.id}.pdf"`}});
 }catch(e){return Response.json({message:e.status?e.message:'PDF belum dapat diunduh. Simpan cadangan JSON atau coba kembali.'},{status:e.status||503});}
}
export const config={rateLimit:{action:'rate_limit',aggregateBy:'ip',windowSize:60,windowLimit:60}};
