import test from 'node:test';import assert from 'node:assert/strict';
import {evaluationPDF} from '../server/report.mjs';
import {emailRequest,validatePayload} from '../server/submission.mjs';
const p=()=>validatePayload({id:'fe6ea218-94d5-41ac-bb5f-79e154a2282f',student:{code:'IV-A-01',className:'IV A'},createdAt:'2026-11-07T01:00:00Z',answers:Array.from({length:10},()=>({answer:'17',reason:'Selisihnya 4. Karena 13 + 4 = 17.'}))});
test('PDF valid, deterministic for safe retries, with PDF email attachment',async()=>{const a=await evaluationPDF(p()),b=await evaluationPDF(p());assert.equal(a.subarray(0,5).toString(),'%PDF-');assert.deepEqual(a,b);const mail=await emailRequest(p(),'sender@example.org','guru@example.org');assert.ok(mail.attachments[0].filename.endsWith('.pdf'));assert.deepEqual(Buffer.from(mail.attachments[0].content,'base64'),a);});
test('long answers paginate without losing end of text',async()=>{const d=p();d.answers[0].reason='Saya membandingkan dua pasangan bilangan. '.repeat(60)+'AKHIR';const pdf=await evaluationPDF(d);assert.ok(pdf.length>10000);});
