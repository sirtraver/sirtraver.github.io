import { catalog } from './catalog.js';
import { assets } from './assets.js';
export default {
 async fetch(request,env,ctx){
  const u=new URL(request.url);
  if(u.pathname==='/api/catalogo-gumroad')return catalog(request,env,ctx);
  if(!['GET','HEAD'].includes(request.method))return new Response(null,{status:405,headers:{Allow:'GET, HEAD'}});
  let path;try{path=decodeURIComponent(u.pathname)}catch{return new Response('Not found',{status:404})}
  if(path.includes('..'))return new Response('Not found',{status:404});
  if(!path.endsWith('/')&&assets[path+'/index.html'])return Response.redirect(new URL(path+'/',u).href,308);
  if(path.endsWith('/'))path+='index.html';
  const item=assets[path];if(!item)return new Response('No se ha encontrado esta página.',{status:404,headers:{'Content-Type':'text/plain; charset=utf-8'}});
  const [type,b64]=item;const raw=atob(b64);const bytes=Uint8Array.from(raw,c=>c.charCodeAt(0));
  return new Response(request.method==='HEAD'?null:bytes,{headers:{'Content-Type':type,'Cache-Control':type.startsWith('text/html')?'no-cache':'public, max-age=300','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin'}});
 }
};
