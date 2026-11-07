import {liveStore} from '../../server/api.mjs';
import {sessionAccess} from '../../server/classroom.mjs';
import {processSubmission} from '../../server/submission.mjs';
const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const reply=(status,body)=>new Response(JSON.stringify(body),{status,headers});
export default async function handler(req,context){
 if(req.method!=='POST')return reply(405,{message:'Gunakan POST.'});
 const origin=req.headers.get('origin');if(origin&&origin!==new URL(req.url).origin)return reply(403,{message:'Asal permintaan tidak diizinkan.'});
 if(!req.headers.get('content-type')?.includes('application/json'))return reply(415,{message:'Gunakan JSON.'});
 let raw;try{raw=await req.text();}catch{return reply(400,{message:'Badan permintaan tidak dapat dibaca.'});}
 if(Buffer.byteLength(raw)>350000)return reply(413,{message:'Laporan terlalu besar. Unduh salinan untuk guru.'});
 let data;try{data=JSON.parse(raw);}catch{return reply(400,{message:'JSON tidak valid.'});}
 const env=k=>globalThis.Netlify?.env?.get(k)||process.env[k];
 try{
  // Immutable answer files; no publicly exposed read endpoint.
  const store=liveStore(context);
  if(data.version==='1.2.0' || data.sessionId){
    await sessionAccess(store,data.sessionId,req.headers.get('authorization')?.replace(/^Bearer /,''),data.student,true);
  }
  const result=await processSubmission(data,{store,env,send:fetch});return reply(result.status,result.body);
 }catch(e){if(e.status)return reply(e.status,{message:e.message});if(/valid|Diperlukan|terlalu panjang/.test(e.message))return reply(400,{message:e.message});console.error('KOMATIK storage error',context.requestId);return reply(503,{message:'Server belum dapat menyimpan. Salinan di perangkat tetap ada; unduh atau coba lagi.'});}
}
export const config={rateLimit:{action:'rate_limit',aggregateBy:'ip',windowSize:60,windowLimit:120}};
