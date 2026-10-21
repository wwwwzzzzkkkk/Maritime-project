import { AI_SERVICE_URL } from './ai-config.mjs?v=4.6.0';
import { sources as officialReferences } from './light-data.mjs?v=4.6.0';
import { renderAiAnswer } from './ai-answer.mjs?v=4.6.0';
const metricFields=['euEts','ukEts','fuelEu','poolCost','totalEur','energyMJ','actualIntensity','extraHours','physicalWtWTonnes','target','allocatedPoolTonnes','fuelSaving','blendCost','timeCost','rawBalanceGrams','netBalanceGrams','deficitTonnes','ownerEur','chartererEur','ownerScopedEur','chartererScopedEur','operatingDelta'];
const assumptionFields=['euaPrice','ukPrice','speedDelta','blendPct','poolPrice','poolAvailable','year','poolingTonnes','bunkerPrice','blendPremium','distanceNm','maxExtraHours','dailyTimeCost','maxBlendPct','auxFuelPerDay','auxCo2Factor','auxCoveragePct','consecutiveDeficits','etsOwnerPct','fuelOwnerPct','poolOwnerPct','operatingOwnerPct','operationsConfirmed','fuelConfirmed','poolConfirmed'];

export function createAiExplain({capture,evaluate,getCases}) {
  const el=id=>document.getElementById(id),suggestions=[...el('liveAiPanel').querySelectorAll('[data-ai-suggestion]')];
  el('aiServiceUrl').value=AI_SERVICE_URL;
  let language='zh',connection='idle',requiresAccessCode=false,connecting=false,busy=false,answerStatus='idle',answerState='',healthInfo='',errorDetail='';
  const t=(z,e)=>language==='zh'?z:e;
  const fingerprint=input=>{const {language:ignored,...analysis}=input;return JSON.stringify(analysis);};
  function root(){const u=new URL(el('aiServiceUrl').value);if(u.username||u.password||u.search||u.hash||(u.protocol!=='https:'&&!(u.protocol==='http:'&&['127.0.0.1','localhost'].includes(u.hostname))))throw new Error(t('请使用 HTTPS 或本机服务地址，不要填写密钥。','Use an HTTPS or localhost service URL, never a key.'));return u.href.replace(/\/$/,'');}
  function render() {
    const connected=connection==='ready',needsCode=requiresAccessCode&&!el('aiAccessCode').value.trim();
    el('aiConnectionBadge').textContent=connecting?t('连接中','Connecting'):connected?t('已连接','Connected'):t('未连接','Not connected');
    el('aiServiceStatus').textContent=connecting?t('正在连接…','Connecting…'):connected?(needsCode?t('请输入课堂访问码。','Enter your classroom access code.'):t('服务已连接，发送问题后生成回答。','Service connected. Send a question to get an answer.')):connection==='unconfigured'?t('服务尚未配置，请联系维护者。','Service is not configured; contact the maintainer.'):connection==='error'?t('连接失败，请重试；也可展开连接设置。','Connection failed. Retry or open connection settings.'):t('先连接 AI，再填写访问码。','Connect AI, then enter your access code.');
    el('connectAiBtn').disabled=connecting||busy;
    el('connectAiBtn').firstElementChild.textContent=connecting?t('连接中…','Connecting…'):connected?t('重新连接','Reconnect'):t('连接 AI','Connect AI');
    el('aiAccessCodeField').hidden=!requiresAccessCode;
    el('aiServiceUrl').disabled=busy||connecting;el('aiAccessCode').disabled=busy;
    el('askAiBtn').disabled=!connected||needsCode||!el('aiSendConsent').checked||busy;
    el('askAiBtn').firstElementChild.textContent=busy?t('正在回答…','Answering…'):t('发送问题','Send question');
    el('aiInputHint').textContent=busy?t('正在解释当前计算…','Explaining the current calculation…'):!connected?t('请先连接 AI。','Connect AI first.'):needsCode?t('请填写访问码。','Enter the access code.'):!el('aiSendConsent').checked?t('勾选同意后即可发送。','Consent before sending.'):t('基于当前已应用的输入。','Uses the currently applied inputs.');
    el('aiRequestStatus').textContent=answerStatus==='loading'?t('正在生成回答…','Generating an answer…'):answerStatus==='incomplete'?t('回答达到长度限制，请缩小问题范围后重试。','Answer reached the length limit. Narrow the question and retry.'):answerStatus==='access'?t('访问码不正确，请重新填写。','Incorrect access code. Please re-enter it.'):answerStatus==='key'?t('AI 服务密钥需要维护者检查。','The maintainer needs to check the AI service key.'):answerStatus==='balance'?t('AI 账户余额不足，请联系维护者。','The AI account has insufficient balance; contact the maintainer.'):answerStatus==='rate'?t('请求较多，请稍后重试。','Too many requests. Try again shortly.'):answerStatus==='invalid'?t('请输入 1–2000 字符的问题。','Enter a question of 1–2000 characters.'):answerStatus==='error'?t('暂时无法取得回答，请重试。当前计算未改变。','No answer is available. Retry; calculations are unchanged.'):'';
    el('aiRequestStatus').hidden=el('aiRequestStatus').textContent==='';
    el('aiModelInfo').textContent=healthInfo+(errorDetail?' · '+errorDetail:'');
    el('aiAnswerStale').textContent=answerState&&answerState!==fingerprint(capture())?t('输入已改变，此回答基于之前的计算；请重新提问。','Inputs changed. This answer uses the previous calculation; ask again.'):'';
    el('aiSourcesSummary').textContent=t('参考来源（'+el('liveAiSources').children.length+'）','References ('+el('liveAiSources').children.length+')');
    el('liveAiPanel').querySelector('.ai-suggestions').setAttribute('aria-label',t('常用问题','Suggested questions'));
    for(const button of suggestions)button.disabled=busy;
  }
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
    const input=capture(),m=evaluate(input),sentState=fingerprint(input);
    el('aiAnswerSection').hidden=true;el('liveAiAnswer').replaceChildren();el('liveAiSources').replaceChildren();el('aiSourcesDetails').hidden=true;el('aiSourcesDetails').open=false;
    answerState='';busy=true;answerStatus='loading';errorDetail='';render();
    try {
      const response=await fetch(root()+'/api/explain',{method:'POST',headers:{'Content-Type':'application/json',...(requiresAccessCode?{Authorization:'Bearer '+el('aiAccessCode').value.trim()}:{})},credentials:'omit',signal:AbortSignal.timeout(50000),body:JSON.stringify({language,question,context:{
        metrics:{...Object.fromEntries(metricFields.map(k=>[k,m.comparison.active[k]])),baselineEur:m.comparison.baseline.totalEur,costDelta:m.comparison.costDelta,costDeltaPct:m.comparison.costDeltaPct,physicalDeltaPct:m.comparison.physicalDeltaPct},
        assumptions:Object.fromEntries(assumptionFields.map(k=>[k,m.settings[k]])),
        vessel:{baseEnergyMJ:m.vessel.euEnergyMJ,baseIntensity:m.vessel.actualWtWIntensity,serviceSpeedKn:m.vessel.serviceSpeedKn},
        charterType:input.twin.charterType,
        cases:getCases().map(item=>{const x=evaluate(item.input);return {name:item.name,policyPath:item.input.selectedScenario,eur:x.comparison.active.totalEur,gbp:x.comparison.active.ukEts,extraHours:x.comparison.active.extraHours};}),
        policyPath:input.selectedScenario,ledgerMode:Boolean(input.ledgerDocuments[input.selectedVesselId])
      }})});
      if(!response.ok){
        const failure=await response.json(),code=failure.status||response.status;
        answerStatus=failure.kind==='access'?'access':code===401?'key':code===402?'balance':code===429?'rate':'error';errorDetail='HTTP '+code;return;
      }
      const data=await response.json();if(typeof data.answer!=='string'||!Array.isArray(data.sources))throw new Error('Invalid AI response format');
      for(const source of data.sources){
        if(!officialReferences.some(s=>s.id===source.id&&s.url===source.url))throw new Error('Unrecognised reference');
        const li=document.createElement('li'),a=document.createElement('a');a.href=source.url;a.textContent=source.title+' · '+source.checkedAt;a.target='_blank';a.rel='noopener noreferrer';li.append(a);el('liveAiSources').append(li);
      }
      renderAiAnswer(el('liveAiAnswer'),data.answer);el('aiSourcesDetails').hidden=data.sources.length===0;
      answerState=sentState;el('aiAnswerSection').hidden=false;answerStatus=data.incomplete?'incomplete':'done';
    } catch(error){answerStatus='error';errorDetail=error.message;el('liveAiAnswer').replaceChildren();el('liveAiSources').replaceChildren();}
    finally{busy=false;render();}
  });
  render();
  return {render(lang){language=lang;render();}};
}
