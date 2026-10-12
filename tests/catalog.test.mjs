import { test } from 'node:test';
import assert from 'node:assert/strict';
import { publicProducts,catalog } from '../worker/catalog.js';
const p={id:'live',name:'Recurso',published:true,price:0,short_url:'https://sirtraver.gumroad.com/l/demo',thumbnail_url:'https://public-files.gumroad.com/cover',custom_summary:'Ficha',file_info:{private:'secret'}};
test('Only published products and the explicitly approved demo are exposed',()=>{
 const data=publicProducts([p,{...p,id:'draft',published:false},{...p,id:'demo',published:false},{...p,id:'deleted',deleted:true},{...p,id:'foreign',short_url:'https://other.gumroad.com/l/x'}],'demo');
 assert.deepEqual(data.map(x=>x.id),['live','demo']);assert.equal(data[1].published,false);assert.equal(data[1].demo,true);assert.ok(!JSON.stringify(data).includes('secret'));assert.equal(data[0].price,'Gratis · 0 €');
});
test('Authenticated read returns an allowlisted public response',async()=>{
 let options;const response=await catalog(new Request('https://sirtraver.com/api/catalogo-gumroad'),{GUMROAD_ACCESS_TOKEN:'test-token'}, {}, async(url,opts)=>{options=opts;assert.equal(url,'https://api.gumroad.com/v2/products');return Response.json({success:true,products:[p]});});
 assert.equal(options.headers.Authorization,'Bearer test-token');assert.equal(response.status,200);const body=await response.json();assert.equal(body.products.length,1);assert.ok(!JSON.stringify(body).includes('test-token'));assert.ok(!JSON.stringify(body).includes('file_info'));
});
test('Upstream failure does not disclose secrets or claim an empty successful catalog',async()=>{
 const response=await catalog(new Request('https://sirtraver.com/api/catalogo-gumroad'),{GUMROAD_ACCESS_TOKEN:'failure-token'},{},async()=>{throw Error('failure-token')});assert.equal(response.status,503);assert.deepEqual(await response.json(),{status:'unavailable',products:[]});
});

test('Works where the default platform cache is forbidden',async()=>{const old=globalThis.caches;globalThis.caches={get default(){throw Error('Forbidden')}};try{const r=await catalog(new Request('https://sirtraver.com/api/catalogo-gumroad'),{GUMROAD_ACCESS_TOKEN:'cache-compat-test'},{},async()=>Response.json({success:true,products:[p]}));assert.equal(r.status,200);}finally{globalThis.caches=old}});
