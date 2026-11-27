import test from 'node:test';
import assert from 'node:assert/strict';
import {validActivityOrder,validQuizOrder,activityHint,rememberHint} from '../public/learning.js';
import {objective} from '../server/v5/api.mjs';
import {activityHistoryHTML} from '../public/activity-history.js';

function permutations(values){return values.length?values.flatMap((v,i)=>permutations(values.filter((_,j)=>i!==j)).map(p=>[v,...p])):[[]]}
test('equivalent algorithms are accepted but premature calculations and conclusions are rejected',()=>{
  const activities=permutations([0,1,2,3,4]).filter(validActivityOrder);
  assert.deepEqual(activities,[[1,4,3,0,2],[4,1,3,0,2]]);
  for(const order of activities)assert.equal(objective('a4',{order}),true);
  assert.equal(objective('a4',{order:[4,3,1,0,2]}),false);
  assert.equal(objective('a4',{order:[4,1,3,2,0]}),false);
  assert.deepEqual(permutations([0,1,2,3]).filter(validQuizOrder),[[1,2,3,0],[2,1,3,0],[2,3,1,0]]);
  for(const order of [null,[],[1,1,3,0],[2,3,1,'0'],[2,3,1,0,4],[2,3,1,-1]])assert.equal(validQuizOrder(order),false);
});
test('help follows the active step and records early as well as later use',()=>{
  const draft={},record={hints:[]};
  for(const stage of ['a1','a2','a3','a4'])for(let step=0;step<({a1:3,a2:4,a3:4,a4:3}[stage]);step++)assert.notEqual(activityHint(stage,step,1),activityHint(stage,step,2));
  const first=rememberHint(draft,null,'a2',3,'2026-11-27T01:00:00Z');
  assert.match(first.text,/pita/);assert.doesNotMatch(first.text,/pot|tambahan/);
  assert.equal(first.step,4);assert.equal(first.level,1);
  const second=rememberHint(draft,record,'a2',3,'2026-11-27T01:01:00Z');
  assert.match(second.text,/35 − 30 dan 30 − 25/);assert.equal(second.level,2);
  assert.equal(draft.helpLog.length,2);assert.equal(record.hints[0].text,second.text);
  const next=rememberHint(draft,record,'a2',0);assert.equal(next.level,1);assert.match(next.text,/pot/);
});
test('teacher history presents originals, every revision and contextual help without executing student text',()=>{
  const html=activityHistoryHTML({a1:{initial:{at:'2026-11-27T01:00:00Z',data:{guess:'20',reason:'<script>alert(1)</script>'}},revisions:[{data:{guess:'21',reason:'Perbaikan pertama'}},{data:{guess:'22',reason:'Perbaikan kedua'}}],hints:[{step:3,level:1,text:'Gunakan data tiga baris awal.',at:'2026-11-27T01:01:00Z'},{type:'prompt'}]}});
  for(const text of ['Pertanyaan','Jawaban awal','Perbaikan terbaru','Perbaikan pertama','Perbaikan kedua','Langkah 3','Gunakan data tiga baris awal.','Langkah tidak tercatat','&lt;script&gt;'])assert.ok(html.includes(text),text);
  assert.doesNotMatch(html,/<script>|<pre|"initial":/);
  assert.match(activityHistoryHTML({}),/Belum ada jawaban aktivitas/);
});
