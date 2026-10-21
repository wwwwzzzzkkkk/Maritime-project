import {fleetSummary,actionAssessment} from './decision-desk.mjs?v=4.6.0';
export function decisionSections(desk,language,h){
 const zh=language==='zh',t=(z,e)=>zh?z:e,{esc,section,table,items,eur,gbp,n}=h;
 if(!desk.fleet.length&&!desk.policies.length&&!desk.actions.length)return '';
 const legal=p=>({planning:t('用户规划假设','User planning assumption'),proposal:t('用户标注草案','User-marked proposal'),'in-force':t('用户标注已生效，非核验','User-marked in force, not verified')})[p.status];
 const f=fleetSummary(desk);
 let html=section(t('8. 船队年度范围内汇总','8. Scoped annual fleet summary'),
  '<p>'+t('仅2026活动输入的已存快照；EUR与GBP独立汇总，不是完整航次成本，年度完整性及范围仍待核。','Stored 2026-activity snapshots only. Currencies stay separate; not full voyage costs. Annual completeness/scope remain unverified.')+'</p>'+
  (f.rows.length?'<p>EUR '+eur(f.eur)+' · GBP '+gbp(f.gbp)+' · '+desk.fleet.length+' '+t('艘记录','vessel records')+'</p>':'<p>'+t('尚无船队记录，总额不可用。','No fleet records; totals unavailable.')+'</p>')+
  (f.mixedTargets?'<p>'+t('记录混合了2%和6%目标条件；可比性须核对，不能称为已核验2030账户。','Records mix2% and6% target conditions. Check comparability; not a verified 2030 account.')+'</p>':'')+
  table([t('船舶／编号','Vessel / reference'),'EUR','GBP',t('目标／来源','Target / data')],f.rows.map(r=>[esc(r.entry.input.vesselProfile.name)+'<br>'+esc(r.entry.input.vesselProfile.reference)+' · v'+r.entry.revision,eur(r.eur),gbp(r.gbp),r.targetCut+'% · '+(r.dataMode==='ledger'?t('用户台账未核验','User ledger, unverified'):t('模板范围推演','Template-scope what-if'))])));
 html+=section(t('9. 政策证据及显式影响条件','9. Policy evidence and explicit conditions'),'<p>'+t('资料由用户维护，不是实时监测。法律状态和复核姓名为自填，不验证身份、不代表专家批准；条件不自动更新法律规则。','User-maintained evidence, not live monitoring. Status/reviewer names are self-entered without identity verification or expert approval; conditions do not update legal rules.')+'</p>'+
  desk.policies.map(p=>{
   const impact=fleetSummary(desk,p),quantified=Object.keys(p.assumptions).length>0;
   return '<article><h3>'+esc(p.title)+' · v'+p.revision+'</h3><p><a href="'+esc(p.url)+'" target="_blank" rel="noopener noreferrer">'+esc(p.url)+'</a></p>'+
   items([legal(p),t('发布／核对／生效：','Published / checked / effective: ')+p.publishedOn+' / '+p.checkedOn+' / '+(p.effectiveOn||t('未知','Unknown')),
    t('整理人：','Prepared by: ')+esc(p.author),t('原条件：','Previous: ')+esc(p.before),t('变化：','Change: ')+esc(p.after),t('不确定性：','Uncertainty: ')+esc(p.uncertainty),
    p.review?t('自填复核：','Self-entered review: ')+esc(p.review.reviewer)+' · '+p.review.reviewedOn+' · '+esc(p.review.note):t('尚无团队复核记录','No team review record')])+
   '<p>'+t('用户数值条件：','User numeric conditions: ')+esc(Object.entries(p.assumptions).map(([k,v])=>({euaPrice:'EUA €/t',ukPrice:'UKA £/t',targetCut:'FuelEU %',poolPrice:'€/tCB',poolAvailable:'tCB'})[k]+'='+v).join('; ')||t('未定义，不能认定成本影响为零','Not defined; zero impact not established'))+'</p>'+
   (quantified?table([t('船舶','Vessel'),t('条件EUR','Conditional EUR'),t('EUR差额','EUR change'),t('GBP差额','GBP change')],impact.rows.filter(r=>r.affected).map(r=>[esc(r.entry.input.vesselProfile.name),eur(r.eur),eur(r.deltaEur),gbp(r.deltaGbp)])):'')+'</article>';
  }).join(''));
 html+=section(t('10. 行动建议、团队复核与实施记录','10. Actions, team review and implementation records'),
  '<p>'+t('记录可编辑、仅本机保存，不是防篡改审计、真实采购、外部核验或申报。实施与凭证位置为用户自报，不承诺实际节省或经认证减排。','Editable local records are not tamper-proof audit, procurement, external verification or filing. Implementation/evidence locations are self-reported, not realised savings or certified reductions.')+'</p>'+
  desk.actions.map(a=>{
   const x=actionAssessment(a,desk),v=a.baseInput.vesselProfile;
   const robustness=x.robustness==='baseline-only'?t('仅基准条件，没有跨情景证据','Baseline only; no cross-scenario evidence'):x.robustness==='non-increasing'?t('所列条件下两种货币费用均未上升，不保证可执行','Neither currency increased under listed conditions; execution not guaranteed'):t('费用或可行性依赖情景','Cost or feasibility depends on the scenario');
   const status={draft:t('待完善／复核','Draft / review needed'),planned:t('用户记录计划中','User-recorded planned'),implemented:t('用户自报已实施','Self-reported implemented'),deferred:t('已记录暂缓','Deferred')}[a.status];
   return '<article><h3>'+esc(v.name)+' · '+esc(a.title)+' · v'+a.revision+'</h3>'+
    items([t('船舶编号／源版本：','Vessel reference / source revision: ')+esc(v.reference)+' / v'+a.fleetRevision,
     t('状态：','Status: ')+status+(x.stale?t('；来源更新，需重新生成与复核','; sources updated, regenerate and review'):''),
     t('负责人／计划日期：','Owner / due date: ')+esc(a.owner||t('待填','Unassigned'))+' / '+(a.dueOn||t('待填','Unassigned')),
     t('执行前提：','Prerequisites: ')+esc(a.trigger),t('风险：','Risks: ')+esc(a.risk),
     a.major?t('涉及重大支出：仍需另行专业复核','Material expenditure: separate professional review required'):t('重大支出标记未勾选，不表示无风险','Material-spend flag unset; risk is not zero'),
     a.review?t('自填复核：','Self-entered review: ')+esc(a.review.reviewer)+' · '+a.review.reviewedOn+' · '+esc(a.review.note):t('尚无团队复核记录','No team review record'),
     t('复核／来源状态：','Review/source currency: ')+(x.reviewCurrent&&x.sourcesReviewed?t('来源版本相符，仍非外部核验','Source revisions match; still not external verification'):t('需复核或重新生成','Review or regeneration required')),
     robustness,t('原条件下范围内WtW模型变化：','Scoped WtW model change: ')+n(x.baseline.physicalDelta)+' tCO₂e'])+
    table([t('比较条件','Condition'),t('原EUR','Original EUR'),t('候选EUR','Candidate EUR'),t('EUR差额','EUR change'),t('GBP差额','GBP change'),t('新增航时','Extra time')],
     [{...x.baseline,title:t('原输入','Original inputs')},...x.scenarios].map(r=>[esc(r.title),eur(r.baseEur),eur(r.proposalEur),eur(r.eur),gbp(r.gbp),n(r.extraHours)+' h']))+
    '<p>'+t('候选参数：','Candidate parameters: ')+n(a.proposalInput.twin.jitSpeedDeltaKn)+' kn / '+n(a.proposalInput.twin.biofuelBlendPct)+'% / '+n(a.proposalInput.twin.poolingSurplusTonnes)+' tCB '+t('请求','requested')+'</p>'+
    '<p>'+t('实施凭证：','Implementation evidence: ')+esc(a.evidence||t('未记录','Not recorded'))+'</p><p>'+t('实际结果：','Actual outcome: ')+esc(a.outcome||t('未记录','Not recorded'))+'</p>'+
    '<p>'+t('生成时来源快照：','Source snapshots at generation: ')+esc(a.policySnapshots.map(p=>p.title+' v'+p.revision+' ('+p.checkedOn+')').join('; ')||t('无政策证据','No policy evidence'))+'</p>'+
    a.policySnapshots.map(p=>'<div><h4>'+t('冻结来源：','Frozen source: ')+esc(p.title)+' · v'+p.revision+'</h4><p><a href="'+esc(p.url)+'" target="_blank" rel="noopener noreferrer">'+esc(p.url)+'</a></p>'+items([legal(p),p.publishedOn+' / '+p.checkedOn+' / '+(p.effectiveOn||t('生效日期未知','Effective date unknown')),t('整理人：','Preparer: ')+esc(p.author),t('原条件：','Previous: ')+esc(p.before),t('变化：','Change: ')+esc(p.after),t('待核：','Uncertainty: ')+esc(p.uncertainty),t('数值条件：','Numeric conditions: ')+esc(Object.entries(p.assumptions).map(([k,v])=>k+'='+v).join('; ')||t('无','None')),p.review?t('自填复核：','Self-entered review: ')+esc(p.review.reviewer)+' · '+p.review.reviewedOn+' · '+esc(p.review.note):t('生成时尚无复核','No review at generation')])+'</div>').join('')+
    items(a.events.map(e=>e.on+' · '+e.kind+' · v'+e.revision+' · '+esc(e.note)))+'</article>';
  }).join(''));
 return html;
}
