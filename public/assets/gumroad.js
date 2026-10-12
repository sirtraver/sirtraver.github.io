(()=>{
 const grid=document.getElementById('gumroad-products'),section=document.getElementById('gumroad-catalog');if(!grid||!section)return;
 let busy=false;
 async function refresh(){if(busy||document.hidden)return;busy=true;try{
  const res=await fetch('/api/catalogo-gumroad',{headers:{Accept:'application/json'}});if(!res.ok)throw Error();const data=await res.json();if(data.status!=='ok'||!Array.isArray(data.products))throw Error();
  const cards=[];for(const p of data.products){const url=new URL(p.url);if(url.protocol!=='https:'||url.hostname!=='sirtraver.gumroad.com')continue;
   const card=document.createElement('article');card.className='gumroad-card';
   if(p.image){const img=document.createElement('img');img.src=p.image;img.alt='Portada de '+p.title;img.width=600;img.height=600;img.loading='lazy';card.append(img);}
   const body=document.createElement('div');body.className='gumroad-card-body';
   const badge=document.createElement('span');badge.className='badge';badge.textContent=p.demo?(p.published?'Demo gratuita':'Demo · En preparación'):'Disponible en Gumroad';
   const h=document.createElement('h3');h.textContent=p.title;const summary=document.createElement('p');summary.textContent=p.summary;
   const bottom=document.createElement('div');bottom.className='resource-meta';const price=document.createElement('span');price.textContent=p.price;
   bottom.append(price);if(p.published){const a=document.createElement('a');a.className='button secondary';a.href=url.href;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Ver en Gumroad ↗';bottom.append(a);}else{const note=document.createElement('span');note.className='draft-note';note.textContent='Aún no disponible';bottom.append(note);}
   body.append(badge,h,summary,bottom);card.append(body);cards.push(card);
  }
  grid.replaceChildren(...cards);section.hidden=cards.length===0;
 }catch{if(!grid.children.length)section.hidden=true;}finally{busy=false}}
 refresh();setInterval(refresh,60000);document.addEventListener('visibilitychange',refresh);
})();
