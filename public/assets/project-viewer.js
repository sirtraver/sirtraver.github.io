(()=>{
 const es=document.documentElement.lang==='es';let catalog,active,opener,oldOverflow;const dialog=document.createElement('dialog');dialog.className='project-viewer';dialog.setAttribute('aria-labelledby','viewer-title');
 dialog.innerHTML='<header class="viewer-bar"><div><span class="viewer-brand">sirtraver</span><h2 id="viewer-title"></h2></div><div><a class="viewer-original" target="_blank" rel="noopener noreferrer">'+(es?'Ver en Behance':'View on Behance')+' ↗</a><button class="viewer-close" aria-label="'+(es?'Cerrar proyecto':'Close project')+'">×</button></div></header><div class="viewer-scroll"><div class="viewer-images"></div><p class="viewer-error" hidden></p><a class="viewer-end" target="_blank" rel="noopener noreferrer">'+(es?'Descripción, comentarios y valoraciones en Behance':'Description, comments & appreciations on Behance')+' ↗</a></div>';
 document.body.append(dialog);const scroll=dialog.querySelector('.viewer-scroll'),images=dialog.querySelector('.viewer-images'),error=dialog.querySelector('.viewer-error');
 const close=()=>{if(dialog.open)dialog.close();};dialog.querySelector('button').addEventListener('click',close);dialog.addEventListener('click',e=>{if(e.target===dialog||e.target===scroll)close()});dialog.addEventListener('close',()=>{document.documentElement.style.overflow=oldOverflow;images.replaceChildren();active=null;opener?.focus({preventScroll:true})});
 document.addEventListener('click',async e=>{
 const card=e.target.closest('.project-card');if(!card||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
 const match=new URL(card.href).pathname.match(/^\/gallery\/(\d+)\//);if(!match)return;e.preventDefault();
 if(!catalog){try{const r=await fetch('/assets/viewer-projects.json',{cache:'no-store'});if(!r.ok)throw Error();catalog=await r.json()}catch{window.open(card.href,'_blank','noopener');return}}
 const project=catalog[match[1]];if(!project){window.open(card.href,'_blank','noopener');return}
 opener=card;active=project;error.hidden=true;dialog.querySelector('h2').textContent=project.title;
 for(const a of dialog.querySelectorAll('a'))a.href=project.url;
 let failed=0;images.replaceChildren(...project.media.map((m,i)=>{const u=new URL(m.src);if(u.protocol!=='https:'||u.hostname!=='mir-s3-cdn-cf.behance.net')return document.createElement('span');const img=document.createElement('img');img.src=u.href;img.referrerPolicy='no-referrer';img.alt=project.title+' · '+(i+1);img.loading=i?'lazy':'eager';img.decoding='async';img.addEventListener('error',()=>{failed++;error.hidden=false;error.textContent=es?'Alguna imagen no está disponible. Puedes ver el proyecto completo en Behance.':'An image is unavailable. You can view the full project on Behance.'});return img}));
 oldOverflow=document.documentElement.style.overflow;document.documentElement.style.overflow='hidden';dialog.showModal();scroll.scrollTop=0;dialog.querySelector('button').focus();
 });
})();
