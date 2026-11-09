/* Identitas dan progres privat. Token tidak disimpan di localStorage. */
(function(){
 const S=K.store;let timer,dirty=false,flight=null,blocked=false,role=null,rev=null,id=null;
 const draftKey=()=>`komatik:v2:draft:${id}`;
 K.api=async function(action,body={}){let r;try{r=await fetch('/.netlify/functions/api',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({action,...body})});}catch{throw new Error('Belum terhubung ke internet. Jawaban masih tersimpan di tab ini.');}let j;try{j=await r.json();}catch{throw new Error('Server KOMATIK belum aktif. Gunakan deploy GitHub di Netlify sesuai panduan.');}if(!r.ok)throw Object.assign(new Error(j.error||'Permintaan gagal.'),{status:r.status});return j;};
 function status(t,bad=false){const el=document.querySelector('#syncStatus');if(el){el.textContent=t;el.classList.toggle('sync-bad',bad);}}
 function cache(){if(S.data&&id)try{sessionStorage.setItem(draftKey(),JSON.stringify({rev,data:S.data,dirty}));}catch{status('Penyimpanan perangkat penuh. Segera tekan Simpan progres.',true);}}
 function adopt(r){role=r.role;id=r.id;rev=r.rev;blocked=false;dirty=false;S.data=r.data||null;if(S.data){try{const local=JSON.parse(sessionStorage.getItem(draftKey())||'null');if(local?.dirty&&local.rev===rev){S.data=local.data;dirty=true;}else if(local?.dirty){K.toast('Ada draf lama di tab ini. Progres server yang lebih baru dimuat; draf lama tetap tersimpan sampai kamu menyimpan lagi.');}}catch{}status(dirty?'Draf lokal menunggu dikirim':'Progres tersimpan di server');}}
 async function flush(){clearTimeout(timer);if(blocked)throw new Error("Muat data server dahulu karena progres berubah di perangkat lain.");if(flight){await flight;if(dirty&&!blocked)return flush();return;}if(!S.data||role!=='student'||!dirty||blocked)return;
  flight=(async()=>{while(dirty&&!blocked){const snapshot=JSON.parse(JSON.stringify(S.data)),oldRev=rev;dirty=false;status('Menyimpan progres…');try{const r=await K.api('save',{rev:oldRev,data:snapshot});rev=r.rev;if(r.evaluasi?.dikumpulkan)S.data.evaluasi=r.evaluasi;cache();status('✓ Progres tersimpan di server');}catch(e){dirty=true;cache();status(e.message,true);if(e.status===409){blocked=true;K.modal({title:'Progres berubah di perangkat lain',body:'<p>Draf di tab ini tidak menimpa progres terbaru. Unduh cadangannya jika diperlukan, lalu muat data server. Gunakan satu perangkat pada satu waktu.</p>',actions:[{label:'Unduh draf',keepOpen:true,onClick:()=>K.download('KOMATIK_draf_cadangan.json',JSON.stringify(S.data,null,2))},{label:'Muat data server',primary:true,onClick:async()=>{try{sessionStorage.removeItem(draftKey());await S.resume();location.hash='#/beranda';K.refresh();}catch(err){K.toast(K.esc(err.message));}}}]});}throw e;}}})().finally(()=>flight=null);return flight;
 }
 S.save=function(){if(!S.data||role!=='student')return;dirty=true;cache();status('Draf tersimpan di tab ini • menunggu sinkronisasi');clearTimeout(timer);timer=setTimeout(()=>flush().catch(()=>{}),700);};
 S.resume=async function(){try{const r=await K.api('session');adopt(r);if(dirty)S.save();return S.data;}catch(e){S.data=null;role=null;if(e.status!==401)K.toast(K.esc(e.message));return null;}};
 S.login=async function(kode,kelas,nama,token){const r=await K.api('student-login',{kode,kelas,nama,token});adopt(r);return S.data;};
 S.logout=async function(){await flush();await K.api('logout');if(id)sessionStorage.removeItem(draftKey());S.data=null;role=null;id=null;rev=null;dirty=false;};
 S.profiles=()=>[];S.teacherOk=()=>role==='teacher';S.setTeacherOk=()=>{};
 K.cloud={flush,isDirty:()=>dirty,role:()=>role,teacherLogin:async password=>{await flush();const r=await K.api('teacher-login',{password});adopt(r);},afterRoute(){if(role==='student'&&S.data){const h=location.hash;if(!['#/masuk','#/mode','#/guru'].includes(h)){S.data.terakhir=h;S.save();}}},status};
 window.addEventListener('online',()=>flush().catch(()=>{}));
 window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)flush().catch(()=>{});});
})();
