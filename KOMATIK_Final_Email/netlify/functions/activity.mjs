// Legacy storage is preserved; use the authenticated V5 API.
export default async()=>new Response(JSON.stringify({error:'Gunakan login KOMATIK V5. Data lama tersedia melalui arsip guru.'}),{status:410,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
