import test from 'node:test';import assert from 'node:assert/strict';import{once}from'node:events';
import{createExplainServer}from'../server/explain.mjs';import{computeScenario,defaultSettings}from'../js/compliance-engine.mjs';import{vessels}from'../js/light-data.mjs';
import {handleAiRequest} from '../server/ai-handler.mjs';
async function server(t,options){const s=createExplainServer(options);s.listen(0,'127.0.0.1');await once(s,'listening');t.after(()=>new Promise(r=>s.close(r)));return 'http://127.0.0.1:'+s.address().port;}
test('unconfigured local AI service reports disabled without contacting a provider',async t=>{
 const url=await server(t,{env:{},request:()=>{throw new Error('must not call provider');}});const health=await(await fetch(url+'/api/health')).json();assert.equal(health.configured,false);const r=await fetch(url+'/api/explain',{method:'POST',headers:{Origin:'http://127.0.0.1:48184','Content-Type':'application/json'},body:'{}'});assert.equal(r.status,503);
});
test('configured AI contract keeps keys server-side, limits context, disables storage and returns dated citations (mock provider)',async t=>{
 let sent;const url=await server(t,{env:{AI_PROVIDER:'openai',OPENAI_API_KEY:'test-not-a-real-key',OPENAI_MODEL:'test-model'},request:async(endpoint,options)=>{sent={endpoint,options,body:JSON.parse(options.body)};return new Response(JSON.stringify({output:[{type:'reasoning'},{type:'message',content:[{type:'output_text',text:'Cost is a CO2 subtotal [eu]. Pooling is conditional [pool].'}]}]}),{status:200});}});
 const r=await fetch(url+'/api/explain',{method:'POST',headers:{Origin:'http://127.0.0.1:48184','Content-Type':'application/json'},body:JSON.stringify({language:'en',question:'解释预算和来源',context:{cases:[],assumptions:defaultSettings(),policyPath:'deadlock',metrics:computeScenario(vessels[0],defaultSettings()),ledgerMode:false,rawCsv:'PRIVATE-RAW-INPUT'}})});
 assert.equal(r.status,200);const data=await r.json();assert.deepEqual(data.sources.map(s=>s.id),['eu','pool']);assert.equal(sent.body.store,false);assert.equal(JSON.parse(sent.body.input).question,'解释预算和来源');assert.equal(sent.options.headers.Authorization,'Bearer test-not-a-real-key');assert.equal(JSON.stringify(data).includes('test-not-a-real-key'),false);assert.equal(sent.body.input.includes('PRIVATE-RAW-INPUT'),false);assert.equal(data.reviewRequired,true);
});
test('AI service rejects other origins and nonfinite or malformed external input',async t=>{
 const url=await server(t,{env:{AI_PROVIDER:'openai',OPENAI_API_KEY:'test',OPENAI_MODEL:'test'},request:()=>{throw new Error('must not call provider');}});
 assert.equal((await fetch(url+'/api/health',{headers:{Origin:'https://untrusted.invalid'}})).status,403);
 assert.equal((await fetch(url+'/api/explain',{method:'POST',headers:{Origin:'http://127.0.0.1:48184','Content-Type':'application/json'},body:'{'})).status,400);
 assert.equal((await fetch(url+'/api/explain',{method:'POST',headers:{Origin:'http://127.0.0.1:48184','Content-Type':'application/json'},body:'null'})).status,400);
 assert.equal((await fetch(url+'/api/explain',{method:'POST',headers:{Origin:'http://127.0.0.1:48184','Content-Type':'application/json'},body:JSON.stringify({language:'zh',question:'test',context:{policyPath:'deadlock',metrics:{}}})})).status,400);
});


