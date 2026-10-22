import {buildPolicyExplanation} from './ai-policy-context.mjs?v=4.7.3';
import { AI_SERVICE_URL } from './ai-config.mjs?v=4.7.3';
import { sources as officialReferences } from './light-data.mjs?v=4.7.3';
import { renderAiAnswer } from './ai-answer.mjs?v=4.7.3';
const metricFields=['euEts','ukEts','fuelEu','poolCost','totalEur','energyMJ','actualIntensity','extraHours','physicalWtWTonnes','target','allocatedPoolTonnes','fuelSaving','blendCost','timeCost','rawBalanceGrams','netBalanceGrams','deficitTonnes','ownerEur','chartererEur','ownerScopedEur','chartererScopedEur','operatingDelta'];
const assumptionFields=['euaPrice','ukPrice','speedDelta','blendPct','poolPrice','poolAvailable','year','poolingTonnes','bunkerPrice','blendPremium','distanceNm','maxExtraHours','dailyTimeCost','maxBlendPct','auxFuelPerDay','auxCo2Factor','auxCoveragePct','consecutiveDeficits','etsOwnerPct','fuelOwnerPct','poolOwnerPct','operatingOwnerPct','operationsConfirmed','fuelConfirmed','poolConfirmed'];

export function createAiExplain({capture,evaluate,getCases,getDesk}) {
  const el=id=>document.getElementById(id),suggestions=[...el('liveAiPanel').querySelectorAll('[data-ai-suggestion]')];
  el('aiServiceUrl').value=AI_SERVICE_URL;
  let language='zh',connection='idle',requiresAccessCode=false,connecting=false,busy=false,answerStatus='idle',answerState='',healthInfo='',errorDetail='';
  let linkedPolicyId='';
  const t=(z,e)=>language==='zh'?z:e;
  function policyContext(){if(!linkedPolicyId)return null;const desk=getDesk(),policy=desk.policies.find(p=>p.id===linkedPolicyId);return policy&&desk.fleet.length?buildPolicyExplanation(desk,policy):null;}
  const fingerprint=input=>{if(linkedPolicyId)return JSON.stringify({policy:linkedPolicyId,comparison:policyContext()});const {language:ignored,...analysis}=input;return JSON.stringify(analysis);};
  function root(){const u=new URL(el('aiServiceUrl').value);if(u.username||u.password||u.search||u.hash||(u.protocol!=='https:'&&!(u.protocol==='http:'&&['127.0.0.1','localhost'].includes(u.hostname))))throw new Error(t('请使用 HTTPS 或本机服务地址，不要填写密钥。','Use an HTTPS or localhost service URL, never a key.'));return u.href.replace(/\/$/,'');}
  function render() {
    const comparison=policyContext();
    el('aiPolicyContext').hidden=!linkedPolicyId;
    el('aiPolicyPayload').textContent=comparison?JSON.stringify(comparison,null,2):'';
    const currency=(v,c)=>v===null?t('无法量化','Not quantified'):new Intl.NumberFormat(language==='zh'?'zh-CN':'en-GB',{style:'currency',currency:c,maximumFractionDigits:2}).format(v);
    el('aiPolicySummary').textContent=comparison?comparison.policy.title+' · v'+comparison.policy.revision+' · '+t('涉及'+comparison.totals.affected+' / '+comparison.totals.vessels+'艘；欧元差额 ','Covers '+comparison.totals.affected+' / '+comparison.totals.vessels+' vessels; EUR change ')+currency(comparison.totals.deltaEur,'EUR')+' · '+t('英镑差额 ','GBP change ')+currency(comparison.totals.deltaGbp,'GBP'):t('关联政策或船队记录已移除，请重新选择或返回单船问答。','Linked evidence or fleet records were removed. Select again or return to vessel Q&A.');
    el('aiConsentText').textContent=linkedPolicyId?t('同意发送问题、所选政策说明与匿名船队金额摘要。','Send this question, selected policy text and anonymous fleet amounts.'):t('同意发送当前计算摘要和问题，不发送原始 CSV。','Send this question and the current calculation summary; exclude raw CSV.');
    const connected=connection==='ready',needsCode=requiresAccessCode&&!el('aiAccessCode').value.trim();
    el('aiConnectionBadge').textContent=connecting?t('连接中','Connecting'):connected?t('已连接','Connected'):t('未连接','Not connected');
    el('aiServiceStatus').textContent=connecting?t('正在连接…','Connecting…'):connected?(needsCode?t('请输入课堂访问码。','Enter your classroom access code.'):t('服务已连接，发送问题后生成回答。','Service connected. Send a question to get an answer.')):connection==='unconfigured'?t('服务尚未配置，请联系维护者。','Service is not configured; contact the maintainer.'):connection==='error'?t('连接失败，请重试；也可展开连接设置。','Connection failed. Retry or open connection settings.'):t('先连接 AI，再填写访问码。','Connect AI, then enter your access code.');
    el('connectAiBtn').disabled=connecting||busy;
    el('connectAiBtn').firstElementChild.textContent=connecting?t('连接中…','Connecting…'):connected?t('重新连接','Reconnect'):t('连接 AI','Connect AI');
    el('aiAccessCodeField').hidden=!requiresAccessCode;
    el('aiServiceUrl').disabled=busy||connecting;el('aiAccessCode').disabled=busy;
    el('askAiBtn').disabled=!connected||needsCode||!el('aiSendConsent').checked||busy||Boolean(linkedPolicyId&&!comparison);
    el('askAiBtn').firstElementChild.textContent=busy?t('正在回答…','Answering…'):t('发送问题','Send question');
    el('aiInputHint').textContent=busy?t('正在解释当前计算…','Explaining the current calculation…'):!connected?t('请先连接 AI。','Connect AI first.'):needsCode?t('请填写访问码。','Enter the access code.'):!el('aiSendConsent').checked?t('勾选同意后即可发送。','Consent before sending.'):linkedPolicyId?t('基于已存船队与所选政策；发送前可展开查看摘要。','Uses the stored fleet and selected policy; review the summary before sending.'):t('基于当前已应用的输入。','Uses the currently applied inputs.');
    el('aiRequestStatus').textContent=answerStatus==='loading'?t('正在生成回答…','Generating an answer…'):answerStatus==='incomplete'?t('回答达到长度限制，请缩小问题范围后重试。','Answer reached the length limit. Narrow the question and retry.'):answerStatus==='access'?t('访问码不正确，请重新填写。','Incorrect access code. Please re-enter it.'):answerStatus==='key'?t('AI 服务密钥需要维护者检查。','The maintainer needs to check the AI service key.'):answerStatus==='balance'?t('AI 账户余额不足，请联系维护者。','The AI account has insufficient balance; contact the maintainer.'):answerStatus==='rate'?t('请求较多，请稍后重试。','Too many requests. Try again shortly.'):answerStatus==='invalid'?t('请输入 1–2000 字符的问题。','Enter a question of 1–2000 characters.'):answerStatus==='error'?t('暂时无法取得回答，请重试。当前计算未改变。','No answer is available. Retry; calculations are unchanged.'):'';
    el('aiRequestStatus').hidden=el('aiRequestStatus').textContent==='';
    el('aiModelInfo').textContent=healthInfo+(errorDetail?' · '+errorDetail:'');
    el('aiAnswerStale').textContent=answerState&&answerState!==fingerprint(capture())?t('分析依据已改变，此回答基于之前的数据；请重新提问。','Analysis sources changed. This answer uses previous data; ask again.'):'';
    el('aiSourcesSummary').textContent=t('参考来源（'+el('liveAiSources').children.length+'）','References ('+el('liveAiSources').children.length+')');
    el('liveAiPanel').querySelector('.ai-suggestions').setAttribute('aria-label',t('常用问题','Suggested questions'));
    for(const button of suggestions)button.disabled=busy;el('aiClearPolicy').disabled=busy;
  }
  el('aiClearPolicy').addEventListener('click',()=>{linkedPolicyId='';el('aiQuestion').value='';el('aiSendConsent').checked=false;el('aiAnswerSection').hidden=true;answerState='';answerStatus='idle';render();});
  el('aiServiceUrl').addEventListener('input',()=>{connection='idle';requiresAccessCode=false;el('aiAccessCode').value='';healthInfo='';errorDetail='';render();});
  el('aiAccessCode').addEventListener('input',()=>{if(answerStatus==='access')answerStatus='idle';render();});
  el('aiSendConsent').addEventListener('change',render);
  for(const button of suggestions)button.addEventListener('click',()=>{el('aiQuestion').value=language==='zh'?button.dataset.questionZh:button.dataset.questionEn;el('aiQuestion').focus();});
  el('connectAiBtn').addEventListener('click',async()=>{
    connecting=true;errorDetail='';render();
    try {
      const r=await fetch(root()+'/api/health',{signal:AbortSignal.timeout(10000),credentials:'omit'});if(!r.ok)throw new Error('HTTP '+r.status);
      const data=await r.json();if(data.protocol!=='mareg-explain-v1')throw new Error('Incompatible service protocol');
      connection=data.configured===true?'ready':'unconfigured';requiresAccessCode=data.requiresAccessCode===true;
      healthInfo=[data.provider,data.model,data.knowledgeVersion].filter(Boolean).join(' · ');
    } catch(error){connection='error';errorDetail=error.message;}
    finally{connecting=false;render();}
  });
  el('aiExplainForm').addEventListener('submit',async event=>{
    event.preventDefault();if(connection!=='ready'||!el('aiSendConsent').checked||busy||(requiresAccessCode&&!el('aiAccessCode').value.trim()))return;
    const question=el('aiQuestion').value.trim();if(!question||question.length>2000){answerStatus='invalid';render();return;}
    const input=capture(),m=evaluate(input),sentState=fingerprint(input),sentComparison=policyContext();
    if(linkedPolicyId&&!sentComparison)return;
    el('aiAnswerSection').hidden=true;el('liveAiAnswer').replaceChildren();el('liveAiSources').replaceChildren();el('aiSourcesDetails').hidden=true;el('aiSourcesDetails').open=false;
    answerState='';busy=true;answerStatus='loading';errorDetail='';render();
    try {
      const context=sentComparison?{policyPath:input.selectedScenario,policyComparison:sentComparison}:{
        metrics:{...Object.fromEntries(metricFields.map(k=>[k,m.comparison.active[k]])),baselineEur:m.comparison.baseline.totalEur,costDelta:m.comparison.costDelta,costDeltaPct:m.comparison.costDeltaPct,physicalDeltaPct:m.comparison.physicalDeltaPct},
        assumptions:Object.fromEntries(assumptionFields.map(k=>[k,m.settings[k]])),
        vessel:{baseEnergyMJ:m.vessel.euEnergyMJ,baseIntensity:m.vessel.actualWtWIntensity,serviceSpeedKn:m.vessel.serviceSpeedKn},charterType:input.twin.charterType,
        cases:getCases().map(item=>{const x=evaluate(item.input);return {name:item.name,policyPath:item.input.selectedScenario,eur:x.comparison.active.totalEur,gbp:x.comparison.active.ukEts,extraHours:x.comparison.active.extraHours};}),
        policyPath:input.selectedScenario,ledgerMode:Boolean(input.ledgerDocuments[input.selectedVesselId])};
      const response=await fetch(root()+'/api/explain',{method:'POST',headers:{'Content-Type':'application/json',...(requiresAccessCode?{Authorization:'Bearer '+el('aiAccessCode').value.trim()}:{})},credentials:'omit',signal:AbortSignal.timeout(50000),body:JSON.stringify({language,question,context})});
      if(!response.ok){
        const failure=await response.json(),code=failure.status||response.status;
        answerStatus=failure.kind==='access'?'access':code===401?'key':code===402?'balance':code===429?'rate':'error';errorDetail='HTTP '+code;return;
      }
      const data=await response.json();if(typeof data.answer!=='string'||!Array.isArray(data.sources))throw new Error('Invalid AI response format');
      for(const source of data.sources){
        if(!officialReferences.some(s=>s.id===source.id&&s.url===source.url)&&!(sentComparison&&source.id==='userpolicy'&&source.url===sentComparison.policy.url))throw new Error('Unrecognised reference');
        const li=document.createElement('li'),a=document.createElement('a');a.href=source.url;a.textContent=source.title+' · '+source.checkedAt;a.target='_blank';a.rel='noopener noreferrer';li.append(a);el('liveAiSources').append(li);
      }
      renderAiAnswer(el('liveAiAnswer'),data.answer);el('aiSourcesDetails').hidden=data.sources.length===0;
      answerState=sentState;el('aiAnswerSection').hidden=false;answerStatus=data.incomplete?'incomplete':'done';
    } catch(error){answerStatus='error';errorDetail=error.message;el('liveAiAnswer').replaceChildren();el('liveAiSources').replaceChildren();}
    finally{busy=false;render();}
  });
  render();
  return {render(lang){language=lang;render();},explainPolicy(id){
    if(busy)throw new Error(t('请等待当前AI回答结束，再选择政策。','Wait for the current AI answer before selecting a policy.'));
    if(!getDesk().fleet.length)throw new Error(t('请先在预算总览存入至少一艘船，再解释政策的船队影响。','Store at least one fleet vessel before explaining policy impacts.'));
    linkedPolicyId=id;el('aiSendConsent').checked=false;el('aiAnswerSection').hidden=true;answerState='';answerStatus='idle';
    el('aiQuestion').value=t('请解释这项政策条件对船队费用的影响，指出优先关注的船舶，并给出经营建议、前提和风险。','Explain this policy condition’s fleet cost impact, identify priorities and give business options, prerequisites and risks.');
    render();return true;
  }};
}
