import {OFFICIAL_POLICY_SOURCES,validateOfficialSnapshot} from '../js/official-policy-catalog.mjs';
const CACHE_SECONDS=900,MAX_BYTES=2000000;
const entity=text=>text.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp|ndash|mdash|rsquo|lsquo|ldquo|rdquo|euro|pound);/gi,(_,e)=>{
 const common={amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' ',ndash:'–',mdash:'—',rsquo:'’',lsquo:'‘',ldquo:'“',rdquo:'”',euro:'€',pound:'£'};
 if(e[0]!=='#')return common[e.toLowerCase()];const n=e[1].toLowerCase()==='x'?parseInt(e.slice(2),16):parseInt(e.slice(1),10);return n>0&&n<=0x10ffff?String.fromCodePoint(n):' ';
});
export function extractOfficialText(html){
 html=html.replace(/<!--[\s\S]*?-->/g,' ');
 const main=html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1]??html;
 return entity(main.replace(/<(script|style|noscript|nav|footer|header|svg)\b[^>]*>[\s\S]*?<\/\1>/gi,' ').replace(/<[^>]*>/g,' ')).replace(/[\s\u200b]+/g,' ').trim();
}
function dateValue(value){return typeof value==='string'&&!Number.isNaN(Date.parse(value))?new Date(value).toISOString():null;}
function metadata(html,names){
 for(const tag of html.match(/<meta\b[^>]*>/gi)||[]){const attrs=Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*["']([^"']*)["']/g)].map(m=>[m[1].toLowerCase(),m[2]]));if(names.includes((attrs.name||attrs.property||'').toLowerCase()))return dateValue(attrs.content);}
 return null;
}
async function boundedBody(response){
 if(Number(response.headers.get('content-length'))>MAX_BYTES)throw new Error('Official page too large');
 const reader=response.body.getReader(),chunks=[];let size=0;
 while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>MAX_BYTES){await reader.cancel();throw new Error('Official page too large');}chunks.push(value);}
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}return new TextDecoder().decode(bytes);
}
export async function fetchOfficialSnapshot(source,{request=fetch,now=()=>new Date()}={}){
 let url=source.fetchUrl,response;
 for(let redirects=0;redirects<=3;redirects++){
  response=await request(url,{headers:{Accept:source.format==='govuk'?'application/json':'text/html','User-Agent':'MAREG-OfficialSources/4.7.1'},redirect:'manual',signal:AbortSignal.timeout(12000)});
  if(response.status<300||response.status>=400)break;
  const location=response.headers.get('location');if(!location)throw new Error('Official redirect missing location');
  const next=new URL(location,url);if(next.protocol!=='https:'||next.origin!==new URL(source.fetchUrl).origin)throw new Error('Official redirect left configured site');url=next.href;
  if(redirects===3)throw new Error('Too many official redirects');
 }
 if(!response.ok)throw new Error('HTTP '+response.status);
 const body=await boundedBody(response);let title,content,publishedAt,updatedAt;
 if(source.format==='govuk'){
  const data=JSON.parse(body);if(typeof data.title!=='string'||typeof data.details?.body!=='string')throw new Error('Official content structure changed');
  title=data.title;content=data.details.body;publishedAt=dateValue(data.first_published_at||data.details.first_public_at);updatedAt=dateValue(data.public_updated_at);
 }else{
  if(!/text\/html/i.test(response.headers.get('content-type')||''))throw new Error('Official response is not HTML');
  const heading=body.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);if(!heading)throw new Error('Official page title missing');
  title=extractOfficialText(heading[1]);content=body;publishedAt=metadata(body,['article:published_time','dcterms.issued','date.issued']);updatedAt=metadata(body,['article:modified_time','dcterms.modified','date.modified']);
 }
 const text=extractOfficialText(content);if(text.length<180||/^(access denied|just a moment|checking your browser|request rejected)/i.test(title))throw new Error('Official content unavailable or challenged');
 return validateOfficialSnapshot({sourceId:source.id,url:source.url,title:title.slice(0,500),retrievedAt:now().toISOString(),publishedOn:publishedAt?publishedAt.slice(0,10):null,updatedAt,excerpt:text.slice(0,1100)});
}
export function createMemoryPolicyCache(){
 const entries=new Map();return {async match(key){const item=entries.get(key.url);return item&&item.expires>Date.now()?item.response.clone():undefined;},async put(key,response){entries.set(key.url,{expires:Date.now()+CACHE_SECONDS*1000,response:response.clone()});}};
}
export async function handleOfficialPolicyRequest(req,{env={},request=fetch,cache}){
 const origin=req.headers.get('Origin'),allowed=new Set((env.ALLOWED_ORIGINS||'https://wwwwzzzzkkkk.github.io,http://127.0.0.1:48184,http://localhost:48184').split(','));
 const respond=(status,data)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store',...(origin&&allowed.has(origin)?{'Access-Control-Allow-Origin':origin,Vary:'Origin'}:{})}});
 if(origin&&!allowed.has(origin))return respond(403,{error:'Origin not allowed'});
 if(req.method!=='GET')return respond(405,{error:'GET required'});
 if(new URL(req.url).search)return respond(400,{error:'No URL parameters supported'});
 const host=new URL(req.url).origin;
 const items=await Promise.all(OFFICIAL_POLICY_SOURCES.map(async source=>{
  const key=new Request(host+'/__official_policy_cache_v1/'+source.id),saved=await cache.match(key);
  if(saved)return {status:'ok',cached:true,snapshot:await saved.json()};
  try{
   const snapshot=await fetchOfficialSnapshot(source,{request});
   await cache.put(key,new Response(JSON.stringify(snapshot),{headers:{'Content-Type':'application/json','Cache-Control':'public, max-age='+CACHE_SECONDS}}));
   return {status:'ok',cached:false,snapshot};
  }catch(error){return {status:'unavailable',sourceId:source.id,reason:error.name==='TimeoutError'?'Official request timed out':error.message};}
 }));
 return respond(200,{protocol:'mareg-official-policies-v1',cacheSeconds:CACHE_SECONDS,items});
}