test('DeepSeek uses the documented Flash model/chat endpoint and returns only final cited text (mock provider)',async t=>{
 let sent;const url=await server(t,{env:{AI_PROVIDER:'deepseek',DEEPSEEK_API_KEY:'deepseek-test-not-real',OPENAI_API_KEY:'must-not-use'},request:async(endpoint,options)=>{sent={endpoint,options,body:JSON.parse(options.body)};return new Response(JSON.stringify({choices:[{finish_reason:'stop',message:{role:'assistant',content:'预算仅为 CO₂ 部分 [eu]。',reasoning_content:'Do not expose hidden reasoning'}}]}));}});
 const health=await(await fetch(url+'/api/health')).json();assert.equal(health.provider,'deepseek');assert.equal(health.model,'deepseek-flash');assert.equal(health.configured,true);assert.equal(JSON.stringify(health).includes('deepseek-test-not-real'),false);
 const response=await fetch(url+'/api/explain',{method:'POST',headers:{Origin:'http://127.0.0.1:48184','Content-Type':'application/json'},body:JSON.stringify({language:'zh',question:'解释预算',context:{cases:[],assumptions:defaultSettings(),policyPath:'deadlock',metrics:computeScenario(vessels[0],defaultSettings()),ledgerMode:false,rawCsv:'PRIVATE-CSV'}})});
 assert.equal(response.status,200);const result=await response.json();assert.equal(sent.endpoint,'https://api.deepseek.com/chat/completions');assert.equal(sent.body.model,'deepseek-flash');assert.equal(sent.options.headers.Authorization,'Bearer deepseek-test-not-real');assert.equal(sent.body.thinking.type,'disabled');assert.equal(sent.body.stream,false);assert.equal(sent.body.max_tokens,1400);assert.equal('store'in sent.body,false);assert.equal('max_output_tokens'in sent.body,false);assert.equal(JSON.parse(sent.body.messages[1].content).context.metricUnits.ukEts,'GBP (CO2 subtotal only)');assert.equal(JSON.parse(sent.body.messages[1].content).context.metricUnits.fuelEu,'EUR');assert.equal(sent.body.messages[0].role,'system');assert.equal(JSON.parse(sent.body.messages[1].content).question,'解释预算');assert.equal(sent.body.messages[1].content.includes('PRIVATE-CSV'),false);assert.equal(result.answer,'预算仅为 CO₂ 部分 [eu]。');assert.equal(JSON.stringify(result).includes('hidden reasoning'),false);assert.deepEqual(result.sources.map(s=>s.id),['eu']);assert.equal(result.incomplete,false);
});
test('DeepSeek never falls back to another provider when its key is missing',async t=>{
 const url=await server(t,{env:{AI_PROVIDER:'deepseek',OPENAI_API_KEY:'unused',OPENAI_MODEL:'unused'},request:()=>{throw new Error('must not call provider');}});assert.equal((await(await fetch(url+'/api/health')).json()).configured,false);
});

