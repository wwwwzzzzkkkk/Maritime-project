import {validateOfficialSnapshot} from './official-policy-catalog.mjs?v=4.7.1';
// Validation only at project-file and user-form boundaries.
export const DESK_SCHEMA='mareg-decision-desk-v1';
export const emptyDesk=()=>({schema:DESK_SCHEMA,fleet:[],policies:[],actions:[]});
const fail=message=>{throw new Error(message);};
const txt=(v,label,max=200,blank=false)=>{if(typeof v!=='string'||v.length>max||(!blank&&!v.trim()))fail(label+'：请填写有效文本 / Enter valid text');return v.trim();};
const id=v=>{if(typeof v!=='string'||!/^[A-Za-z0-9_-]{1,80}$/.test(v))fail('记录编号无效 / Invalid record ID');return v;};
const number=(v,min,max,label)=>{if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max)fail(label+'：数值越界 / Value outside bounds');return v;};
const revision=v=>{number(v,1,1e9,'版本');if(!Number.isInteger(v))fail('版本须为整数 / Revision must be an integer');return v;};
const day=(v,blank=false)=>{if(blank&&v==='')return '';if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v)||Number.isNaN(Date.parse(v))||new Date(v).toISOString().slice(0,10)!==v)fail('日期无效 / Invalid date');return v;};
const choice=(v,list)=>{if(!list.includes(v))fail('状态无效 / Invalid status');return v;};
function review(v,rev,author){
 if(v===null)return null;
 if(!v||typeof v!=='object')fail('复核记录无效 / Invalid review record');
 const reviewer=txt(v.reviewer,'复核人',80);
 if(reviewer.toLocaleLowerCase()===author.toLocaleLowerCase())fail('整理人／负责人和复核人须不同；此处不验证身份 / Use a different reviewer; identity is not verified');
 if(v.revision!==rev)fail('复核版本与记录不符 / Review revision mismatch');
 return {reviewer,reviewedOn:day(v.reviewedOn),note:txt(v.note,'复核意见',1000),revision:rev};
}
export function validateVesselProfile(v){
 if(!v||typeof v!=='object')fail('船舶资料无效 / Invalid vessel profile');
 if(!Number.isInteger(v.gt))fail('总吨须为整数 / GT must be an integer');
 return {name:txt(v.name,'船名',80),reference:txt(v.reference,'船舶编号',40),gt:number(v.gt,5001,1000000,'总吨'),serviceSpeedKn:number(v.serviceSpeedKn,5,30,'航速')};
}
export function validatePolicy(v){
 if(!v||typeof v!=='object')fail('政策记录无效 / Invalid policy record');
 let url;try{url=new URL(v.url);}catch{fail('来源须为完整HTTPS地址 / Use a full HTTPS source URL');}
 if(url.protocol!=='https:'||url.username||url.password||url.href.length>2000)fail('来源须为无凭据的HTTPS地址 / Use HTTPS without credentials');
 const retrieval=v.retrieval===undefined?undefined:validateOfficialSnapshot(v.retrieval);
 if(retrieval&&retrieval.url!==url.href)fail('获取记录与来源地址不符 / Retrieval URL mismatch');
 const r=revision(v.revision),author=txt(v.author,'整理人',80),publishedOn=day(v.publishedOn,Boolean(retrieval&&retrieval.publishedOn===null)),checkedOn=day(v.checkedOn);
 if(checkedOn<publishedOn)fail('核对日期不得早于发布日期 / Check date precedes publication');
 const status=choice(v.status,['in-force','proposal','planning']),effectiveOn=day(v.effectiveOn,status!=='in-force');
 if(!Array.isArray(v.shipIds)||v.shipIds.length>20||new Set(v.shipIds).size!==v.shipIds.length)fail('适用船舶无效 / Invalid vessel selection');
 if(typeof v.allShips!=='boolean'||(!v.allShips&&!v.shipIds.length))fail('请选择全部或至少一艘船 / Select all or at least one vessel');
 const a=v.assumptions;
 if(!a||typeof a!=='object'||Array.isArray(a))fail('政策条件无效 / Invalid policy assumptions');
 const limits={euaPrice:[50,120,5],ukPrice:[0,1000,1],targetCut:[2,6,1],poolPrice:[0,10000,1],poolAvailable:[0,10000,25]},assumptions={};
 for(const k of Object.keys(a)){
  if(!Object.hasOwn(limits,k))fail('不支持的政策参数 / Unsupported policy parameter');
  const [min,max,step]=limits[k];const n=number(a[k],min,max,k);
  if(k==='targetCut'?![2,6].includes(n):Math.abs((n-min)/step-Math.round((n-min)/step))>1e-7)fail('参数不符合现有步长 / Use supported parameter steps');
  assumptions[k]=n;
 }
 return {...(retrieval?{retrieval}:{}),id:id(v.id),revision:r,title:txt(v.title,'政策标题',120),regime:choice(v.regime,['eu','uk','fuel','imo']),url:url.href,publishedOn,checkedOn,effectiveOn,status,author,
 before:txt(v.before,'原条件',1000),after:txt(v.after,'变化条件',1000),uncertainty:txt(v.uncertainty,'不确定性与待核事项',1000),allShips:v.allShips,shipIds:v.shipIds.map(id),assumptions,review:review(v.review,r,author)};
}
export function validateDesk(value,validateAnalysis){
 if(!value||value.schema!==DESK_SCHEMA)fail('扩展工作区格式无效 / Invalid decision workspace');
 if(!Array.isArray(value.fleet)||value.fleet.length>20||!Array.isArray(value.policies)||value.policies.length>40||!Array.isArray(value.actions)||value.actions.length>80)fail('上限为20艘船、40项政策、80项行动 / Maximum 20 vessels, 40 policies and 80 actions');
 const unique=list=>{if(new Set(list.map(v=>v.id)).size!==list.length)fail('记录编号重复 / Duplicate record IDs');};
 const fleet=value.fleet.map(v=>({id:id(v.id),revision:revision(v.revision),input:validateAnalysis(v.input)}));
 for(const v of fleet)if(!v.input.vesselProfile)fail('船队记录需要船舶资料 / Fleet records require a vessel profile');
 unique(fleet);
 if(new Set(fleet.map(v=>v.input.vesselProfile.reference.toLocaleLowerCase())).size!==fleet.length)fail('船舶编号不可重复 / Vessel reference must be unique');
 const fleetIds=new Set(fleet.map(v=>v.id));
 const policies=value.policies.map(validatePolicy);unique(policies);
 for(const p of policies)if(p.shipIds.some(k=>!fleetIds.has(k)))fail('政策关联的船舶不存在 / Missing linked vessel');
 const policyIds=new Set(policies.map(v=>v.id));
 const actions=value.actions.map(v=>{
  if(!v||!Array.isArray(v.policySnapshots)||v.policySnapshots.length>40)fail('行动来源无效 / Invalid action sources');
  const r=revision(v.revision),owner=txt(v.owner,'负责人',80,true);
  const a={id:id(v.id),revision:r,fleetId:id(v.fleetId),fleetRevision:revision(v.fleetRevision),title:txt(v.title,'行动标题',160),
   owner,dueOn:day(v.dueOn,true),trigger:txt(v.trigger,'实施前提',1000,true),risk:txt(v.risk,'风险与限制',1000,true),
   major:typeof v.major==='boolean'?v.major:fail('重大支出标记无效 / Invalid material-spend flag'),
   status:choice(v.status,['draft','planned','implemented','deferred']),review:review(v.review,r,owner),evidence:txt(v.evidence,'实施凭证',1000,true),outcome:txt(v.outcome,'实际结果',1000,true),
   events:(()=>{if(!Array.isArray(v.events)||v.events.length>40)fail('最多40条行动事件 / Maximum 40 action events');return v.events.map(e=>({on:day(e.on),kind:choice(e.kind,['created','edited','reviewed','planned','implemented','deferred']),revision:revision(e.revision),note:txt(e.note,'事件说明',1200)}));})(),baseInput:validateAnalysis(v.baseInput),proposalInput:validateAnalysis(v.proposalInput),policySnapshots:v.policySnapshots.map(validatePolicy),createdOn:day(v.createdOn)};
  if(!a.baseInput.vesselProfile||!a.proposalInput.vesselProfile)fail('行动快照需要船舶资料 / Action snapshots require vessel profiles');
  unique(a.policySnapshots);
  if(!fleetIds.has(a.fleetId)||a.policySnapshots.some(p=>!policyIds.has(p.id)))fail('行动关联记录不存在 / Missing action source');
  if(a.status==='planned'||a.status==='implemented'){
   if(!owner||!a.dueOn||!a.trigger||!a.risk||!a.review)fail('计划／实施需要负责人、日期、前提、风险与复核 / Complete the action and review before planning');
  }
  if(a.status==='implemented'&&(!a.evidence||!a.outcome))fail('已实施需要凭证和结果；仍为用户自报 / Evidence and outcome required; implementation remains self-reported');
  return a;
 });unique(actions);
 return {schema:DESK_SCHEMA,fleet,policies,actions};
}
