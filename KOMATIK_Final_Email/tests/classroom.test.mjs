import test from 'node:test';
import assert from 'node:assert/strict';
import {makeApi} from '../server/api.mjs';
import {processSubmission} from '../server/submission.mjs';

const sid='12acacac-1111-4111-8111-123456789abc', token='a'.repeat(64);
const teacherKey='teacher-key-for-tests-only',student={code:'IV01',className:'IVA'};
function setup(){
 const m=new Map();
 const store={get:async k=>structuredClone(m.get(k))||null,
  setJSON:async(k,v,o={})=>{if(o.onlyIfNew&&m.has(k))return {modified:false};m.set(k,structuredClone(v));return {modified:true};},
  list:async({prefix})=>({blobs:[...m.keys()].filter(k=>k.startsWith(prefix)).map(key=>({key}))})};
 const call=async(kind,p,key)=>{const api=makeApi(kind,()=>store,k=>k==='TEACHER_ACCESS_KEY'?teacherKey:'');const r=await api(new Request('https://example.test/api',{method:'POST',headers:{'Content-Type':'application/json',authorization:'Bearer '+key},body:JSON.stringify(p)}),{});return [r.status,await r.json()];};
 return {m,store,call};
}
const record=(data={guess:20})=>({initial:{at:'2026-11-06T00:00:00Z',data},revisions:[],hints:[]});
const cp=(stage='a1',complete=false)=>({sessionId:sid,student,stage,complete,record:record()});
test('server receives first activity before evaluation, rejects wrong keys, restores original plus revision',async()=>{
 const {call}=setup();const p=cp();
 assert.equal((await call('activity',p,token))[0],200);
 assert.equal((await call('activity',p,token))[0],200);
 assert.equal((await call('activity',p,'c'.repeat(64)))[0],403);
 assert.equal((await call('activity',{action:'restore',sessionId:sid},'b'.repeat(64)))[0],403);
 assert.equal((await call('teacher',{action:'list'},'wrong'))[0],403);
 const copy=structuredClone(p);copy.record.initial.data.guess=22;
 assert.equal((await call('activity',copy,token))[0],409);
 p.complete=true;p.record.revisions.push({data:{guess:22}});
 assert.equal((await call('activity',p,token))[0],200);
 const [,res]=await call('activity',{action:'restore',sessionId:sid},token);
 assert.equal(res.activities[0].record.initial.data.guess,20);
 assert.equal(res.activities[0].record.revisions[0].data.guess,22);
 const [,rows]=await call('teacher',{action:'list'},teacherKey);
 assert.equal(rows.rows[0].activities.a1,'Selesai');assert.deepEqual(rows.rows[0].evaluations,[]);
});
test('completion of A2 requires evidence for decreasing pattern but does not demand a correct answer',async()=>{
 const {call}=setup(),p=cp('a2',true);
 assert.equal((await call('activity',p,token))[0],400);
 p.record.initial.data={down1:'3',down2:'5',down4:'20',down5:'15',downReason:'Aku masih ragu pada pasangan pertama.'};
 assert.equal((await call('activity',p,token))[0],200);
});
test('teacher saves grades separately from initial answers and class results aggregate two items per indicator',async()=>{
 const {call,store}=setup();await call('activity',cp(),token);
 const p={id:'52acacac-1111-4111-8111-123456789abc',sessionId:sid,version:'1.2.0',student,createdAt:'2026-11-06T00:00:00Z',answers:Array.from({length:10},()=>({answer:'17',reason:'Tambah 4.'})),learning:{}};
 await processSubmission(p,{store,env:()=>'',send:fetch});
 const grades=[4,2,4,4,null,null,1,1,0,0],notes=Array(10).fill('');
 assert.equal((await call('teacher',{action:'grade',id:p.id,grades,notes},'student'))[0],403);
 assert.equal((await call('teacher',{action:'grade',id:p.id,grades,notes},teacherKey))[0],200);
 const [,detail]=await call('teacher',{action:'report',id:p.id},teacherKey);
 assert.equal(detail.payload.answers[0].answer,'17');assert.deepEqual(detail.payload.grades,grades);
 const [,value]=await call('teacher',{action:'list'},teacherKey);
 assert.equal(value.rows.length,1);assert.deepEqual(value.rows[0].evaluations[0].indicators,[75,100,null,25,0]);
});
