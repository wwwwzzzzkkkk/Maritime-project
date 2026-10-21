import test from'node:test';import assert from'node:assert/strict';
import{defaultSettings}from'../js/compliance-engine.mjs';import{validateWorkspace,validateAnalysis}from'../js/analysis-state.mjs';
import{emptyDesk,validateDesk,validatePolicy,createFleetEntry,fleetSummary,withPolicy,createAction,actionAssessment,assertCanAdvance}from'../js/decision-desk.mjs';
import{buildDecisionReport}from'../js/decision-report.mjs';
const input=()=>({selectedVesselId:'v1',selectedScenario:'deadlock',language:'zh',twin:{euaPrice:80,fueleuTargetCut:2,jitSpeedDeltaKn:0,biofuelBlendPct:0,poolingSurplusTonnes:0,charterType:'voyage_gencon'},settings:{...defaultSettings(),operationsConfirmed:true,fuelConfirmed:true,poolConfirmed:true},vesselInputs:{},ledgerDocuments:{}});
const profile=n=>({name:'Ship '+n,reference:'REF-'+n,gt:10000,serviceSpeedKn:13.5});
const policy=()=>({id:'P1',revision:1,title:'6% planning condition',regime:'fuel',url:'https://eur-lex.europa.eu/eli/reg/2023/1805/oj/eng',publishedOn:'2023-09-22',checkedOn:'2026-10-21',effectiveOn:'',status:'planning',author:'Alice',before:'2% condition',after:'6% condition, fixed activity',uncertainty:'Scope and certification unverified',allShips:true,shipIds:[],assumptions:{targetCut:6,euaPrice:100},review:null});
function data(count=1){const d=emptyDesk();for(let i=1;i<=count;i++)d.fleet.push(createFleetEntry(input(),profile(i),'F'+i));return d;}
function action(d){const a=createAction(d,'F1','pooling','','A1','2026-10-21');a.title='Review pooling';return a;}
test('five and twenty independent vessels aggregate currencies separately; profiles survive a workspace round trip',()=>{
 const d=data(5),s=fleetSummary(d);assert.ok(Math.abs(s.eur-325191.2663755457*5)<1e-6);assert.equal(s.gbp,13200*5);assert.equal(input().twin.euaPrice,80);
 d.fleet[0].input.twin.euaPrice=100;assert.equal(d.fleet[1].input.twin.euaPrice,80);
 const w={schema:'mareg-workspace-v1',name:'Fleet',input:input(),cases:[],desk:d};const restored=validateWorkspace(JSON.parse(JSON.stringify(w)));assert.deepEqual(restored.desk,d);
 assert.equal(validateDesk(data(20),validateAnalysis).fleet.length,20);assert.throws(()=>validateDesk(data(21),validateAnalysis));
 d.fleet[1].input.vesselProfile.reference='REF-1';assert.throws(()=>validateDesk(d,validateAnalysis));
});
test('policy scope and explicit conditions do not mutate baseline inputs or invent zero impact for evidence-only records',()=>{
 const d=data(2),p=policy();p.allShips=false;p.shipIds=['F1'];d.policies.push(p);const original=JSON.stringify(d.fleet[0].input),s=fleetSummary(d,p);
 assert.equal(s.affected,1);assert.equal(s.rows[0].after.comparison.active.euEts,110000);assert.equal(s.rows[0].after.comparison.active.fuelEu.toFixed(2),'619346.72');assert.equal(s.rows[1].deltaEur,null);assert.equal(s.rows[0].deltaGbp,0);assert.equal(JSON.stringify(d.fleet[0].input),original);
 const noNumbers={...p,assumptions:{}};assert.equal(fleetSummary(d,noNumbers).rows[0].deltaEur,null);assert.equal(withPolicy(d.fleet[0].input,p).twin.fueleuTargetCut,6);
 assert.throws(()=>validatePolicy({...p,url:'javascript:alert(1)'}));assert.throws(()=>validatePolicy({...p,publishedOn:'2026-02-30'}));assert.throws(()=>validatePolicy({...p,assumptions:{euaPrice:83}}));
});
test('team review is self-entered, distinct from the author, and bound to the source revision',()=>{
 const p=policy();p.review={reviewer:'alice',note:'Checked',reviewedOn:'2026-10-21',revision:1};assert.throws(()=>validatePolicy(p));
 p.review.reviewer='Bob';assert.equal(validatePolicy(p).review.reviewer,'Bob');p.review.revision=2;assert.throws(()=>validatePolicy(p));
});
test('action snapshots preserve pooling physical estimates and expose input/policy changes as stale',()=>{
 const d=data();d.policies=[policy()];d.policies[0].review={reviewer:'Bob',reviewedOn:'2026-10-21',note:'Source and assumptions checked',revision:1};
 const a=action(d);d.actions.push(a);const x=actionAssessment(a,d);assert.equal(x.baseline.physicalDelta,0);assert.ok(x.baseline.eur<0);assert.equal(x.baseline.gbp,0);assert.equal(x.scenarios.length,1);assert.equal(x.stale,false);
 const snapshot=JSON.stringify(a.baseInput);d.fleet[0].revision++;assert.equal(actionAssessment(a,d).stale,true);assert.equal(JSON.stringify(a.baseInput),snapshot);d.fleet[0].revision--;d.policies[0].revision++;assert.equal(actionAssessment(a,d).stale,true);
});
test('planning and self-reported implementation require fresh review, confirmed inputs, evidence and outcomes',()=>{
 const d=data(),a=action(d);d.actions.push(a);assert.throws(()=>assertCanAdvance(a,d,'planned'));
 Object.assign(a,{owner:'Alice',dueOn:'2026-11-01',trigger:'Supply and scope checked',risk:'Not verified',review:{reviewer:'Bob',reviewedOn:'2026-10-21',revision:1,note:'Review'}});assert.doesNotThrow(()=>assertCanAdvance(a,d,'planned'));assert.throws(()=>assertCanAdvance(a,d,'implemented'));
 a.evidence='Internal record E1';a.outcome='User-reported outcome, not assured';assert.doesNotThrow(()=>assertCanAdvance(a,d,'implemented'));a.baseInput.settings.operationsConfirmed=false;a.proposalInput.settings.operationsConfirmed=false;assert.throws(()=>assertCanAdvance(a,d,'planned'));
});
test('extended reports retain fleet currencies, policy evidence, frozen action sources and escaped user text',()=>{
 const d=data(5);d.policies=[policy()];d.policies[0].review={reviewer:'Frozen reviewer Bob',reviewedOn:'2026-10-21',note:'Original source reviewed',revision:1};const a=action(d);d.policies[0].revision=2;d.policies[0].review={reviewer:'Current reviewer Carol',reviewedOn:'2026-10-21',note:'Updated evidence reviewed',revision:2};a.title='<img src=x onerror=alert(1)>';d.actions=[a];
 const file=validateWorkspace({schema:'mareg-workspace-v1',name:'Project',input:input(),cases:[],desk:d});const html=buildDecisionReport(file);
 assert.ok(html.includes('8. 船队'));assert.ok(html.includes('9. 政策'));assert.ok(html.includes('10. 行动'));assert.ok(html.includes('£66,000'));assert.ok(html.includes('6% planning condition'));assert.ok(html.includes('&lt;img'));assert.equal(html.includes('<img'),false);assert.ok(html.includes('不是防篡改审计'));assert.ok(html.includes('自报'));assert.ok(html.includes('Frozen reviewer Bob'));assert.ok(html.includes('Current reviewer Carol'));
 const broken=structuredClone(file);delete broken.desk.actions[0].baseInput.vesselProfile;assert.throws(()=>validateWorkspace(broken),/行动快照/);
 const legacy=validateWorkspace({schema:'mareg-workspace-v1',name:'Old',input:input(),cases:[]});assert.equal('desk'in legacy,false);assert.equal('vesselProfile'in legacy.input,false);
});
