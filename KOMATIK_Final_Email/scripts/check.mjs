import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
for(const dir of ['public/js','server','netlify/functions'])for(const f of readdirSync(dir))if(/\.(mjs|js)$/.test(f))execFileSync(process.execPath,['--check',dir+'/'+f],{stdio:'inherit'});
for(const m of readFileSync('public/index.html','utf8').matchAll(/(?:src|href)="([^"#]+)"/g)){if(!m[1].startsWith('http')&&!existsSync('public/'+m[1]))throw Error('Missing '+m[1]);}
console.log('KOMATIK: syntax and local assets verified.');
