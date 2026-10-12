(()=>{
 const grid=document.getElementById('gumroad-products');if(!grid)return;let busy=false;const es=document.documentElement.lang==='es';
 function message(text){const p=document.createElement('p');p.className='catalog-status';p.textContent=text;grid.replaceChildren(p)}
 async function refresh(){if(busy||document.hidden)return;busy=true;try{
  const res=await fetch('/api/catalogo-gumroad',{headers:{Accept:'application/json'}});if(!res.ok)throw Error();const data=await res.json();if(data.status!=='ok'||!Array.isArray(data.products))throw Error();const cards=[];
  for(const p of data.products){const url=new URL(p.url);if(url.protocol!=='https:'||url.hostname!=='sirtraver.gumroad.com')continue;
   const card=document.createElement('article');card.className='project-card product-card';
   if(p.image){const img=document.createElement('img');img.src=p.image;img.alt=(es?'Portada de ':'Cover of ')+p.title;img.width=600;img.height=600;img.loading='lazy';card.append(img)}
   const caption=document.createElement('div');caption.className='card-caption';const h=document.createElement('h2');h.textContent=p.title;caption.append(h);card.append(caption);
   const summary=document.createElement('p');summary.className='product-summary';summary.textContent=p.summary;card.append(summary);
   const bottom=document.createElement('div');bottom.className='product-bottom';const price=document.createElement('span');price.textContent=es?p.price.replace('Free · €0','Gratis · 0 €'):p.price;bottom.append(price);
   if(p.published){const a=document.createElement('a');a.href=url.href;a.target='_blank';a.rel='noopener noreferrer';a.textContent=es?'Ver en Gumroad ↗':'View on Gumroad ↗';bottom.append(a)}else{const note=document.createElement('span');note.className='product-state';note.textContent=es?'Demo / En preparación':'Demo / Coming soon';bottom.append(note)}
   card.append(bottom);cards.push(card);
  }
  if(cards.length)grid.replaceChildren(...cards);else message(es?'Todavía no hay productos disponibles.':'No products available yet.');
 }catch{if(!grid.querySelector('.product-card'))message(es?'El catálogo no está disponible temporalmente. Inténtalo de nuevo en unos instantes.':'The catalog is temporarily unavailable. Please try again shortly.')}finally{busy=false}}
 refresh();setInterval(refresh,60000);document.addEventListener('visibilitychange',refresh);
})();
