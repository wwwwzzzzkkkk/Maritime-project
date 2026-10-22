import {validatePolicyExplanation} from '../js/policy-explanation-data.mjs';
import {sources,checkedAt} from '../js/light-data.mjs';
import {buildAiInstructions,KNOWLEDGE_VERSION,KNOWLEDGE_UPDATED_AT} from './ai-knowledge.mjs';

// Shared Web Request/Response contract: no Node runtime or browser secrets.
export async function handleAiRequest(req,{env={},request=fetch,requireAccessCode=false}={}) {
  const provider=env.AI_PROVIDER||'deepseek';
  if(!['deepseek','openai'].includes(provider))throw new Error('AI_PROVIDER must be deepseek or openai');
  const key=provider==='deepseek'?env.DEEPSEEK_API_KEY:env.OPENAI_API_KEY;
  const model=provider==='deepseek'?(env.DEEPSEEK_MODEL||'deepseek-flash'):env.OPENAI_MODEL;
  const endpoint=provider==='deepseek'?'https://api.deepseek.com/chat/completions':'https://api.openai.com/v1/responses';
  const allowed=new Set((env.ALLOWED_ORIGINS||'https://wwwwzzzzkkkk.github.io,http://127.0.0.1:48184,http://localhost:48184').split(','));
  const path=new URL(req.url).pathname;
  {
    const origin=req.headers.get('Origin');
    const accessCode=env.MAREG_ACCESS_CODE||'';
    const requiresAccessCode=requireAccessCode||Boolean(accessCode);
    const respond=(status,body)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store',...(allowed.has(origin)?{'Access-Control-Allow-Origin':origin,'Vary':'Origin'}:{})}});
    if(origin&&!allowed.has(origin))return respond(403,{error:'Origin not allowed'});
    if(req.method==='OPTIONS')return new Response(null,{status:204,headers:{'Access-Control-Allow-Origin':origin||'','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type, Authorization','Vary':'Origin'}});
    const configured=Boolean(key&&model&&(!requireAccessCode||accessCode.length>=12));
    if(path==='/api/health'&&req.method==='GET')return respond(200,{protocol:'mareg-explain-v1',configured,provider,model:model||null,requiresAccessCode,knowledgeVersion:KNOWLEDGE_VERSION});
    if(path!=='/api/explain'||req.method!=='POST')return respond(404,{error:'Not found'});
    if(!origin||!allowed.has(origin))return respond(403,{error:'Browser origin required'});
    if(requiresAccessCode&&(!accessCode||req.headers.get('Authorization')!==`Bearer ${accessCode}`))return respond(401,{error:'Classroom access code required or invalid',kind:'access'});
    if(!configured)return respond(503,{error:'AI is not configured'});
    if(!req.headers.get('Content-Type')?.startsWith('application/json'))return respond(415,{error:'JSON required'});
    let data;
    try{let size=0;const chunks=[],reader=req.body.getReader();while(true){const{done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>128000){await reader.cancel();return respond(413,{error:'Request too large'});}chunks.push(value);}const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}data=JSON.parse(new TextDecoder().decode(bytes));}catch{return respond(400,{error:'Invalid JSON request'});}
    if(!data||typeof data!=='object'||Array.isArray(data)||!['zh','en'].includes(data.language)||typeof data.question!=='string'||!data.question.trim()||data.question.length>2000||!data.context||!['as_is','amended','deadlock'].includes(data.context.policyPath))return respond(400,{error:'Invalid explanation request'});
    let modelContext,policyComparison;
    if(data.context.policyComparison!==undefined){
      try{policyComparison=validatePolicyExplanation(data.context.policyComparison);}catch{return respond(400,{error:'Invalid policy comparison summary'});}
      modelContext={analysisScope:'fleet-policy',policyPath:data.context.policyPath,policyComparison};
    }else{
    const fields=['euEts','ukEts','fuelEu','poolCost','totalEur','energyMJ','actualIntensity','extraHours','physicalWtWTonnes','target','allocatedPoolTonnes','fuelSaving','blendCost','timeCost'];
    if(!fields.every(k=>Number.isFinite(data.context.metrics?.[k])))return respond(400,{error:'Missing finite calculated metrics'});
    const extraFields=['rawBalanceGrams','netBalanceGrams','deficitTonnes','ownerEur','chartererEur','ownerScopedEur','chartererScopedEur','operatingDelta','baselineEur','costDelta','costDeltaPct','physicalDeltaPct'];
    if(extraFields.some(k=>k in data.context.metrics&&!Number.isFinite(data.context.metrics[k])))return respond(400,{error:'Invalid calculated metric'});
    const metrics=Object.fromEntries([...fields,...extraFields.filter(k=>k in data.context.metrics)].map(k=>[k,data.context.metrics[k]]));
    const metricUnits={euEts:'EUR (CO2 subtotal only)',ukEts:'GBP (CO2 subtotal only)',fuelEu:'EUR',poolCost:'EUR',totalEur:'EUR (scoped comparison)',fuelSaving:'EUR',blendCost:'EUR',timeCost:'EUR',energyMJ:'MJ',actualIntensity:'gCO2e/MJ (WtW)',target:'gCO2e/MJ (WtW)',extraHours:'hours',physicalWtWTonnes:'tCO2e (model estimate)',allocatedPoolTonnes:'tCB',rawBalanceGrams:'gCO2e compliance balance',netBalanceGrams:'gCO2e compliance balance',deficitTonnes:'tCB',ownerEur:'EUR compliance allocation',chartererEur:'EUR compliance allocation',ownerScopedEur:'EUR including operating delta',chartererScopedEur:'EUR including operating delta',operatingDelta:'EUR',baselineEur:'EUR (same-price baseline)',costDelta:'EUR vs same-price baseline',costDeltaPct:'percent',physicalDeltaPct:'percent'};
    const cases=data.context.cases;const assumptions=data.context.assumptions;
    if(!Array.isArray(cases)||cases.length>12||!cases.every(c=>c&&typeof c.name==='string'&&c.name.length<=80&&['as_is','amended','deadlock'].includes(c.policyPath)&&['eur','gbp','extraHours'].every(k=>Number.isFinite(c[k])))||!assumptions||!['euaPrice','ukPrice','speedDelta','blendPct','poolPrice','poolAvailable'].every(k=>Number.isFinite(assumptions[k])))return respond(400,{error:'Invalid planning summaries'});
    const assumptionUnits={euaPrice:'EUR/tCO2',ukPrice:'GBP/tCO2',speedDelta:'kn',blendPct:'percent',poolPrice:'EUR/tCB',poolAvailable:'tCB',year:'FuelEU target-condition year',poolingTonnes:'tCB requested',bunkerPrice:'EUR/VLSFO-equivalent tonne',blendPremium:'EUR/VLSFO-equivalent tonne',distanceNm:'nm (model scope)',maxExtraHours:'hours',dailyTimeCost:'EUR/day',maxBlendPct:'percent',auxFuelPerDay:'tonnes/day',auxCo2Factor:'tCO2/tonne',auxCoveragePct:'percent',consecutiveDeficits:'periods',etsOwnerPct:'percent',fuelOwnerPct:'percent',poolOwnerPct:'percent',operatingOwnerPct:'percent'};
    const assumptionFields=Object.keys(assumptionUnits).filter(k=>k in assumptions);
    const confirmations=['operationsConfirmed','fuelConfirmed','poolConfirmed'].filter(k=>k in assumptions);
    if(assumptionFields.some(k=>!Number.isFinite(assumptions[k]))||confirmations.some(k=>typeof assumptions[k]!=='boolean'))return respond(400,{error:'Invalid explanation assumptions'});
    let vessel;
    if(data.context.vessel!==undefined){
      const v=data.context.vessel;
      if(!v||!['baseEnergyMJ','baseIntensity','serviceSpeedKn'].every(k=>Number.isFinite(v[k])&&v[k]>0))return respond(400,{error:'Invalid vessel summary'});
      vessel=Object.fromEntries(['baseEnergyMJ','baseIntensity','serviceSpeedKn'].map(k=>[k,v[k]]));
    }
    const charterType=data.context.charterType;
    if(charterType!==undefined&&!['voyage_gencon','time_nype_bimco','split_blue_ga'].includes(charterType))return respond(400,{error:'Invalid charter example'});
    modelContext={analysisScope:'single-vessel',metrics,metricUnits,assumptionUnits,assumptions:Object.fromEntries([...assumptionFields,...confirmations].map(k=>[k,assumptions[k]])),vessel,vesselUnits:{baseEnergyMJ:'MJ before speed/blend changes',baseIntensity:'gCO2e/MJ (WtW)',serviceSpeedKn:'kn'},charterType,cases:cases.map(c=>({name:c.name,policyPath:c.policyPath,eur:c.eur,gbp:c.gbp,extraHours:c.extraHours})),policyPath:data.context.policyPath,ledgerMode:data.context.ledgerMode===true};
    }
    const references=sources.map(s=>({id:s.id,title:data.language==='zh'?s.zh:s.en,url:s.url,summary:data.language==='zh'?s.summaryZh:s.summaryEn,clause:s.clause,checkedAt}));
    if(policyComparison){const p=policyComparison.policy;references.push({id:'userpolicy',title:(data.language==='zh'?'用户录入政策（未联网核验）：':'User-entered policy (not retrieved/verified): ')+p.title,url:p.url,checkedAt:p.checkedOn,clause:'User-entered evidence and explicit conditions; no online verification',summary:'Status, review and conditions are user-entered, not expert approval.'});}
    const instructions=buildAiInstructions(data.language);
    try{
      const input=JSON.stringify({question:data.question,context:modelContext,knowledge:{version:KNOWLEDGE_VERSION,updatedAt:KNOWLEDGE_UPDATED_AT},references});
      const payload=provider==='deepseek'
        ?{model,messages:[{role:'system',content:instructions},{role:'user',content:input}],thinking:{type:'disabled'},stream:false,max_tokens:1400}
        :{model,store:false,instructions,input,max_output_tokens:1400};
      const upstream=await request(endpoint,{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},signal:AbortSignal.timeout(45000),body:JSON.stringify(payload)});
      if(!upstream.ok)return respond(502,{error:'AI provider request failed',status:upstream.status});
      const result=await upstream.json();
      const answer=provider==='deepseek'?result.choices?.[0]?.message?.content:(result.output||[]).filter(item=>item.type==='message').flatMap(item=>item.content||[]).filter(item=>item.type==='output_text').map(item=>item.text).join('\n');
      if(typeof answer!=='string'||!answer.trim())return respond(502,{error:'AI provider returned no text'});
      const ids=new Set([...answer.matchAll(/\[([a-z]+)\]/g)].map(m=>m[1]));
      return respond(200,{answer,provider,model,knowledgeVersion:KNOWLEDGE_VERSION,incomplete:provider==='deepseek'?result.choices[0].finish_reason==='length':result.status==='incomplete',sources:references.filter(s=>ids.has(s.id)).map(({id,title,url,checkedAt})=>({id,title,url,checkedAt})),reviewRequired:true});
    }catch{return respond(502,{error:'AI provider unavailable or timed out'});}
  }
}
