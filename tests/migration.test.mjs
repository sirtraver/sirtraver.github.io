import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';
const source=await fs.readFile('dist/server/index.js','utf8');const {default:worker}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
test('All retained pages and portfolio images are served by the migrated worker',async()=>{
 for(const p of ['/','/resources/','/portfolio/','/about/','/assets/site.js','/assets/site.css','/assets/portfolio/sirtraver.webp','/assets/portfolio/greens.webp','/assets/portfolio/more.webp','/assets/portfolio/wobble.webp','/assets/portfolio/type-in-motion.webp','/assets/portfolio/gigantes.webp']){const r=await worker.fetch(new Request('https://sirtraver.com'+p),{},{});assert.equal(r.status,200,p);assert.ok((await r.arrayBuffer()).byteLength>0,p);}
 const r=await worker.fetch(new Request('https://sirtraver.com/portfolio'),{},{});assert.equal(r.status,301);assert.equal(r.headers.get('Location'),'https://sirtraver.com/portfolio/');
});

test('Old Spanish URLs redirect to their English replacements',async()=>{for(const [old,next] of [['/recursos/','/resources/'],['/recursos/brief-claro/','/resources/'],['/sobre-mi/','/about/']]){const r=await worker.fetch(new Request('https://sirtraver.com'+old),{},{});assert.equal(r.status,301);assert.equal(r.headers.get('Location'),'https://sirtraver.com'+next)}});
