import test from 'node:test';import assert from 'node:assert/strict';import{once}from'node:events';
import{createExplainServer}from'../server/explain.mjs';import{computeScenario,defaultSettings}from'../js/compliance-engine.mjs';import{vessels}from'../js/light-data.mjs';
async function server(t,options){const s=createExplainServer(options);s.listen(0,'127.0.0.1');await once(s,'listening');t.after(()=>new Promise(r=>s.close(r)));return 'http://127.0.0.1:'+s.address().port;}
test('unconfigured local AI service reports disabled without contacting a provider',async t=>{
 const url=await server(t,{env:{},request:()=>{throw new Error('must not call provider');}});const health=await(await fetch(url+'/api/health')).json();assert.equal(health.configured,false);const r=await fetch(url+'/api/explain',{method:'POST',headers:{Origin:'http://127.0.0.1:48184','Content-Type':'application/json'},body:'{}'});assert.equal(r.status,503);
});
test('configured AI contract keeps keys server-side, limits context, disables storage and returns dated citations (mock provider)',async t=>{
 let sent;const url=await server(t,{env:{OPENAI_API_KEY:'test-not-a-real-key',OPENAI_MODEL:'test-model'},request:async(endpoint,options)=>{sent={endpoint,options,body:JSON.parse(options.body)};return new Response(JSON.stringify({output:[{type:'reasoning'},{type:'message',content:[{type:'output_text',text:'Cost is a CO2 subtotal [eu]. Pooling is conditional [pool].'}]}]}),{status:200});}});
 const r=await fetch(url+'/api/explain',{method:'POST',headers:{Origin:'http://127.0.0.1:48184','Content-Type':'application/json'},body:JSON.stringify({language:'en',question:'解释预算和来源',context:{cases:[],assumptions:defaultSettings(),policyPath:'deadlock',metrics:computeScenario(vessels[0],defaultSettings()),ledgerMode:false,rawCsv:'PRIVATE-RAW-INPUT'}})});
 assert.equal(r.status,200);const data=await r.json();assert.deepEqual(data.sources.map(s=>s.id),['eu','pool']);assert.equal(sent.body.store,false);assert.equal(JSON.parse(sent.body.input).question,'解释预算和来源');assert.equal(sent.options.headers.Authorization,'Bearer test-not-a-real-key');assert.equal(JSON.stringify(data).includes('test-not-a-real-key'),false);assert.equal(sent.body.input.includes('PRIVATE-RAW-INPUT'),false);assert.equal(data.reviewRequired,true);
});
test('AI service rejects other origins and nonfinite or malformed external input',async t=>{
 const url=await server(t,{env:{OPENAI_API_KEY:'test',OPENAI_MODEL:'test'},request:()=>{throw new Error('must not call provider');}});
 assert.equal((await fetch(url+'/api/health',{headers:{Origin:'https://untrusted.invalid'}})).status,403);
 assert.equal((await fetch(url+'/api/explain',{method:'POST',headers:{Origin:'http://127.0.0.1:48184','Content-Type':'application/json'},body:'{'})).status,400);
 assert.equal((await fetch(url+'/api/explain',{method:'POST',headers:{Origin:'http://127.0.0.1:48184','Content-Type':'application/json'},body:JSON.stringify({language:'zh',question:'test',context:{policyPath:'deadlock',metrics:{}}})})).status,400);
});
