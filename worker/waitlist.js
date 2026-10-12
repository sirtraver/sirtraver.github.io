const waitlistHash=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))).map(b=>b.toString(16).padStart(2,'0')).join('');
export async function subscribe(request,env){
 const reply=(status,code)=>Response.json({status:code},{status,headers:{'Cache-Control':'no-store','X-Robots-Tag':'noindex'}});
 if(request.method!=='POST')return reply(405,'method_not_allowed');
 if(request.headers.get('Origin')!==new URL(request.url).origin)return reply(403,'forbidden');
 if(!request.headers.get('Content-Type')?.startsWith('application/json')||Number(request.headers.get('Content-Length')||0)>2048)return reply(400,'invalid');
 let data;try{const text=await request.text();if(text.length>2048)return reply(400,'invalid');data=JSON.parse(text)}catch{return reply(400,'invalid')}
 const email=String(data.email||'').trim().toLowerCase();
 if(data.website)return reply(200,'subscribed');
 if(data.consent!==true||email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return reply(400,'invalid');
 if(!env.BUCKET)return reply(503,'unavailable');
 try{
  const key='waitlist/'+await waitlistHash(email)+'.json';
  const existing=await env.BUCKET.get(key);
  if(!existing)await env.BUCKET.put(key,JSON.stringify({email,language:data.language==='es'?'es':'en',subscribedAt:new Date().toISOString(),consent:'Notify me when sirtraver resources launch',source:'sirtraver.com/resources'}),{httpMetadata:{contentType:'application/json'}});
  return reply(200,'subscribed');
 }catch{return reply(503,'unavailable')}
}
export async function waitlistAdmin(request,env){
 const headers={'Cache-Control':'no-store','X-Robots-Tag':'noindex'};
 if(!env.WAITLIST_ADMIN_TOKEN||request.headers.get('Authorization')!=='Bearer '+env.WAITLIST_ADMIN_TOKEN)return new Response('Not found',{status:404,headers});
 if(!env.BUCKET)return Response.json({status:'unavailable'},{status:503,headers});
 if(request.method==='POST'){
  const key='system/waitlist-storage-check.json';const check={status:'ready',checkedAt:new Date().toISOString()};await env.BUCKET.put(key,JSON.stringify(check));const object=await env.BUCKET.get(key);const read=await object?.json();
  return Response.json({status:read?.checkedAt===check.checkedAt?'ready':'unavailable'},{headers});
 }
 if(request.method!=='GET')return new Response(null,{status:405,headers});
 const records=[];let cursor;
 do{const page=await env.BUCKET.list({prefix:'waitlist/',limit:1000,cursor});for(const item of page.objects){const object=await env.BUCKET.get(item.key);if(object)records.push(await object.json())}cursor=page.truncated?page.cursor:undefined}while(cursor);
 const csv=value=>'"'+String(value||'').replace(/"/g,'""')+'"';
 return new Response('email,language,subscribed_at,consent\r\n'+records.map(r=>[r.email,r.language,r.subscribedAt,r.consent].map(csv).join(',')).join('\r\n'),{headers:{...headers,'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="sirtraver-launch-list.csv"'}});
}
