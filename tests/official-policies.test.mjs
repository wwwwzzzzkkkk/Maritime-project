import test from 'node:test';
import assert from 'node:assert/strict';
import {OFFICIAL_POLICY_SOURCES,validateOfficialSnapshot} from '../js/official-policy-catalog.mjs';
import {fetchOfficialSnapshot,extractOfficialText,handleOfficialPolicyRequest,createMemoryPolicyCache} from '../server/official-policies.mjs';
import {validatePolicy,emptyDesk,createFleetEntry} from '../js/decision-desk.mjs';
import {validateWorkspace} from '../js/analysis-state.mjs';
import {defaultSettings} from '../js/compliance-engine.mjs';
import {buildPolicyExplanation} from '../js/ai-policy-context.mjs';
import {validatePolicyExplanation} from '../js/policy-explanation-data.mjs';
import {handleAiRequest} from '../server/ai-handler.mjs';
const prose='Official maritime guidance explains reporting boundaries, fuel use and emissions. '.repeat(6);
const html=title=>'<html><head><title>'+title+'</title></head><body><nav>Navigation must not appear</nav><main><script>PRIVATE SCRIPT</script><!-- comment --><h1>'+title+'</h1><p>'+prose+'&amp; costs &pound;60.</p></main></body></html>';
const response=(source)=>source.format==='govuk'?new Response(JSON.stringify({title:'UK maritime guidance',first_published_at:'2026-06-22T12:00:00+01:00',public_updated_at:'2026-06-22T12:00:00+01:00',details:{body:'<p>'+prose+'</p>'}}),{headers:{'Content-Type':'application/json'}}):new Response(html(source.en),{headers:{'Content-Type':'text/html'}});
const fixed=()=>new Date('2026-10-22T05:00:00.000Z');
async function snapshot(source=OFFICIAL_POLICY_SOURCES[0]){return fetchOfficialSnapshot(source,{request:async()=>response(source),now:fixed});}
test('official HTML/API extraction records real retrieval metadata and leaves missing source dates unknown',async()=>{
 const eu=await snapshot();assert.equal(eu.retrievedAt,fixed().toISOString());assert.equal(eu.publishedOn,null);assert.equal(eu.updatedAt,null);assert.equal(eu.excerpt.includes('PRIVATE'),false);assert.equal(eu.excerpt.includes('Navigation'),false);assert.ok(eu.excerpt.includes('& costs £60.'));assert.equal(eu.excerpt.includes('-->'),false);
 const uk=await snapshot(OFFICIAL_POLICY_SOURCES[2]);assert.equal(uk.publishedOn,'2026-06-22');assert.equal(uk.updatedAt,'2026-06-22T11:00:00.000Z');assert.equal(uk.url,OFFICIAL_POLICY_SOURCES[2].url);assert.deepEqual(validateOfficialSnapshot(uk),uk);
});
test('official retrieval rejects off-site redirects, challenge pages and oversized external responses',async()=>{
 const source=OFFICIAL_POLICY_SOURCES[0];
 await assert.rejects(fetchOfficialSnapshot(source,{request:async()=>new Response(null,{status:302,headers:{Location:'https://untrusted.invalid/private'}})}),/left configured/);
 await assert.rejects(fetchOfficialSnapshot(source,{request:async()=>new Response(html('Just a moment'),{headers:{'Content-Type':'text/html'}})}),/challenged/);
 await assert.rejects(fetchOfficialSnapshot(source,{request:async()=>new Response('large',{headers:{'Content-Type':'text/html','Content-Length':'2000001'}})}),/too large/);
 await assert.rejects(fetchOfficialSnapshot(source,{request:async()=>new Response('',{status:503})}),/HTTP 503/);
});
test('the public source endpoint uses only four configured URLs, caches successful fetches and exposes partial failure',async()=>{
 let calls=0;const urls=[],cache=createMemoryPolicyCache(),options={cache,request:async(url,init)=>{calls++;urls.push(url);assert.equal('Authorization'in init.headers,false);const source=OFFICIAL_POLICY_SOURCES.find(s=>s.fetchUrl===url);assert.ok(source);return source.id==='imo-iswg22'?new Response('',{status:503}):response(source);}};
 const req=()=>new Request('https://service.invalid/api/policies',{headers:{Origin:'https://wwwwzzzzkkkk.github.io'}});
 const first=await(await handleOfficialPolicyRequest(req(),options)).json();assert.equal(first.items.filter(i=>i.status==='ok').length,3);assert.equal(first.items.find(i=>i.sourceId==='imo-iswg22').reason,'HTTP 503');assert.equal(calls,4);
 const second=await(await handleOfficialPolicyRequest(req(),options)).json();assert.equal(second.items.filter(i=>i.cached).length,3);assert.equal(calls,5);
 for(const request of [new Request('https://service.invalid/api/policies?url=https://untrusted.invalid'),new Request('https://service.invalid/api/policies',{method:'POST'}),new Request('https://service.invalid/api/policies',{headers:{Origin:'https://untrusted.invalid'}})])assert.ok([400,403,405].includes((await handleOfficialPolicyRequest(request,options)).status));assert.equal(calls,5);
});
test('retrieved evidence can retain an unknown publication date and survive workspace recovery without approving conditions',async()=>{
 const retrieval=await snapshot();const p={id:'P',revision:1,title:'Official excerpt',regime:'eu',url:retrieval.url,publishedOn:'',checkedOn:'2026-10-22',effectiveOn:'',status:'planning',author:'Official retrieval / 自动获取',before:'Existing input',after:retrieval.excerpt,uncertainty:'Applicability needs review',allShips:true,shipIds:[],assumptions:{},review:null,retrieval};
 assert.deepEqual(validatePolicy(p),p);assert.throws(()=>validatePolicy({...p,retrieval:undefined}));assert.throws(()=>validatePolicy({...p,url:'https://example.invalid'}));
 const input={selectedVesselId:'v1',selectedScenario:'deadlock',language:'en',twin:{euaPrice:80,fueleuTargetCut:2,jitSpeedDeltaKn:0,biofuelBlendPct:0,poolingSurplusTonnes:0,charterType:'voyage_gencon'},settings:defaultSettings(),vesselInputs:{},ledgerDocuments:{}};
 const desk=emptyDesk();desk.policies.push(p);desk.fleet.push(createFleetEntry(input,{name:'PRIVATE VESSEL',reference:'PRIVATE REF',gt:10000,serviceSpeedKn:13.5},'F'));
 const w=validateWorkspace(JSON.parse(JSON.stringify({schema:'mareg-workspace-v1',name:'Test',input,cases:[],desk})));assert.equal(w.desk.policies[0].retrieval.retrievedAt,retrieval.retrievedAt);assert.equal(w.desk.policies[0].review,null);
 const summary=buildPolicyExplanation(w.desk,w.desk.policies[0]);assert.equal(summary.totals.deltaEur,null);assert.equal(JSON.stringify(summary).includes('PRIVATE'),false);assert.deepEqual(validatePolicyExplanation(summary,validateOfficialSnapshot),summary);
});
test('AI receives saved retrieval provenance distinctly from legal verification, without fetching arbitrary policy URLs',async()=>{
 const retrieval=await snapshot();const comparison={schema:'mareg-policy-explanation-v1',modelVersion:'light-4.2.0',policy:{title:'Source',regime:'eu',url:retrieval.url,publishedOn:'',checkedOn:'2026-10-22',effectiveOn:'',status:'planning',revision:1,before:'Before',after:'After',uncertainty:'Unknown scope',coverage:'all',reviewed:false,assumptions:{},retrieval},vessels:[{label:'Vessel 1',affected:true,beforeEur:325191,beforeGbp:13200,afterEur:null,afterGbp:null}]};
 let called=0,sent;
 const response=await handleAiRequest(new Request('https://service.invalid/api/explain',{method:'POST',headers:{Origin:'https://wwwwzzzzkkkk.github.io','Content-Type':'application/json'},body:JSON.stringify({language:'en',question:'Explain this source',context:{policyPath:'deadlock',policyComparison:comparison}})}),{env:{DEEPSEEK_API_KEY:'fake'},request:async(url,options)=>{called++;assert.equal(url,'https://api.deepseek.com/chat/completions');sent=JSON.parse(options.body);return new Response(JSON.stringify({choices:[{finish_reason:'stop',message:{content:'Saved excerpt, applicability unverified [userpolicy].'}}]}));}});
 assert.equal(response.status,200);assert.equal(called,1);const output=await response.json();assert.match(output.sources[0].title,/Saved official-page retrieval/);assert.equal(JSON.parse(sent.messages[1].content).context.policyComparison.policy.retrieval.retrievedAt,retrieval.retrievedAt);
});
