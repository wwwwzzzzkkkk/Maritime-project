import {createOfficialPolicyUi} from './official-policy-ui.mjs?v=4.7.3';
import {OFFICIAL_POLICY_SOURCES} from './official-policy-catalog.mjs?v=4.7.3';
import {openFormDialog,closeFormDialog} from './form-dialogs.mjs?v=4.7.3';
import {validateAnalysis,evaluateAnalysis} from './analysis-state.mjs?v=4.7.3';
import {emptyDesk,validateDesk,validatePolicy,createFleetEntry,createAction,fleetSummary,actionAssessment,assertCanAdvance,appliesTo,hasConditions} from './decision-desk.mjs?v=4.7.3';
import {escapeHtml as esc} from './decision-report.mjs?v=4.7.3';
const today=()=>new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);
export function createDecisionUi({capture,restore,navigate,openWorkspace,explainPolicy,onDeskChange}){
 const el=id=>document.getElementById(id),control=(f,k)=>f.elements.namedItem(k);
 let desk=emptyDesk(),lang='zh',dirty=false,policyId='',fleetEditId='',policyEditId='',actionId='',actionDirty=false,current,pendingRetrieval;
 const t=(z,e)=>lang==='zh'?z:e,money=(v,c='EUR')=>new Intl.NumberFormat(lang==='zh'?'zh-CN':'en-GB',{style:'currency',currency:c,maximumFractionDigits:2}).format(v),num=v=>new Intl.NumberFormat(lang==='zh'?'zh-CN':'en-GB',{maximumFractionDigits:2}).format(v);
 const legal=p=>({planning:t('规划假设','Planning assumption'),proposal:t('提案／草案','Proposal / draft'),'in-force':t('用户标注已生效','User-marked in force')})[p.status];
 const stateLabel=s=>({draft:t('待完善／复核','Draft / review needed'),planned:t('用户记录：计划中','User-recorded: planned'),implemented:t('用户自报：已实施','Self-reported: implemented'),deferred:t('已记录暂缓','Deferred')})[s];
 const optionLabels=()=>({recommendation:t('最低模型成本候选','Lowest model-cost candidate'),current:t('已存当前方案','Stored current option'),speed:t('仅航速','Speed only'),fuel:t('仅燃料','Fuel only'),pooling:t('仅组池','Pooling only'),baseline:t('保持现状','Unmodified baseline')});
 const reason=k=>({operations:t('运营输入未确认','Operations unconfirmed'),fuel:t('燃料条件未确认','Fuel conditions unconfirmed'),pool:t('组池供给未确认','Pool supply unconfirmed'),timeLimit:t('超过航时限制','Time limit exceeded'),fuelLimit:t('超过燃料比例限制','Fuel limit exceeded')})[k];
 const msg=(id,s)=>{el(id).textContent=s;};
 const button=(key,id,label)=>'<button type="button" class="ghost-btn" data-'+key+'="'+esc(id)+'">'+esc(label)+'</button>';
 function table(heads,rows){return '<div class="table-wrap desk-table-wrap"><table class="telemetry-table desk-table"><thead><tr>'+heads.map(h=>'<th>'+esc(h)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map((v,i)=>'<td data-label="'+esc(heads[i])+'">'+'<div class="desk-cell-value">'+v+'</div></td>').join('')+'</tr>').join('')+'</tbody></table></div>';}
 const metric=(title,value)=>'<div class="desk-metric"><span>'+esc(title)+'</span><strong>'+esc(value)+'</strong></div>';
 function run(status,fn){try{fn();}catch(error){msg(status,error.message);for(const dialog of document.querySelectorAll('.form-dialog[open]'))dialog.querySelector('.form-dialog-status').textContent=error.message;}}
 function commit(next){desk=validateDesk(next,validateAnalysis);dirty=true;render();onDeskChange();}
 function addEvent(a,kind,note){a.events.push({on:today(),kind,revision:a.revision,note});}
 function selectOptions(select,items,emptyLabel,selected=select.value){
  select.innerHTML='<option value="">'+esc(emptyLabel)+'</option>'+items.map(i=>'<option value="'+esc(i.id)+'">'+esc(i.label)+'</option>').join('');
  select.value=items.some(i=>i.id===selected)?selected:'';
 }
 function sourceLabel(entry){return entry.input.ledgerDocuments[entry.input.selectedVesselId]?t('用户台账，未核验','User ledger, unverified'):t('模板范围推演，非真实账单','Template-scope what-if, not actual bills');}
 function renderFleet(){
  const s=fleetSummary(desk),heads=[t('船舶／编号','Vessel / reference'),t('EUR范围内估算','Scoped EUR'),t('GBP独立列示','GBP separate'),t('数据与目标条件','Data and target'),t('操作','Actions')];
  el('fleetTotals').innerHTML=metric(t('已存船舶（最多20）','Stored vessels (maximum20)'),desk.fleet.length+' / 20')+metric(t('EUR范围内合计','Scoped EUR total'),(desk.fleet.length?money(s.eur):'—'))+metric(t('GBP合计，独立列示','GBP total, separate'),(desk.fleet.length?money(s.gbp,'GBP'):'—'));
  el('fleetRows').innerHTML=s.rows.length?s.rows.map(r=>'<tr>'+[
   '<strong>'+esc(r.entry.input.vesselProfile.name)+'</strong><br>'+esc(r.entry.input.vesselProfile.reference)+' · v'+r.entry.revision,
   esc(money(r.eur)),esc(money(r.gbp,'GBP')),
   esc(sourceLabel(r.entry))+'<br>'+r.targetCut+'% · '+t('2026活动输入；年度完整性待核','2026 inputs; annual completeness unverified'),
   '<div class="desk-toolbar">'+button('fleet-load',r.entry.id,t('载入分析','Open analysis'))+button('fleet-update',r.entry.id,t('更新分析','Update snapshot'))+button('fleet-edit',r.entry.id,t('编辑资料','Edit profile'))+button('fleet-remove',r.entry.id,t('移除','Remove'))+'</div>'
  ].map((v,i)=>'<td data-label="'+esc(heads[i])+'">'+'<div class="desk-cell-value">'+v+'</div></td>').join('')+'</tr>').join(''):'<tr><td colspan="5" class="desk-empty">'+t('尚无船队记录。展开“添加船舶”，把当前已应用分析存为第一艘船。','No fleet records. Expand Add a vessel to store the current applied analysis.')+'</td></tr>';
  msg('fleetScopeNote',t('EUR与GBP不换算、不混加；只汇总已存快照，不是完整航次成本或已核验年度账单。','EUR/GBP are not converted or combined. Stored snapshots only; not full voyage costs or verified annual accounts.')+(s.mixedTargets?t(' 当前记录混合了2%与6%目标条件，可比性需人工核对。',' Records mix2% and6% target conditions; check comparability.'):''));
  const f=el('fleetForm'),entry=fleetEditId?desk.fleet.find(v=>v.id===fleetEditId):null,input=entry?entry.input:capture(),m=entry?evaluateAnalysis(input):current;
  const ledger=input.ledgerDocuments[input.selectedVesselId];
  if(!f.dataset.edited&&!entry){control(f,'name').value=m.vessel.name;control(f,'gt').value=m.vessel.gt;control(f,'serviceSpeedKn').value=m.vessel.serviceSpeedKn;}
  for(const k of['name','gt','serviceSpeedKn'])control(f,k).readOnly=Boolean(ledger);
  el('fleetStore').firstElementChild.textContent=entry?t('保存资料（保留已存分析）','Save profile (keep stored analysis)'):t('存入当前分析','Store current analysis');
  msg('fleetSourceHint',entry?t('仅编辑此船资料；单船参数如有变化，请先载入该船再点击“更新分析”。','Profile edits retain stored inputs. Load this vessel and use Update snapshot for changed calculations.'):t('从当前已应用输入建立记录；模板数据仍是演示假设。真实台账请先在方案比较中检查并应用。','Store the currently applied inputs. Template data remain illustrative; screen/apply a real ledger in Compare Options first.'));
 }
 function picker(selected){const old=selected??[...el('policyShipPicker').querySelectorAll('input:checked')].map(e=>e.value);el('policyShipPicker').innerHTML=desk.fleet.map(v=>'<label><input type="checkbox" value="'+esc(v.id)+'" '+(old.includes(v.id)?'checked':'')+' />'+esc(v.input.vesselProfile.name)+'</label>').join('');el('policyShipPicker').hidden=control(el('policyEvidenceForm'),'allShips').checked;}
 function renderPolicy(){
  if(!desk.policies.some(p=>p.id===policyId))policyId=desk.policies[0]?.id??'';
  selectOptions(el('policyImpactSelect'),desk.policies.map(p=>({id:p.id,label:p.title+' · v'+p.revision})),t('尚无政策证据','No policy evidence'),policyId);el('policyImpactSelect').value=policyId;
  el('policyRecords').innerHTML=desk.policies.length?desk.policies.map(p=>'<article class="desk-record '+(p.id===policyId?'is-selected':'')+'"><h3><a href="'+esc(p.url)+'" target="_blank" rel="noopener noreferrer">'+esc(p.title)+'</a></h3><p><span class="badge">'+esc(legal(p))+'</span>v'+p.revision+' · '+esc(p.regime.toUpperCase())+' · '+esc(p.author)+'</p><p>'+t('发布','Published')+' '+(p.publishedOn||t('未知','Unknown'))+' · '+t('核对／获取','Checked')+' '+p.checkedOn+' · '+t('生效','Effective')+' '+(p.effectiveOn||t('未确定','Unknown'))+'</p><p>'+(p.retrieval?esc(t('官方页面获取：','Official-page retrieval: ')+p.retrieval.retrievedAt+' · '+t('适用性待核','applicability unverified')):'')+'</p><p>'+esc(p.review?t('自填复核：','Self-entered review: ')+p.review.reviewer+' · '+p.review.reviewedOn:t('尚无团队复核记录；来源官方性和适用范围待核。','No team review record; source authority and scope need checking.'))+'</p><details><summary>'+t('证据与条件','Evidence & conditions')+'</summary><p>'+t('原条件：','Previous: ')+esc(p.before)+'</p><p>'+t('变化：','Change: ')+esc(p.after)+'</p><p>'+t('待核：','Uncertainty: ')+esc(p.uncertainty)+'</p><p>'+esc(Object.entries(p.assumptions).map(([k,v])=>({euaPrice:'EUA €/t',ukPrice:'UKA £/t',targetCut:'FuelEU %',poolPrice:'€/tCB',poolAvailable:'tCB'})[k]+' = '+v).join(' · ')||t('尚未填写数值影响条件。','No numeric impact conditions.'))+'</p></details><div class="desk-toolbar">'+button('policy-compare',p.id,t('比较影响','Compare impact'))+button('policy-ai',p.id,t('AI解释影响','Explain impact with AI'))+button('policy-edit',p.id,t('编辑','Edit'))+button('policy-remove',p.id,t('移除','Remove'))+'</div></article>').join(''):'<p class="desk-empty">'+t('暂无记录。添加经核对的资料和明确条件后，才展示船队成本影响。','No records yet. Add reviewed evidence and explicit conditions to compare fleet impacts.')+'</p>';
  const p=desk.policies.find(p=>p.id===policyId);
  el('openPolicyReview').hidden=!p;
  if(!p)el('policyImpact').innerHTML='';
  else if(!hasConditions(p))el('policyImpact').innerHTML='<p class="desk-empty">'+t('这是一项证据记录，尚无可计算条件；不能据此断言成本变化为零。','Evidence only: no numeric conditions. A zero cost impact has not been established.')+'</p>';
  else if(!desk.fleet.length)el('policyImpact').innerHTML='<p class="desk-empty">'+t('请先存入船队记录；政策条件未应用到当前单船预算。','Store fleet vessels first. Policy conditions have not changed the active single-vessel budget.')+'</p>';
  else{
   const s=fleetSummary(desk,p);
   el('policyImpact').innerHTML='<div class="desk-metrics">'+metric(t('本记录覆盖船舶','Vessels covered'),s.affected)+metric(t('范围内EUR差额','Scoped EUR change'),money(s.deltaEur))+metric(t('GBP差额，独立列示','GBP change, separate'),money(s.deltaGbp,'GBP'))+'</div>'+table([t('船舶','Vessel'),t('原EUR → 条件EUR','Original EUR → conditional EUR'),t('EUR差额','EUR change'),t('GBP差额','GBP change'),t('状态','Status')],s.rows.map(r=>[esc(r.entry.input.vesselProfile.name),esc(money(r.before.comparison.active.totalEur)+' → '+money(r.eur)),r.quantified?esc(money(r.deltaEur)):'—',r.quantified?esc(money(r.deltaGbp,'GBP')):'—',r.affected?t('用户条件比较；非已生效账单','User-condition comparison; not an in-force bill'):t('不在本记录范围','Outside this record’s scope')]));
  }
  picker();
 }
 function refreshActionOptions(){
  const f=el('actionGenerateForm');
  selectOptions(control(f,'fleetId'),desk.fleet.map(v=>({id:v.id,label:v.input.vesselProfile.name+' · '+v.input.vesselProfile.reference})),t('选择已存船舶','Choose a stored vessel'));
  const fleetId=control(f,'fleetId').value;
  selectOptions(control(f,'policyId'),desk.policies.filter(p=>appliesTo(p,fleetId)).map(p=>({id:p.id,label:p.title})),t('仅用原有输入选择候选','Choose using original inputs'));
 }
 function fillAction(){
  const a=desk.actions.find(a=>a.id===actionId);if(!a)return;
  const f=el('actionEditForm');
  for(const k of['title','owner','dueOn','trigger','risk','evidence','outcome'])control(f,k).value=a[k];
  control(f,'major').checked=a.major;control(f,'reviewer').value=a.review?.reviewer??'';control(f,'reviewNote').value=a.review?.note??'';actionDirty=false;
 }
 function renderActions(){
  refreshActionOptions();
  if(!desk.actions.some(a=>a.id===actionId))actionId=desk.actions[0]?.id??'';
  el('actionRecords').innerHTML=desk.actions.length?desk.actions.map(a=>{const s=actionAssessment(a,desk),name=a.baseInput.vesselProfile.name;return '<article class="desk-record '+(a.id===actionId?'is-selected':'')+'"><h3>'+esc(name)+' · '+esc(a.title)+'</h3><p>'+esc(s.stale?t('来源已更新：需重新生成与复核','Sources updated: regenerate and review'):stateLabel(a.status))+' · v'+a.revision+'</p><p>'+esc(a.owner||t('负责人待填','Owner required'))+' · '+esc(a.dueOn||t('日期待填','Date required'))+'</p><div class="desk-toolbar">'+button('action-select',a.id,t('查看／完善','Open / complete'))+button('action-remove',a.id,t('移除','Remove'))+'</div></article>';}).join(''):'<p class="desk-empty">'+t('尚无行动。选择已存船舶和候选类型，生成包含计算依据的草稿。','No actions. Choose a stored vessel and an option to create a traceable draft.')+'</p>';
  el('actionSelected').hidden=!actionId;
  if(!actionId)return;
  const a=desk.actions.find(a=>a.id===actionId),s=actionAssessment(a,desk),b=s.baseline;
  const robustness=s.robustness==='baseline-only'?t('仅基准条件；没有跨情景证据','Baseline only; no cross-scenario evidence'):s.robustness==='non-increasing'?t('所列条件下EUR／GBP费用均未上升；不保证可执行','Neither currency increased under listed conditions; execution is not guaranteed'):t('费用结果或可行性依赖情景','Cost or feasibility depends on the scenario');
  el('actionNumbers').innerHTML='<div class="desk-metrics">'+metric(t('基准条件EUR变化','EUR change at baseline'),money(b.eur))+metric(t('GBP变化，独立列示','GBP change, separate'),money(b.gbp,'GBP'))+metric(t('新增航时（模型h）','Extra time (model h)'),num(b.extraHours))+'</div><p class="model-note">'+esc(robustness)+'</p><p class="model-note">'+esc(s.stale?t('船舶分析／政策已更新；旧快照保留，请重新生成行动。','Vessel/policy changed; the old snapshot is retained. Regenerate this action.'):t('使用生成时的已存快照与来源版本，不自动改当前输入。','Uses source revisions and saved snapshots from generation; active inputs are unchanged.'))+'</p><p class="model-note">'+esc((s.pending.map(reason).join(' / ')||t('输入由用户确认，非外部核验','User-confirmed inputs, not external verification'))+' · '+t('范围内WtW模型变化：','Scoped WtW model change: ')+num(b.physicalDelta)+' tCO₂e')+'</p><p class="model-note">'+esc(a.review?t('自填复核：','Self-entered review: ')+a.review.reviewer+' · '+a.review.reviewedOn:t('尚无另一位成员的复核记录。','No second-person review record.'))+'</p>';
  el('actionScenarioTable').innerHTML=table([t('条件','Condition'),t('EUR差额','EUR change'),t('GBP差额','GBP change'),t('限制与确认','Limits and confirmation')],[{...b,title:t('原输入条件','Original inputs')},...s.scenarios].map(r=>[esc(r.title),esc(money(r.eur)),esc(money(r.gbp,'GBP')),esc([...r.reasons,...r.pending].map(reason).join(' / ')||t('用户输入条件满足，非核验','User-input conditions met; not verified'))]));
  if(!actionDirty)fillAction();
  el('actionHistory').innerHTML=a.events.map(e=>'<p class="model-note">'+e.on+' · v'+e.revision+' · '+esc(e.kind)+' · '+esc(e.note)+'</p>').join('');
  for(const id of['actionPlan','actionImplement','actionDefer'])el(id).disabled=actionDirty;
 }
 function render(){
  if(!current)return;
  renderFleet();renderPolicy();renderActions();
  msg('deskSaveHint',dirty?t('有未保存更改；仅保存到本机或导出后可恢复。','Unsaved changes. Save locally or export for recovery.'):t('项目数据不自动上传，不跨设备同步。','Project records are not uploaded or synchronized automatically.'));
 }
 el('deskSaveProject').addEventListener('click',openWorkspace);
 el('fleetForm').addEventListener('input',()=>{el('fleetForm').dataset.edited='true';});
 function resetFleet(){fleetEditId='';el('fleetForm').reset();delete el('fleetForm').dataset.edited;render();}
 el('fleetNew').addEventListener('click',resetFleet);
 el('fleetForm').addEventListener('submit',event=>{event.preventDefault();run('fleetStatus',()=>{
  const f=event.target,profile={name:control(f,'name').value,reference:control(f,'reference').value,gt:control(f,'gt').valueAsNumber,serviceSpeedKn:control(f,'serviceSpeedKn').valueAsNumber},next=structuredClone(desk);
  let entry;
  if(fleetEditId){entry=next.fleet.find(v=>v.id===fleetEditId);entry.input.vesselProfile=profile;entry.input=validateAnalysis(entry.input);entry.revision++;}
  else{entry=createFleetEntry(capture(),profile,crypto.randomUUID());next.fleet.push(entry);}
  const wasNew=!fleetEditId;commit(next);closeFormDialog('fleetEditor').then(closed=>{if(closed)resetFleet();});if(wasNew)restore(entry.input);
  msg('fleetStatus',t('船队记录已更新；请保存／导出项目。相关旧行动可能需要重新生成。','Fleet record updated. Save/export the project; old actions may require regeneration.'));
 });});
 el('fleetRows').addEventListener('click',event=>{
  for(const key of['load','update','edit','remove']){const btn=event.target.closest('[data-fleet-'+key+']');if(!btn)continue;run('fleetStatus',()=>{
   const id=btn.dataset['fleet'+key[0].toUpperCase()+key.slice(1)],entry=desk.fleet.find(v=>v.id===id);
   if(key==='load'){restore(entry.input);msg('fleetStatus',t('已载入此船分析。修改后点击本行“更新分析”才会改变船队快照。','Analysis loaded. Use this row’s Update snapshot after editing.'));}
   if(key==='edit'){fleetEditId=id;const f=el('fleetForm');for(const k of['name','reference','gt','serviceSpeedKn'])control(f,k).value=entry.input.vesselProfile[k];f.dataset.edited='true';openFormDialog('fleetEditor');render();}
   if(key==='update'){const input=capture();if(input.vesselProfile?.reference!==entry.input.vesselProfile.reference)throw new Error(t('请先载入该船，再更新分析。','Load this vessel before updating its snapshot.'));const next=structuredClone(desk),e=next.fleet.find(v=>v.id===id);e.input=validateAnalysis(input);e.revision++;commit(next);msg('fleetStatus',t('已更新输入快照；原行动保留并标为来源已更新。','Snapshot updated. Existing actions are retained and marked stale.'));}
   if(key==='remove'){if(desk.actions.some(a=>a.fleetId===id)||desk.policies.some(p=>p.shipIds.includes(id)))throw new Error(t('请先移除／修改关联行动和指定船舶政策，避免丢失依据。','Remove/relink actions and vessel-specific policies first.'));if(confirm(t('移除此船记录？已导出文件不受影响。','Remove this vessel record? Exported files are unaffected.'))){const next=structuredClone(desk);next.fleet=next.fleet.filter(v=>v.id!==id);commit(next);resetFleet();}}
  });break;}
 });
 const pf=el('policyEvidenceForm');
 function resetPolicy(){policyEditId='';pendingRetrieval=undefined;pf.reset();control(pf,'publishedOn').required=true;control(pf,'checkedOn').value=today();el('policyRetrievalHint').textContent='';picker([]);}
 el('policyNew').addEventListener('click',resetPolicy);
 const officialUi=createOfficialPolicyUi({getLanguage:()=>lang,onUse(snapshot){
  resetPolicy();pendingRetrieval=snapshot;const source=OFFICIAL_POLICY_SOURCES.find(s=>s.id===snapshot.sourceId);
  const values={title:snapshot.title.slice(0,120),url:snapshot.url,regime:source.regime,status:'planning',publishedOn:snapshot.publishedOn??'',checkedOn:snapshot.retrievedAt.slice(0,10),effectiveOn:'',author:'Official retrieval / 自动获取',before:t('已存船队的基准输入；未自动更改规则或预算。','Stored fleet baseline inputs; no rules or budgets changed automatically.'),after:t('官方原文节选：','Official excerpt: ')+snapshot.excerpt.slice(0,950),uncertainty:t('获取不等于法律核验；适用范围、日期及数值条件需确认，原文可能有未提取的例外。','Retrieval is not legal verification. Confirm applicability, dates and numeric conditions; the original may contain exceptions not extracted here.')};
  for(const [key,value]of Object.entries(values))control(pf,key).value=value;
  control(pf,'publishedOn').required=snapshot.publishedOn!==null;
  el('policyRetrievalHint').textContent=t('已自动填入官方资料草稿，尚未保存或改变预算。原站缺失的发布日期保留为空；请选择适用船舶与成本比较条件。','Official-source draft filled; not saved and budgets unchanged. A missing publication date stays blank. Choose vessels and explicit cost conditions.');
  openFormDialog('policyEditor');
 }});

 control(pf,'allShips').addEventListener('change',()=>picker());
 pf.addEventListener('submit',event=>{event.preventDefault();run('policyEvidenceStatus',()=>{
  const next=structuredClone(desk),old=next.policies.find(p=>p.id===policyEditId),assumptions={};
  for(const k of['euaPrice','ukPrice','targetCut','poolPrice','poolAvailable'])if(control(pf,k).value!=='')assumptions[k]=Number(control(pf,k).value);
  const p={id:old?.id??crypto.randomUUID(),revision:(old?.revision??0)+1,review:null,assumptions,allShips:control(pf,'allShips').checked,shipIds:[...el('policyShipPicker').querySelectorAll('input:checked')].map(e=>e.value)};
  for(const k of['title','regime','url','status','publishedOn','checkedOn','effectiveOn','author','before','after','uncertainty'])p[k]=control(pf,k).value;
  const source=old?.retrieval??pendingRetrieval;if(source&&source.url===p.url)p.retrieval=source;
  const valid=validatePolicy(p);if(old)next.policies[next.policies.findIndex(p=>p.id===old.id)]=valid;else next.policies.push(valid);
  policyId=valid.id;commit(next);closeFormDialog('policyEditor').then(closed=>{if(closed)resetPolicy();});msg('policyEvidenceStatus',t('证据已保存，预算未自动应用；请记录复核，并保存／导出项目。','Evidence saved; budgets unchanged. Record a review and save/export the project.'));
 });});
 el('policyImpactSelect').addEventListener('change',e=>{policyId=e.target.value;renderPolicy();});
 el('policyRecords').addEventListener('click',event=>{
  for(const key of['compare','ai','edit','remove']){const btn=event.target.closest('[data-policy-'+key+']');if(!btn)continue;run('policyEvidenceStatus',()=>{
   const id=btn.dataset['policy'+key[0].toUpperCase()+key.slice(1)],p=desk.policies.find(p=>p.id===id);policyId=id;
   if(key==='ai')explainPolicy(p.id);
   if(key==='compare'){renderPolicy();el('policyImpact').scrollIntoView({block:'center'});}
   if(key==='edit'){policyEditId=id;pendingRetrieval=p.retrieval;control(pf,'publishedOn').required=!Boolean(p.retrieval&&p.retrieval.publishedOn===null);el('policyRetrievalHint').textContent=p.retrieval?t('保留获取时的资料版本；修改来源地址会移除原获取关联。','Retains the fetched source version; changing the URL removes its retrieval association.'):'';for(const k of['title','regime','url','status','publishedOn','checkedOn','effectiveOn','author','before','after','uncertainty'])control(pf,k).value=p[k];control(pf,'allShips').checked=p.allShips;for(const k of['euaPrice','ukPrice','targetCut','poolPrice','poolAvailable'])control(pf,k).value=p.assumptions[k]??'';picker(p.shipIds);openFormDialog('policyEditor');renderPolicy();}
   if(key==='remove'){if(desk.actions.some(a=>a.policySnapshots.some(p=>p.id===id)))throw new Error(t('请先保留导出记录，再移除关联行动；不能删除其引用依据。','Export records and remove linked actions first; their source cannot be deleted.'));if(confirm(t('移除此政策记录？','Remove this policy record?'))){const next=structuredClone(desk);next.policies=next.policies.filter(p=>p.id!==id);commit(next);resetPolicy();}}
  });break;}
 });
 el('policyReviewForm').addEventListener('submit',event=>{event.preventDefault();run('policyEvidenceStatus',()=>{
  const next=structuredClone(desk),p=next.policies.find(p=>p.id===policyId);if(!p)throw new Error(t('请选择资料记录。','Select an evidence record.'));
  p.revision++;p.review={reviewer:control(event.target,'reviewer').value,reviewedOn:today(),note:control(event.target,'note').value,revision:p.revision};commit(next);
  closeFormDialog('policyReviewEditor').then(closed=>{if(closed)event.target.reset();});msg('policyEvidenceStatus',t('团队自填复核已记录；不验证身份，也不是外部批准。旧行动需重新生成。','Self-entered team review recorded; no identity verification or external approval. Regenerate old actions.'));
 });});
 control(el('actionGenerateForm'),'fleetId').addEventListener('change',refreshActionOptions);
 el('actionGenerateForm').addEventListener('submit',event=>{event.preventDefault();run('actionStatus',()=>{
  const f=event.target,next=structuredClone(desk),a=createAction(next,control(f,'fleetId').value,control(f,'kind').value,control(f,'policyId').value,crypto.randomUUID(),today());
  a.title=t('评估：','Review: ')+optionLabels()[control(f,'kind').value];a.trigger=t('先核对运营限制、燃料／组池条件和适用范围，再决定是否实施。','Check operating limits, fuel/pooling conditions and scope before implementation.');a.risk=t('有限搜索与简化模型；费用下降不等于实际减排。重大支出须另行专业复核。','Finite search and simplified models; lower costs are not verified reductions. Material spending needs separate professional review.');
  next.actions.push(a);actionId=a.id;actionDirty=false;commit(next);closeFormDialog('actionGeneratorDialog').then(closed=>{if(closed){openFormDialog('actionEditor');fillAction();}});msg('actionStatus',t('已生成待复核草稿；原预算未改变。请填写负责人、日期及意见。','Draft created; active budgets unchanged. Complete owner, date and review.'));
 });});
 el('actionRecords').addEventListener('click',event=>{
  const select=event.target.closest('[data-action-select]'),remove=event.target.closest('[data-action-remove]');
  if(select){if(actionDirty&&!confirm(t('放弃未保存的说明？','Discard unsaved details?')))return;actionId=select.dataset.actionSelect;actionDirty=false;renderActions();openFormDialog('actionEditor');fillAction();}
  if(remove&&confirm(t('移除此行动？已导出项目不受影响。','Remove this action? Exported projects are unaffected.')))run('actionStatus',()=>{const next=structuredClone(desk);next.actions=next.actions.filter(a=>a.id!==remove.dataset.actionRemove);actionDirty=false;commit(next);});
 });
 el('actionEditForm').addEventListener('input',()=>{actionDirty=true;for(const id of['actionPlan','actionImplement','actionDefer'])el(id).disabled=true;msg('actionStatus',t('说明有未保存修改；保存将清除旧复核，需重新记录。','Unsaved details. Saving changed details clears the previous review.'));});
 el('actionEditForm').addEventListener('submit',event=>{event.preventDefault();run('actionStatus',()=>{
  const next=structuredClone(desk),a=next.actions.find(a=>a.id===actionId),f=event.target;
  const values=Object.fromEntries(['title','owner','dueOn','trigger','risk','evidence','outcome'].map(k=>[k,control(f,k).value.trim()]));values.major=control(f,'major').checked;
  const changed=Object.entries(values).some(([k,v])=>a[k]!==v);if(changed){Object.assign(a,values);a.revision++;a.review=null;a.status='draft';addEvent(a,'edited',t('说明更新，旧复核失效','Details updated; previous review invalidated'));}
  if(event.submitter.value==='review'){
   if(!a.owner||!a.dueOn||!a.trigger||!a.risk)throw new Error(t('请先补全负责人、日期、执行前提和风险。','Complete owner, date, prerequisites and risks.'));
   if(actionAssessment(a,next).stale)throw new Error(t('来源已更新，请重新生成行动再复核。','Sources changed. Regenerate before reviewing.'));
   a.review={reviewer:control(f,'reviewer').value.trim(),reviewedOn:today(),note:control(f,'reviewNote').value.trim(),revision:a.revision};addEvent(a,'reviewed',a.review.reviewer+' · '+a.review.note);
  }
  actionDirty=false;commit(next);closeFormDialog('actionEditor');msg('actionStatus',t('行动说明／自填复核已保存；请保存或导出整个项目。','Action details/self-entered review saved. Save or export the project.'));
 });});
 for(const [id,status]of[['actionPlan','planned'],['actionImplement','implemented'],['actionDefer','deferred']])el(id).addEventListener('click',()=>run('actionStatus',()=>{
  const next=structuredClone(desk),a=next.actions.find(a=>a.id===actionId);if(status!=='deferred')assertCanAdvance(a,next,status);
  a.status=status;addEvent(a,status,a.owner||t('用户记录','User record'));commit(next);msg('actionStatus',t('仅更新用户记录，没有执行采购、核验或申报。','User record updated; no purchase, verification or filing was executed.'));
 }));
 el('actionLoad').addEventListener('click',()=>{const a=desk.actions.find(a=>a.id===actionId);restore(a.proposalInput);navigate('tab-sandbox');msg('actionStatus',t('已载入推演参数，不代表执行行动。','What-if parameters loaded; no action executed.'));});
 resetPolicy();
 return {render(m,language){if(lang!==language)for(const id of['fleetStatus','policyEvidenceStatus','actionStatus'])msg(id,'');lang=language;officialUi.render();current={vessel:{...m.modelVessel,name:language==='zh'?m.vessel.nameZh:m.vessel.nameEn},settings:m.settings};render();},
  getState(){return structuredClone(desk);},replaceState(value){desk=value;dirty=false;policyId='';actionId='';fleetEditId='';policyEditId='';actionDirty=false;el('fleetForm').reset();delete el('fleetForm').dataset.edited;resetPolicy();},
  markSaved(){dirty=false;render();}};
}
