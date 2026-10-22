import {OFFICIAL_POLICY_SOURCES,validateOfficialSnapshot} from './official-policy-catalog.mjs?v=4.7.1';
import {escapeHtml as esc} from './decision-report.mjs?v=4.7.1';
export function createOfficialPolicyUi({getLanguage,onUse}){
 const el=id=>document.getElementById(id),button=el('refreshOfficialPolicies');let items=[],loading=false,loaded=false,expires=0,error=false;
 const t=(z,e)=>getLanguage()==='zh'?z:e;
 function render(){
  button.disabled=loading;
  el('officialPolicyStatus').textContent=loading?t('正在读取官方资料…','Reading official sources…'):error?t('获取失败，可重试；不会使用预置资料冒充新结果。','Retrieval failed. Retry; bundled references are not substituted as fresh results.'):loaded?t(items.filter(i=>i.status==='ok').length+' / 4项已获取；展开查看来源与时间。',items.filter(i=>i.status==='ok').length+' / 4 retrieved. Expand for source and dates.'):t('进入本页时自动获取，无需AI访问码。','Loads automatically on this view; no AI access code needed.');
  el('officialPolicyList').innerHTML=items.map(item=>{
   const id=item.status==='ok'?item.snapshot.sourceId:item.sourceId,source=OFFICIAL_POLICY_SOURCES.find(s=>s.id===id);
   if(item.status!=='ok')return '<div class="official-source-row"><strong>'+esc(getLanguage()==='zh'?source.zh:source.en)+'</strong><p>'+esc(t('暂不可用：','Unavailable: ')+item.reason)+'</p><a href="'+source.url+'" target="_blank" rel="noopener noreferrer">'+t('打开官方原页','Open official page')+'</a></div>';
   const s=item.snapshot;
   return '<details class="official-source-row"><summary>'+esc(getLanguage()==='zh'?source.zh:source.en)+' · '+esc(t('已获取','Retrieved'))+'</summary><p><a href="'+s.url+'" target="_blank" rel="noopener noreferrer">'+esc(s.title)+'</a></p><p>'+esc(source.publisher)+' · '+esc(t('获取：','Retrieved: ')+s.retrievedAt)+(item.cached?' · '+t('缓存','Cached'):'')+'</p><p>'+esc(t('发布：','Published: ')+(s.publishedOn||t('未提供','Not supplied'))+' · '+t('原站更新：','Page updated: ')+(s.updatedAt||t('未提供','Not supplied')))+'</p><p>'+esc(s.excerpt)+'</p><p>'+t('仅为原文节选；请核对完整原页及版权说明。','Excerpt only; check the full original and its reuse terms.')+' <a href="'+source.reuse+'" target="_blank" rel="noopener noreferrer">'+t('来源使用条款','Source reuse terms')+'</a></p><button type="button" class="ghost-btn" data-official-use="'+id+'">'+t('用于成本比较','Use for cost comparison')+'</button></details>';
  }).join('');
 }
 async function load(){
  loading=true;error=false;render();
  try{
   const root=new URL(el('aiServiceUrl').value);if(root.username||root.password||root.search||root.hash||(root.protocol!=='https:'&&!(root.protocol==='http:'&&['localhost','127.0.0.1'].includes(root.hostname))))throw new Error('Invalid service URL');
   const response=await fetch(root.href.replace(/\/$/,'')+'/api/policies',{credentials:'omit',signal:AbortSignal.timeout(20000)});if(!response.ok)throw new Error('HTTP '+response.status);
   const data=await response.json();if(data.protocol!=='mareg-official-policies-v1'||!Array.isArray(data.items)||data.items.length!==4||data.cacheSeconds!==900)throw new Error('Invalid source response');
   const parsed=data.items.map(i=>{
    if(i.status==='ok'){if(typeof i.cached!=='boolean')throw new Error('Invalid cache metadata');return {status:'ok',cached:i.cached,snapshot:validateOfficialSnapshot(i.snapshot)};}
    if(i.status!=='unavailable'||!OFFICIAL_POLICY_SOURCES.some(s=>s.id===i.sourceId)||typeof i.reason!=='string'||i.reason.length>200)throw new Error('Invalid source status');
    return {status:'unavailable',sourceId:i.sourceId,reason:i.reason};
   });
   if(new Set(parsed.map(i=>i.snapshot?.sourceId??i.sourceId)).size!==4)throw new Error('Duplicate sources');
   items=parsed;loaded=true;expires=Math.min(...parsed.map(i=>i.status==='ok'?Date.parse(i.snapshot.retrievedAt)+900000:Date.now()+60000));
  }catch{error=true;items=[];loaded=false;}
  finally{loading=false;render();}
 }
 button.addEventListener('click',load);
 document.addEventListener('click',event=>{if(event.target.closest('[data-tab="tab-scenarios"]')&&!loading&&(!loaded||Date.now()>=expires))load();});
 el('officialPolicyList').addEventListener('click',event=>{const target=event.target.closest('[data-official-use]');if(target)onUse(items.find(i=>i.status==='ok'&&i.snapshot.sourceId===target.dataset.officialUse).snapshot);});
 render();return {render};
}
