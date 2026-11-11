import {readdirSync,readFileSync,existsSync,statSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
function walk(dir){for(const f of readdirSync(dir)){const p=dir+'/'+f;if(statSync(p).isDirectory())walk(p);else if(/\.(mjs|js)$/.test(p))execFileSync(process.execPath,['--check',p],{stdio:'inherit'})}}
for(const dir of ['public','server','netlify/functions'])walk(dir);
for(const m of readFileSync('public/index.html','utf8').matchAll(/(?:src|href)="([^"#]+)"/g))if(!m[1].startsWith('http')&&!existsSync('public/'+m[1]))throw Error('Missing '+m[1]);
console.log('KOMATIK V5 syntax and entry assets passed.');
