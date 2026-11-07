import { getStore } from '@netlify/blobs';
import { storeName, teacherAllowed, teacherAction, sessionAccess, putCheckpoint, latestCheckpoints, fail } from './classroom.mjs';
export const env=k=>globalThis.Netlify?.env?.get(k)||process.env[k];
export const liveStore=context=>getStore({name:storeName(env,context),consistency:'strong'});
const reply=(n,b)=>Response.json(b,{status:n,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export function makeApi(kind, getStoreFor=liveStore, getEnv=env){
 return async(req,context)=>{
  try{
   if(req.method!=='POST')fail(405,'Gunakan POST.');
   if(req.headers.get('origin')&&req.headers.get('origin')!==new URL(req.url).origin)fail(403,'Asal permintaan tidak sesuai.');
   const token=req.headers.get('authorization')?.replace(/^Bearer /,'');
   if(kind==='teacher'&&!teacherAllowed(getEnv('TEACHER_ACCESS_KEY'),token))fail(403,'Akses guru belum aktif atau kunci keliru.');
   if(!req.headers.get('content-type')?.includes('application/json'))fail(415,'Gunakan JSON.');
   const raw=await req.text();if(Buffer.byteLength(raw)>350000)fail(413,'Catatan terlalu besar.');
   let p;try{p=JSON.parse(raw);}catch{fail(400,'Data tidak dapat dibaca.');}
   const store=getStoreFor(context);
   if(kind==='teacher')return reply(200,await teacherAction(store,p));
   if(p.action==='restore'){
     const student=await sessionAccess(store,p.sessionId,token,null,false);
     return reply(200,{student,activities:await latestCheckpoints(store,p.sessionId)});
   }
   return reply(200,await putCheckpoint(store,p,token));
  }catch(e){return reply(e.status||503,{message:e.status?e.message:'Server belum tersedia. Simpan salinan dan coba lagi.'});}
 };
}
