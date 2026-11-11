import './check.mjs';
import {rmSync,mkdirSync,copyFileSync,cpSync,existsSync,writeFileSync} from 'node:fs';
// Explicit publication list: obsolete uploads cannot expose old assessment keys.
rmSync('dist',{recursive:true,force:true});mkdirSync('dist');
for(const f of ['index.html','app.js','content.js','config.js','core.js','journey.js','style.css','v5-client.js','v5-media.js','v5.css'])copyFileSync('public/'+f,'dist/'+f);
for(const dir of ['assets','fonts'])if(existsSync('public/'+dir))cpSync('public/'+dir,'dist/'+dir,{recursive:true});
console.log('Clean dist created; server rubrics, legacy JS and test routes excluded.');

const production=process.env.CONTEXT==='production';
const suffix=(process.env.REVIEW_ID||process.env.BRANCH||'local').replace(/[^a-zA-Z0-9-]/g,'-').slice(0,60);
writeFileSync('server/v5/deployment.mjs',`export const production = ${production};\nexport const storeName = ${JSON.stringify(production?'komatik-v5':'komatik-v5-preview-'+suffix)};\n`);
