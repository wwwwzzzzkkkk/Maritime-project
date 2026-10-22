import {validateAnalysis,evaluateAnalysis} from './analysis-state.mjs?v=4.7.2';
import {planOptions,assessOption} from './option-planner.mjs?v=4.7.2';
export {emptyDesk,validateDesk,validatePolicy,validateVesselProfile} from './decision-data.mjs?v=4.7.2';
export const appliesTo=(policy,fleetId)=>policy.allShips||policy.shipIds.includes(fleetId);
export const hasConditions=policy=>Object.keys(policy.assumptions).length>0;
export function withPolicy(input,policy){
 const next=structuredClone(input),a=policy.assumptions;
 if('euaPrice'in a)next.twin.euaPrice=a.euaPrice;
 if('targetCut'in a)next.twin.fueleuTargetCut=a.targetCut;
 for(const key of['ukPrice','poolPrice','poolAvailable'])if(key in a)next.settings[key]=a[key];
 return next; // A conditional copy only; never changes the active analysis or legal rules.
}
export function fleetSummary(desk,policy=null){
 const rows=desk.fleet.map(entry=>{
  const before=evaluateAnalysis(entry.input),affected=Boolean(policy&&appliesTo(policy,entry.id));
  const quantified=affected&&hasConditions(policy),after=quantified?evaluateAnalysis(withPolicy(entry.input,policy)):before;
  const b=before.comparison.active,a=after.comparison.active;
  return {entry,before,after,affected,quantified,eur:a.totalEur,gbp:a.ukEts,deltaEur:quantified?a.totalEur-b.totalEur:null,deltaGbp:quantified?a.ukEts-b.ukEts:null,
   dataMode:entry.input.ledgerDocuments[entry.input.selectedVesselId]?'ledger':'template',targetCut:after.settings.year>=2030?6:2};
 });
 return {rows,eur:rows.reduce((s,r)=>s+r.eur,0),gbp:rows.reduce((s,r)=>s+r.gbp,0),affected:rows.filter(r=>r.affected).length,
 quantified:rows.filter(r=>r.quantified).length,deltaEur:rows.reduce((s,r)=>s+(r.deltaEur??0),0),deltaGbp:rows.reduce((s,r)=>s+(r.deltaGbp??0),0),
 mixedTargets:new Set(rows.map(r=>r.targetCut)).size>1,templateCount:rows.filter(r=>r.dataMode==='template').length};
}
export function createFleetEntry(input,profile,id){
 const next=structuredClone(input);next.vesselProfile=profile;
 return {id,revision:1,input:validateAnalysis(next)};
}
export function createAction(desk,fleetId,kind,policyId,id,today){
 const entry=desk.fleet.find(e=>e.id===fleetId);if(!entry)throw new Error('请选择船舶 / Select a vessel');
 const policy=policyId?desk.policies.find(p=>p.id===policyId):null;
 if(policyId&&(!policy||!appliesTo(policy,fleetId)))throw new Error('政策不适用于所选船舶 / Policy does not cover the selected vessel');
 const basis=evaluateAnalysis(policy?withPolicy(entry.input,policy):entry.input),plan=planOptions(basis.vessel,basis.settings);
 const candidate=kind==='recommendation'?plan.recommendation:plan.rows.find(r=>r.id===kind);
 if(!candidate)throw new Error('候选方案无效 / Invalid option');
 const proposal=structuredClone(entry.input);
 proposal.twin.jitSpeedDeltaKn=candidate.speedDelta;proposal.twin.biofuelBlendPct=candidate.blendPct;
 proposal.twin.poolingSurplusTonnes=candidate.allocatedPoolTonnes>0?Math.max(entry.input.settings.poolAvailable,policy?.assumptions.poolAvailable??0):0;
 return {id,revision:1,fleetId,fleetRevision:entry.revision,title:'',owner:'',dueOn:'',trigger:'',risk:'',major:false,status:'draft',review:null,evidence:'',outcome:'',events:[{on:today,kind:'created',revision:1,note:'Generated from stored inputs / 基于已存输入生成'}],
 baseInput:structuredClone(entry.input),proposalInput:validateAnalysis(proposal),policySnapshots:structuredClone(desk.policies.filter(p=>appliesTo(p,fleetId))),createdOn:today};
}
function delta(base,proposal,policy){
 const b=evaluateAnalysis(policy?withPolicy(base,policy):base),p=evaluateAnalysis(policy?withPolicy(proposal,policy):proposal);
 const x=p.comparison.active,y=b.comparison.active,limits=assessOption({...x,blendPct:p.settings.blendPct},p.settings);
 return {eur:x.totalEur-y.totalEur,gbp:x.ukEts-y.ukEts,extraHours:x.extraHours,physicalDelta:x.physicalWtWTonnes-y.physicalWtWTonnes,
  withinLimits:limits.withinLimits,pending:limits.pending,reasons:limits.reasons,baseEur:y.totalEur,proposalEur:x.totalEur,baseGbp:y.ukEts,proposalGbp:x.ukEts};
}
export function actionAssessment(action,desk){
 const entry=desk.fleet.find(e=>e.id===action.fleetId),currentPolicies=desk.policies.filter(p=>appliesTo(p,action.fleetId));
 const signature=list=>list.map(p=>p.id+':'+p.revision).sort().join('|');
 const stale=entry.revision!==action.fleetRevision||signature(currentPolicies)!==signature(action.policySnapshots);
 const baseline={id:'baseline',title:null,policy:null,...delta(action.baseInput,action.proposalInput,null)};
 const scenarios=action.policySnapshots.filter(hasConditions).map(p=>({id:p.id,title:p.title,policy:p,...delta(action.baseInput,action.proposalInput,p)}));
 const rows=[baseline,...scenarios],nonIncreasing=rows.every(r=>r.eur<=.005&&r.gbp<=.005),withinLimits=rows.every(r=>r.withinLimits),pending=[...new Set(rows.flatMap(r=>r.pending))];
 const sourcesReviewed=action.policySnapshots.every(p=>p.review!==null);
 return {baseline,scenarios,stale,nonIncreasing,withinLimits,pending,sourcesReviewed,
  reviewCurrent:Boolean(action.review&&action.review.revision===action.revision&&!stale),
  robustness:scenarios.length?(nonIncreasing&&withinLimits?'non-increasing':'scenario-dependent'):'baseline-only'};
}
export function assertCanAdvance(action,desk,status){
 const a=actionAssessment(action,desk);
 if(!a.reviewCurrent)throw new Error('请先保存最新说明并记录另一位成员复核；来源更新后须重新生成行动 / Record a fresh second-person review; regenerate after source changes');
 if(!a.sourcesReviewed)throw new Error('关联政策还没有团队复核记录 / Linked policies need a team review record');
 if(!a.withinLimits||a.pending.length)throw new Error('运营限制或输入确认尚未满足；请更新船舶分析后重新生成 / Resolve limits/input confirmations, update the vessel and regenerate');
 if(!action.owner||!action.dueOn||!action.trigger||!action.risk)throw new Error('请填写负责人、日期、前提和风险 / Complete owner, date, trigger and risks');
 if(status==='implemented'&&(!action.evidence.trim()||!action.outcome.trim()))throw new Error('请记录实施凭证和实际结果；这些仍是用户自报 / Record implementation evidence and outcomes; these remain self-reported');
}
