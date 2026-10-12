import { catalog } from './catalog.js';
import { assets } from './assets.js';
import { renderResources,resourceSchema } from './render.js';
const redirects={'/recursos':'/resources/','/recursos/':'/resources/','/recursos/brief-claro':'/resources/','/recursos/brief-claro/':'/resources/','/sobre-mi':'/about/','/sobre-mi/':'/about/'};
export default {
 async fetch(request,env,ctx){
  const u=new URL(request.url);
  if(!['GET','HEAD'].includes(request.method))return new Response(null,{status:405,headers:{Allow:'GET, HEAD'}});
  if(u.hostname==='sirtraver.sirtraver.chatgpt.site'||u.hostname==='www.sirtraver.com'){u.hostname='sirtraver.com';return Response.redirect(u.href,301);}
  if(u.pathname==='/api/catalogo-gumroad'){const r=await catalog(request,env,ctx);r.headers.set('X-Robots-Tag','noindex');return r;}
  let path;try{path=decodeURIComponent(u.pathname)}catch{return new Response('Not found',{status:404,headers:{'X-Robots-Tag':'noindex'}})}
  if(redirects[path])return Response.redirect(new URL(redirects[path],u).href,301);
  if(path.includes('..'))return new Response('Not found',{status:404,headers:{'X-Robots-Tag':'noindex'}});
  if(!path.endsWith('/')&&assets[path+'/index.html'])return Response.redirect(new URL(path+'/',u).href,301);
  if(path.endsWith('/'))path+='index.html';
  const item=assets[path];if(!item)return new Response('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page not found | SIRTRAVER</title><meta name="robots" content="noindex"><link rel="stylesheet" href="/assets/site.css"></head><body><main class="not-found"><h1>404</h1><p>This page could not be found.</p><a href="/">Back to SIRTRAVER</a></main></body></html>',{status:404,headers:{'Content-Type':'text/html; charset=utf-8','X-Robots-Tag':'noindex'}});
  const [type,b64]=item;const bytes=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));let body=bytes;
  if(path==='/resources/index.html'||path==='/es/resources/index.html'){
   const language=path.startsWith('/es/')?'es':'en';
   const response=await catalog(new Request(request.url,{method:'GET'}),env,ctx);const data=await response.json();
   const html=new TextDecoder().decode(bytes);const content=data.status==='ok'?renderResources(data.products,language):'<p class="catalog-status">The catalog is temporarily unavailable. Please try again shortly.</p>';
   body=html.replace(/<!--resources-->.*?<!--\/resources-->/s,content);
   if(data.status==='ok')body=body.replace('</head>','<script type="application/ld+json">'+resourceSchema(data.products)+'</script></head>');
  }
  return new Response(request.method==='HEAD'?null:body,{headers:{'Content-Type':type,'Cache-Control':type.startsWith('text/html')?'no-cache':'public, max-age=300','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin'}});
 }
};
