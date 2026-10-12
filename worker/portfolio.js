import {assets} from './assets.js';
import {escape} from './render.js';
let portfolioMemo=null;
const assetJson=path=>JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(assets[path][1]),c=>c.charCodeAt(0))));
const portfolioFallback=()=>assetJson('/assets/portfolio.json').projects;
const behanceState=html=>{const match=html.match(/<script[^>]*id="beconfig-store_state"[^>]*>([\s\S]*?)<\/script>/);if(!match)throw Error('Unavailable public profile');return JSON.parse(match[1])};
export function publicBehanceProjects(html){
 const items=behanceState(html)?.profile?.activeSection?.work?.profileProjects;
 if(!Array.isArray(items))throw Error('Unavailable public projects');
 return items.filter(p=>p.privacyLevel==='PUBLIC'&&p.publishStatus==='PUBLISHED'&&!p.isPrivate&&p.owners?.some(o=>o.username==='javiertraver')).flatMap(p=>{
  if(!Number.isSafeInteger(p.id)||p.id<=0)return [];
  let url;try{url=new URL(p.url)}catch{return []}
  if(url.protocol!=='https:'||url.hostname!=='www.behance.net'||!url.pathname.startsWith('/gallery/'+p.id+'/'))return [];
  const cover=p.covers?.allAvailable?.find(c=>c.width===808&&c.type==='WEBP')||p.covers?.allAvailable?.[0];let image='';try{const u=new URL(cover?.url);if(u.protocol==='https:'&&u.hostname==='mir-s3-cdn-cf.behance.net')image=u.href}catch{}
  return [{id:p.id,title:String(p.name||'Project').slice(0,180),url:url.href,href:'/projects/'+p.id+'/',publishedOn:Number(p.publishedOn)||0,image,category:/identity|identidad/i.test(p.name)?'Visual identity':'Visual design'}];
 }).sort((a,b)=>b.publishedOn-a.publishedOn).slice(0,60);
}
export async function portfolio(env,ctx={},fetcher=fetch){
 if(portfolioMemo&&portfolioMemo.expires>Date.now())return portfolioMemo;
 let saved;try{const object=await env.BUCKET?.get('catalog/behance.json');saved=object?await object.json():null}catch{}
 if(saved&&Date.parse(saved.updatedAt)<Date.parse(assetJson('/assets/portfolio.json').importedAt))saved=null;
 if(saved?.projects?.length&&saved.expires>Date.now()){portfolioMemo=saved;return saved}
 const refresh=async()=>{
  const response=await fetcher('https://www.behance.net/javiertraver',{headers:{'User-Agent':'Mozilla/5.0',Accept:'text/html'},signal:AbortSignal.timeout(7000)});
  if(!response.ok)throw Error('Behance unavailable');const html=await response.text();if(html.length>2000000)throw Error('Profile too large');const projects=publicBehanceProjects(html);if(!projects.length)throw Error('Empty public profile');
  const local=new Map(portfolioFallback().map(p=>[p.id,p]));
  const result={projects:projects.map(p=>({...local.get(p.id),...p,image:local.get(p.id)?.image||p.image})),source:'behance',updatedAt:new Date().toISOString(),expires:Date.now()+3600000};
  await env.BUCKET?.put('catalog/behance.json',JSON.stringify(result),{httpMetadata:{contentType:'application/json'}});portfolioMemo=result;return result;
 };
 if(saved?.projects?.length&&ctx.waitUntil){ctx.waitUntil(refresh().catch(()=>{}));return saved}
 try{return await refresh()}catch{portfolioMemo={projects:portfolioFallback(),source:'last-confirmed-import',updatedAt:assetJson('/assets/portfolio.json').importedAt,expires:Date.now()+60000};return portfolioMemo}
}
export function projectTitle(project,es){return es?project.title.replace(/\s*[-–—]\s*Visual Identity/gi,' — Identidad visual').replace(/Brand Identity/gi,'Identidad de marca').replace(/^Type in motion$/,'Tipografía en movimiento'):project.title}
export function renderPortfolio(projects,es){return '<section class="project-grid" aria-label="'+(es?'Proyectos de diseño':'Design projects')+'">'+projects.map(p=>'<a class="project-card" href="'+(es?'/es':'')+p.href+'"><img src="'+escape(p.image)+'" alt="'+escape(projectTitle(p,es))+'" width="808" height="632" loading="lazy"><div class="card-caption"><h3>'+escape(projectTitle(p,es))+'</h3><span aria-hidden="true">→</span></div><p>'+(es?(p.category==='Visual identity'?'Identidad visual':'Diseño visual'):p.category)+'</p></a>').join('')+'</section>'}
export async function projectMedia(project,env){
 if(project.media?.length)return project.media;
 const key='catalog/project-'+project.id+'.json';try{const stored=await env.BUCKET?.get(key);if(stored)return await stored.json()}catch{}
 try{
  const response=await fetch(project.url,{headers:{'User-Agent':'Mozilla/5.0'},signal:AbortSignal.timeout(7000)});if(!response.ok)throw Error();const source=await response.text();if(source.length>3000000)throw Error();const state=behanceState(source);const urls=new Set();
  const walk=(x,depth=0)=>{if(depth>20)return;if(typeof x==='string'){try{const u=new URL(x);if(u.protocol==='https:'&&u.hostname==='mir-s3-cdn-cf.behance.net'&&u.pathname.includes('/project_modules/'))urls.add(u.href)}catch{}}else if(Array.isArray(x))x.forEach(v=>walk(v,depth+1));else if(x&&typeof x==='object')Object.values(x).forEach(v=>walk(v,depth+1))};walk(state.project||state);
  const media=[...urls].slice(0,80).map(src=>({src}));if(media.length){await env.BUCKET?.put(key,JSON.stringify(media));return media}
 }catch{}
 return [{src:project.image,width:808,height:632}];
}
export function renderProject(project,media,es){
 const narrative=assetJson('/assets/cases.json')[String(project.id)]?.[es?'es':'en'];const labels=es?['Reto','Concepto','Proceso','Solución','Resultado']:['Challenge','Concept','Process','Solution','Result'];
 const image=(m,i)=>'<img src="'+escape(m.src)+'" alt="'+escape(projectTitle(project,es))+' · '+(es?'pieza':'visual')+' '+(i+1)+'" '+(m.width?'width="'+m.width+'" height="'+m.height+'"':'')+' loading="'+(i?'lazy':'eager')+'">';
 const gallery='<div class="project-gallery">'+media.slice(narrative?1:0).map((m,i)=>image(m,i+(narrative?1:0))).join('')+'</div>';
 const story=narrative?'<section class="case-story">'+narrative.map((text,i)=>'<section id="case-'+i+'"><span>0'+(i+1)+'</span><div><h2>'+labels[i]+'</h2><p>'+escape(text)+'</p></div></section>').join('')+'</section>':'';
 const hero=narrative&&media[0]?'<div class="case-hero">'+image(media[0],0)+'</div>':'';
 return '<a class="back-link" href="'+(es?'/es/':'/')+'">← '+(es?'Volver a proyectos':'Back to projects')+'</a><header class="project-heading"><p class="overline">'+(es?(project.category==='Visual identity'?'IDENTIDAD VISUAL':'DISEÑO VISUAL'):project.category.toUpperCase())+'</p><h1>'+escape(projectTitle(project,es))+'</h1><p>Javier Traver · '+new Date(project.publishedOn*1000).getUTCFullYear()+'</p></header>'+hero+(narrative?'<nav class="case-nav" aria-label="'+(es?'Secciones del proyecto':'Project sections')+'">'+labels.map((label,i)=>'<a href="#case-'+i+'">'+label+'</a>').join('')+'</nav>':'')+story+gallery;
}
