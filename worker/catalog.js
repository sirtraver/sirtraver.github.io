const API='https://api.gumroad.com/v2/products';
let memo=null;
export function publicProducts(items,hiddenId='') {
 if(!Array.isArray(items))throw new Error('Invalid catalog');
 return items.filter(p=>p&&!p.deleted&&p.published===true&&p.id!==hiddenId).flatMap(p=>{
  let url;try{url=new URL(p.short_url);}catch{return []}
  if(url.protocol!=='https:'||url.hostname!=='sirtraver.gumroad.com'||!url.pathname.startsWith('/l/'))return [];
  let image='';try{const u=new URL(p.thumbnail_url);if(u.protocol==='https:'&&['public-files.gumroad.com','gumroad-public-storage.s3.amazonaws.com'].includes(u.hostname))image=u.href}catch{}
  return [{id:p.id,title:String(p.name||'Recurso').slice(0,180),summary:String(p.custom_summary||'').slice(0,260),url:url.href,image,price:p.price===0?'Free · €0':String(p.formatted_price||''),published:p.published===true,demo:false}];
 });
}
export async function catalog(request,env,ctx,fetcher=fetch) {
 if(request.method!=='GET')return new Response(null,{status:405,headers:{Allow:'GET'}});
 const json=(body,status=200,headers={})=>Response.json(body,{status,headers:{'Cache-Control':'no-store',...headers}});
 if(!env.GUMROAD_ACCESS_TOKEN)return json({status:'unavailable',products:[]},503);
 const identity=env.GUMROAD_ACCESS_TOKEN+'|'+(env.GUMROAD_HIDDEN_PRODUCT_ID||'');
 if(memo&&memo.identity===identity&&memo.expires>Date.now())return json({status:'ok',products:memo.products},200,{'Cache-Control':'public, max-age=30'});
 try{
  const response=await fetcher(API,{headers:{Authorization:'Bearer '+env.GUMROAD_ACCESS_TOKEN,Accept:'application/json'},signal:AbortSignal.timeout(10000)});
  if(!response.ok)throw new Error('upstream');const data=await response.json();if(data.success!==true)throw new Error('upstream');
  const products=publicProducts(data.products,env.GUMROAD_HIDDEN_PRODUCT_ID||'Moy9nnuULBf1HQdRh3v_HA==');
  const out=json({status:'ok',products},200,{'Cache-Control':'public, max-age=30, s-maxage=60'});
  memo={identity,products,expires:Date.now()+60000};return out;
 }catch{return json({status:'unavailable',products:[]},503)}
}
