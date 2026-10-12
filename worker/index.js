import { catalog } from './catalog.js';
import { assets } from './assets.js';
import { renderResources,resourceSchema } from './render.js';
const redirects={'/portfolio':'/','/portfolio/':'/','/es/portfolio':'/es/','/es/portfolio/':'/es/','/recursos':'/resources/','/recursos/':'/resources/','/recursos/brief-claro':'/resources/','/recursos/brief-claro/':'/resources/','/sobre-mi':'/about/','/sobre-mi/':'/about/'};
export default {
 async fetch(request,env,ctx){
  const u=new URL(request.url);
  if(!['GET','HEAD'].includes(request.method))return new Response(null,{status:405,headers:{Allow:'GET, HEAD'}});
  if(u.hostname==='sirtraver.sirtraver.chatgpt.site'||u.hostname==='www.sirtraver.com'){u.hostname='sirtraver.com';return Response.redirect(u.href,301);}
  if(u.pathname==='/api/catalogo-gumroad'){const r=await catalog(request,env,ctx);r.headers.set('X-Robots-Tag','noindex');return r;}
  let path;try{path=decodeURIComponent(u.pathname)}catch{return new Response('Not found',{status:404,headers:{'X-Robots-Tag':'noindex'}})}
  if(path.endsWith('/index.html')){const destination=path.slice(0,-10);return Response.redirect(new URL(redirects[destination]||destination,u).href,301);}
  if(redirects[path])return Response.redirect(new URL(redirects[path],u).href,301);
  if(path.includes('..'))return new Response('Not found',{status:404,headers:{'X-Robots-Tag':'noindex'}});
  if(!path.endsWith('/')&&assets[path+'/index.html'])return Response.redirect(new URL(path+'/',u).href,301);
  if(path.endsWith('/'))path+='index.html';
  const item=assets[path];if(!item)return new Response('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page not found | SIRTRAVER</title><link id="sirtraver-favicon" rel="icon" type="image/png" sizes="32x32" href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAD2klEQVR4nO1WO0srWxRek2jeL/PQ+AiKIgRsBFHBgFpoJ4JYKwEbsRR/gq2FkEasRJsUPgq1EiJGFCWxULRRJIqKJEHjM+Y167IWTjieq0lujheb88FmmNlrz/5mre9bewRERPhByH5y878ECCXFpI1kIw2CIAjZ8b8SEEWRrzKZ7NPNMpnMl3N/TEAURX454e7uDq6vr+Hx8RHkcjmYzWZwOBygVqv/FfstBMT3FwYCAZienob9/X24v7+HdDrN80qlEux2O/T09MD4+DhUVlYWTgLzIJPJ8NXr9aLJZEKtVot2ux1tNhuazWa0WCzZe4VCgU6nE4+Ojj6szQUhVyOSvuL8/BxcLhfXWKFQwMPDA3+lzWaDZDIJl5eXkEqlwGg0QjgchubmZtjY2ACVSsXvyakJzIFUKsXXyclJVCqV6HA4sKKiAj0eD4bDYUyn0xiPx/Hg4AA7Ozs5Gw0NDZyl5eVlXksxuQC5JqXFbrcbDQYDGo1G7O/v/zAvxQSDQZTL5ajT6SijODo6+uEjvkJJISLUarWcfoPBACcnJ7C3twft7e3sgPcsQlNTE3g8Hi5baWkpOJ1OnpNiiipB+v3rlpaWWGC1tbVZ0Q0NDeHc3BweHx9jIpHAYgH5AkjJlMbBwUGUyWSsg+rqak61Wq1mTbS2tuLY2BiurKywJgpJfcEERFHkEYvFcHh4GPV6PW9stVqxpqaGyZAFNRoNj46ODtzZ2cmS/yMbSqD6S7X0+/2wuLgIu7u7EAqF4Onpia2q1+vZotSgqCOur69DS0tL3oYkFELgM5DvT09PIRgMwvb2Nvh8Pu4BJpMJotEodHV1werqKgs0Z0fEPHh7e8NQKMReX1tbw0gk8ml9r66usLe3l7tlVVUVl+bi4iJvKSCfA/x+f1b5xHd+fj5LjGKIzMvLCz9bWFhgt5BQaU0gEMhLQPZVZqS0NTY2gk6n43ZqsVhgZmYGEokEH0Cki5KSEtBoNBy7tbXFOqC603PSRV5gDkhZGBkZQZVKhXV1deyCvr4+3NzcxNvbW4xGo3h4eIgTExPcKckZVAaXy4XJZDLroqIPI0EQ4OzsDLq7u+H19ZVFFovFeN5qtXKm6J7mysrK2DGRSAS8Xi8MDAx8cFBRIsy818/n82F9fT3XmI5hakDUC2iUl5dzL6D+QGfG1NRU3toXlAEJkpdvbm5gdnaWLUd/RPF4nG1Gxy5lg3zvdruhra2t4B8SoRACv5KQQGl+fn5mAiRCEigdQp/FfgsBAoXSy7+qKdWbNFPo5oSiO+Hvv+W/Xv8LhGIJfBdkP7n5XwKUgX8AF+8r+UYnGxYAAAAASUVORK5CYII="><meta name="robots" content="noindex"><link rel="stylesheet" href="/assets/site.css"></head><body><main class="not-found"><h1>404</h1><p>This page could not be found.</p><a href="/">Back to SIRTRAVER</a></main></body></html>',{status:404,headers:{'Content-Type':'text/html; charset=utf-8','X-Robots-Tag':'noindex'}});
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
