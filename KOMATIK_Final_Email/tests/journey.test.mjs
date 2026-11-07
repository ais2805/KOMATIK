import test from 'node:test';
import assert from 'node:assert/strict';
import { unlocked } from '../public/core.js';
import { stages } from '../public/content.js';
import { journalData, bridgeMarkup, pairingMarkup } from '../public/journey.js';

test('a saved draft never unlocks the next activity until the previous activity is complete',()=>{
  for(const sequential of [true,false]){
    const s={done:['materi'],drafts:{a1:{page:2}},records:{a1:{initial:{data:{guess:20}}}}};
    for(let stage=1;stage<=4;stage++){
      assert.equal(unlocked('a'+stage,s,stages,sequential),true);
      for(let later=stage+1;later<=4;later++)assert.equal(unlocked('a'+later,s,stages,sequential),false);
      s.done.push('a'+stage);
    }
  }
});
test('journal keeps the first guess even after a revision, and updates the final conclusion',()=>{
  const record=data=>({initial:{data},revisions:[]});
  const r={a1:record({guess:'20',reason:'perkiraan awal'}),a4:record({conclusion:'22 pot',reflection:'aku memeriksa'})};
  r.a1.revisions.push({data:{guess:'22'}});r.a4.revisions.push({data:{conclusion:'22 pot pada baris kelima',reflection:'tambah 4'}});
  assert.equal(journalData(r).guess,'20');assert.equal(journalData(r).conclusion,'22 pot pada baris kelima');
});
test('both pair comparisons show four unmatched pots and bridge requires both correct values',()=>{
  for(const pairTab of [0,1])assert.equal((pairingMarkup({pairTab,paired:{0:true,1:true}}).match(/pot-cell leftover/g)||[]).length,4);
  assert.match(bridgeMarkup({row4:'18',row5:'22'}),/class="bridge-feedback built"/);
  assert.doesNotMatch(bridgeMarkup({row4:'18',row5:'20'}),/class="bridge-feedback built"/);
});
