import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const cssVersion=createHash('sha256').update(await fs.readFile('public/assets/site.css')).digest('hex').slice(0,12);
const types={'.ico':'image/x-icon','.jpg':'image/jpeg','.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.txt':'text/plain; charset=utf-8','.xml':'application/xml; charset=utf-8'};
const assets={};async function walk(dir){for(const e of (await fs.readdir(dir,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){const p=path.join(dir,e.name);if(e.isDirectory())await walk(p);else{const route='/'+path.relative('public',p).split(path.sep).join('/');let payload=await fs.readFile(p);if(path.extname(p)==='.html')payload=Buffer.from(payload.toString().replaceAll('href="/assets/site.css"','href="/assets/site.css?v='+cssVersion+'"'));assets[route]=[types[path.extname(p)]||'application/octet-stream',payload.toString('base64')];}}}
await walk('public');await fs.writeFile('worker/assets.js','export const assets='+JSON.stringify(assets)+';\n');
let index=await fs.readFile('worker/index.js','utf8');index=index.replace(/^import .*;\n/gm,'');
const catalog=await fs.readFile('worker/catalog.js','utf8');const render=await fs.readFile('worker/render.js','utf8');
await fs.rm('dist',{recursive:true,force:true});await fs.mkdir('dist/server',{recursive:true});await fs.mkdir('dist/.openai',{recursive:true});
await fs.writeFile('dist/server/index.js',(await fs.readFile('worker/assets.js','utf8'))+catalog+render+index);await fs.copyFile('.openai/hosting.json','dist/.openai/hosting.json');console.log('Servidor y '+Object.keys(assets).length+' recursos preparados.');