test('public Worker requires a classroom code before provider calls and supports the browser preflight (mock provider)',async()=>{
 const env={DEEPSEEK_API_KEY:'private-test-key',MAREG_ACCESS_CODE:'classroom-test-code'},origin='https://wwwwzzzzkkkk.github.io';let calls=0;
 const options={env,requireAccessCode:true,request:async()=>{calls++;return new Response(JSON.stringify({choices:[{finish_reason:'stop',message:{content:'Only CO2 [eu].'}}]}));}};
 const health=await(await handleAiRequest(new Request('https://worker.invalid/api/health'),options)).json();assert.equal(health.configured,true);assert.equal(health.requiresAccessCode,true);assert.equal(JSON.stringify(health).includes(env.MAREG_ACCESS_CODE),false);assert.equal(JSON.stringify(health).includes(env.DEEPSEEK_API_KEY),false);
 const preflight=await handleAiRequest(new Request('https://worker.invalid/api/explain',{method:'OPTIONS',headers:{Origin:origin,'Access-Control-Request-Headers':'authorization,content-type'}}),options);assert.equal(preflight.status,204);assert.equal(preflight.headers.get('Access-Control-Allow-Origin'),origin);assert.match(preflight.headers.get('Access-Control-Allow-Headers'),/Authorization/);
 const body=JSON.stringify({language:'en',question:'Explain CO2',context:{cases:[],assumptions:defaultSettings(),policyPath:'deadlock',metrics:computeScenario(vessels[0],defaultSettings())}});
 for(const code of ['', 'wrong-code']){const response=await handleAiRequest(new Request('https://worker.invalid/api/explain',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json',Authorization:`Bearer ${code}`},body}),options);assert.equal(response.status,401);assert.equal((await response.json()).kind,'access');}assert.equal(calls,0);
 const invalid=JSON.parse(body);invalid.context.cases=[null];const malformed=await handleAiRequest(new Request('https://worker.invalid/api/explain',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json',Authorization:'Bearer '+env.MAREG_ACCESS_CODE},body:JSON.stringify(invalid)}),options);assert.equal(malformed.status,400);assert.equal(calls,0);
 const result=await handleAiRequest(new Request('https://worker.invalid/api/explain',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json',Authorization:`Bearer ${env.MAREG_ACCESS_CODE}`},body}),options);assert.equal(result.status,200);assert.equal(calls,1);const text=await result.text();assert.equal(text.includes(env.DEEPSEEK_API_KEY),false);assert.equal(text.includes(env.MAREG_ACCESS_CODE),false);
 const unconfigured=await(await handleAiRequest(new Request('https://worker.invalid/api/health'),{env:{DEEPSEEK_API_KEY:'test'},requireAccessCode:true})).json();assert.equal(unconfigured.configured,false);
});

test('both AI adapters receive project knowledge and sanitized current values, not a fixed default scenario',async()=>{
 let sent;
 const settings={...defaultSettings(),poolPrice:90,poolAvailable:1000,maxExtraHours:48,bunkerPrice:700,operationsConfirmed:true};
 const vessel={...vessels[0],euEnergyMJ:82000000,actualWtWIntensity:90.1};
 const context={metrics:computeScenario(vessel,settings),assumptions:settings,vessel:{baseEnergyMJ:vessel.euEnergyMJ,baseIntensity:vessel.actualWtWIntensity,serviceSpeedKn:vessel.serviceSpeedKn},charterType:'voyage_gencon',cases:[],policyPath:'deadlock',ledgerMode:false,rawCsv:'PRIVATE-LEDGER',vesselName:'PRIVATE-VESSEL'};
 for(const provider of ['deepseek','openai']){
  const options={env:{AI_PROVIDER:provider,DEEPSEEK_API_KEY:'fake',OPENAI_API_KEY:'fake',OPENAI_MODEL:'test'},request:async(url,o)=>{sent=JSON.parse(o.body);return new Response(JSON.stringify(provider==='deepseek'?{choices:[{finish_reason:'stop',message:{content:'These are demo assumptions [pool].'}}]}:{output:[{type:'message',content:[{type:'output_text',text:'These are demo assumptions [pool].'}]}]}));}};
  const make=c=>new Request('https://service.invalid/api/explain',{method:'POST',headers:{Origin:'https://wwwwzzzzkkkk.github.io','Content-Type':'application/json'},body:JSON.stringify({language:'en',question:'Where can I apply for pooling?',context:c})});
  const response=await handleAiRequest(make(context),options);assert.equal(response.status,200);assert.equal((await response.json()).knowledgeVersion,'4.6.0');
  const instructions=provider==='deepseek'?sent.messages[0].content:sent.instructions;
  const input=JSON.parse(provider==='deepseek'?sent.messages[1].content:sent.input);
  assert.match(instructions,/Answer in English/);assert.match(instructions,/2–4 short sentences/);assert.match(instructions,/plain text/);assert.match(instructions,/sufficient supply, not a coverage shortfall/);assert.match(instructions,/This page cannot submit a real application/);assert.match(instructions,/not.*standard contract defaults/i);
  assert.equal(input.context.vessel.baseEnergyMJ,82000000);assert.equal(input.context.assumptions.poolPrice,90);assert.equal(input.context.assumptions.maxExtraHours,48);assert.equal(input.context.assumptions.operationsConfirmed,true);assert.equal(input.context.metricUnits.ownerScopedEur,'EUR including operating delta');
  assert.equal(input.knowledge.version,'4.6.0');assert.equal(input.references[0].checkedAt,'2026-10-15');assert.equal(JSON.stringify(input).includes('PRIVATE-'),false);
  assert.equal((await handleAiRequest(make({...context,vessel:null}),options)).status,400);
  assert.equal((await handleAiRequest(make({...context,assumptions:{...settings,maxExtraHours:null}}),options)).status,400);
  assert.equal((await handleAiRequest(make({...context,assumptions:{...settings,poolConfirmed:'true'}}),options)).status,400);
 }
});
