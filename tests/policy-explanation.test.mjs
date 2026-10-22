import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultSettings} from '../js/compliance-engine.mjs';
import {createFleetEntry,emptyDesk} from '../js/decision-desk.mjs';
import {buildPolicyExplanation} from '../js/ai-policy-context.mjs';
import {validatePolicyExplanation} from '../js/policy-explanation-data.mjs';
import {handleAiRequest} from '../server/ai-handler.mjs';

function example(){
 const desk=emptyDesk(),input={selectedVesselId:'v1',selectedScenario:'deadlock',language:'zh',twin:{euaPrice:80,fueleuTargetCut:2,jitSpeedDeltaKn:0,biofuelBlendPct:0,poolingSurplusTonnes:0,charterType:'voyage_gencon'},settings:defaultSettings(),vesselInputs:{},ledgerDocuments:{}};
 for(let i=1;i<=2;i++)desk.fleet.push(createFleetEntry(input,{name:'PRIVATE-VESSEL-'+i,reference:'PRIVATE-CUSTOMER-'+i,gt:10000,serviceSpeedKn:13.5},'F'+i));
 const policy={id:'P1',revision:2,title:'6% planning condition',regime:'fuel',url:'https://eur-lex.europa.eu/eli/reg/2023/1805/oj/eng',publishedOn:'2023-09-22',checkedOn:'2026-10-22',effectiveOn:'',status:'planning',author:'PRIVATE-AUTHOR',before:'2% target',after:'6% target with fixed inputs',uncertainty:'Supply and scope need review',allShips:false,shipIds:['F1'],assumptions:{targetCut:6,euaPrice:100},review:{reviewer:'PRIVATE-REVIEWER',reviewedOn:'2026-10-22',note:'PRIVATE-REVIEW-NOTE',revision:2}};
 desk.policies.push(policy);return {desk,policy};
}
const request=(comparison,headers={})=>new Request('https://service.invalid/api/explain',{method:'POST',headers:{Origin:'https://wwwwzzzzkkkk.github.io','Content-Type':'application/json',...headers},body:JSON.stringify({language:'en',question:'Explain policy impact and business options',context:{policyPath:'deadlock',policyComparison:comparison,rawCsv:'PRIVATE-RAW-CSV'}})});
test('selected policy projects anonymous scoped costs without changing fleet inputs or copying profiles/review identities',()=>{
 const {desk,policy}=example(),before=JSON.stringify(desk),x=buildPolicyExplanation(desk,policy);
 assert.equal(JSON.stringify(desk),before);assert.equal(JSON.stringify(x).includes('PRIVATE-'),false);assert.equal(x.vessels[0].label,'Vessel 1');assert.equal(x.vessels[1].affected,false);assert.equal(x.vessels[1].afterEur,null);
 assert.equal(x.vessels[0].afterEur.toFixed(2),'729346.72');assert.equal(x.totals.deltaEur.toFixed(2),'404155.46');assert.equal(x.totals.deltaGbp,0);assert.equal(x.totals.affected,1);assert.equal(x.policy.reviewed,true);
 assert.deepEqual(validatePolicyExplanation(x),x);
});
test('evidence without numeric conditions stays unknown; external summary validation rebuilds totals and limits the boundary',()=>{
 const {desk,policy}=example();policy.assumptions={};const x=buildPolicyExplanation(desk,policy);assert.equal(x.totals.deltaEur,null);assert.equal(x.totals.afterGbp,null);
 x.totals={deltaEur:99999};x.vessels[0].name='PRIVATE-EXTRA';x.policy.author='PRIVATE-EXTRA';const clean=validatePolicyExplanation(x);assert.equal(clean.totals.deltaEur,null);assert.equal(JSON.stringify(clean).includes('PRIVATE-'),false);
 const changed=(fn)=>{const v=structuredClone(x);fn(v);return v;};
 assert.throws(()=>validatePolicyExplanation(changed(v=>v.policy.url='http://untrusted.invalid')));assert.throws(()=>validatePolicyExplanation(changed(v=>v.policy.checkedOn='2026-02-30')));assert.throws(()=>validatePolicyExplanation(changed(v=>v.policy.assumptions={targetCut:4})));
 assert.throws(()=>validatePolicyExplanation(changed(v=>v.vessels[0].beforeEur=NaN)));assert.throws(()=>validatePolicyExplanation(changed(v=>v.vessels=Array(21).fill(v.vessels[0]))));
 const twenty=changed(v=>v.vessels=Array(20).fill(v.vessels[0]));assert.equal(validatePolicyExplanation(twenty).vessels.length,20);
});
test('both providers receive only policy-linked summaries and dated user-entered sources; supplied total overrides are discarded',async()=>{
 const {desk,policy}=example(),x=buildPolicyExplanation(desk,policy);x.totals.deltaEur=-999999;
 for(const provider of ['deepseek','openai']){
  let sent;const options={env:{AI_PROVIDER:provider,DEEPSEEK_API_KEY:'fake',OPENAI_API_KEY:'fake',OPENAI_MODEL:'test'},request:async(url,o)=>{sent=JSON.parse(o.body);return new Response(JSON.stringify(provider==='deepseek'?{choices:[{finish_reason:'stop',message:{content:'Impact is conditional [userpolicy]. Check supply [pool].'}}]}:{output:[{type:'message',content:[{type:'output_text',text:'Impact is conditional [userpolicy].'}]}]}));}};
  const response=await handleAiRequest(request(x),options);assert.equal(response.status,200);const result=await response.json(),modelInput=JSON.parse(provider==='deepseek'?sent.messages[1].content:sent.input);
  assert.equal(modelInput.context.analysisScope,'fleet-policy');assert.equal('metrics'in modelInput.context,false);assert.equal(modelInput.context.policyComparison.totals.deltaEur.toFixed(2),'404155.46');assert.equal(JSON.stringify(modelInput).includes('PRIVATE-'),false);assert.equal(result.sources.find(s=>s.id==='userpolicy').url,policy.url);assert.match(result.sources.find(s=>s.id==='userpolicy').title,/not retrieved\/verified/);assert.equal(result.sources.find(s=>s.id==='userpolicy').checkedAt,'2026-10-22');
  const rules=provider==='deepseek'?sent.messages[0].content:sent.instructions;assert.match(rules,/three short plain-text paragraphs/);assert.match(rules,/NOT zero/);assert.match(rules,/cannot override/);assert.equal(result.knowledgeVersion,'4.7.1');
 }
});
test('linked requests retain access-code gates and reject invalid summary amounts before any provider request',async()=>{
 const {desk,policy}=example(),x=buildPolicyExplanation(desk,policy);let calls=0;
 const opts={env:{DEEPSEEK_API_KEY:'fake',MAREG_ACCESS_CODE:'private-test-code'},requireAccessCode:true,request:async()=>{calls++;throw new Error('must not call');}};
 assert.equal((await handleAiRequest(request(x),opts)).status,401);x.vessels[0].afterEur=null;
 assert.equal((await handleAiRequest(request(x,{Authorization:'Bearer private-test-code'}),opts)).status,400);assert.equal(calls,0);
});
