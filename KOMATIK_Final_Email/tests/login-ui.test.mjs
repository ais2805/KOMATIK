import test from 'node:test';
import assert from 'node:assert/strict';

// Exercise the exported page renderer: valid server tests alone cannot detect
// a login page that still renders the old free-text fields.
globalThis.document = {addEventListener(){}};
globalThis.window = {addEventListener(){}};
const {loginHTML,teacherHTML,C,accessCardCanvas}=await import('../public/v5-client.js');

test('student login renders the attendance control and fixed identity fields',()=>{
  const html=loginHTML();
  assert.match(html,/<span>IV-A-<\/span>/);
  const input=name=>html.match(new RegExp('<input[^>]*name="'+name+'"[^>]*>'))?.[0]||'';
  assert.match(input('presensi'),/type="number" min="1" max="35" step="1" required/);
  assert.match(input('kelas'),/value="IV-A"[^>]*readonly/);
  assert.match(input('nama'),/readonly/);
  assert.match(html,/id="student-name-status"/);
  assert.match(input('token'),/type="password"/);
  assert.equal(input('kode'),'');
  assert.equal(typeof accessCardCanvas,'function','JPG card export must remain available');
});

test('teacher registration uses the same attendance format but accepts the student name',()=>{
  C.roster={students:[],settings:{activities:true,evaluation:true}};
  const html=teacherHTML().match(/<form id="v5-create"[\s\S]*?<\/form>/)?.[0]||'';
  assert.match(html,/<span>IV-A-<\/span>/);
  assert.match(html,/<input name="presensi" type="number" min="1" max="35"/);
  assert.match(html,/<input name="kelas"[^>]*value="IV-A"[^>]*readonly/);
  const name=html.match(/<input name="nama"[^>]*>/)?.[0]||'';
  assert.match(name,/required/);
  assert.doesNotMatch(name,/readonly/);
});

test('teacher password login remains separate',()=>{
  const html=loginHTML(true);
  assert.match(html,/name="password" type="password"/);
  assert.doesNotMatch(html,/name="presensi"/);
});

test('token visibility is optional and the submit button is unambiguous',()=>{
 const html=loginHTML();
 assert.match(html,/<button type="button"[^>]*data-v5="toggle-token"[^>]*aria-pressed="false"/);
 assert.match(html,/<button type="submit" class="btn">Masuk dan lanjutkan/);
 assert.match(html,/aria-label="Cara masuk"/);
 assert.match(html,/minlength="8" maxlength="8"/);
});
test('downloaded access card uses the official renamed address',()=>{
 const drawn=[];
 document.createElement=()=>({getContext:()=>({fillRect(){},strokeRect(){},measureText:()=>({width:100}),fillText(text){drawn.push(text)}})});
 const canvas=accessCardCanvas({nama:'Siswa Simulasi',kode:'IV-A-1',kelas:'IV-A'},'DEMO2345');
 assert.equal(canvas.width,1600);assert.equal(canvas.height,1000);
 assert.ok(drawn.includes('Masuk melalui: komatik.netlify.app'));
 assert.ok(!drawn.some(t=>t.includes('komatik-v4')));
});
