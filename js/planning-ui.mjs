import { planOptions } from './option-planner.mjs?v=4.5.0';
import { tonnesToMJ, mjToTonnes } from './inputs-adapter.mjs?v=4.5.0';

export function createPlanningUi({onApplyInputs,onApplyOption,onPreset}) {
  const form=document.getElementById('planningForm');
  const note=document.getElementById('planningDraftNote');
  const apply=document.getElementById('applyRecommendedOption');
  const advanced=document.getElementById('advancedAssumptions');
  const tonnes=document.getElementById('input-fuelTonnes');
  const energy=form.elements.euEnergyMJ;
  const fields=[...form.querySelectorAll('input[name]')];
  const confirmationKeys=['operationsConfirmed','fuelConfirmed','poolConfirmed'];
  const columnsToggle=document.getElementById('showAllOptionColumns');
  columnsToggle.addEventListener('change',()=>document.getElementById('optionCompareTable').classList.toggle('show-all-columns',columnsToggle.checked));
  let dirty=false,language='zh',latest,draft,defaults,applied;
  const money=value=>new Intl.NumberFormat('en-GB',{style:'currency',currency:'EUR',maximumFractionDigits:2}).format(value);
  const num=(value,digits=2)=>new Intl.NumberFormat('en-GB',{maximumFractionDigits:digits}).format(value);
  const text=(zh,en)=>language==='zh'?zh:en;
  const reasonLabels={timeLimit:['超过允许新增航时','Exceeds extra-time limit'],fuelLimit:['超过可用燃料比例','Exceeds fuel-share limit'],operations:['运营输入未确认','Operating inputs unconfirmed'],fuel:['燃料条件未确认','Fuel conditions unconfirmed'],pool:['组池供给未确认','Pool supply unconfirmed']};
  const names={baseline:['保持现状','Unmodified baseline'],current:['当前方案','Current option'],speed:['仅调整航速（范围内最低）','Speed only (lowest in range)'],fuel:['仅调整燃料（范围内最低）','Fuel only (lowest in range)'],pooling:['仅使用可用组池','Available pooling only'],combined:['组合搜索最低候选','Lowest search candidate']};
  function status(option) {
    const keys=option.withinLimits?option.pending:option.reasons;
    return keys.length?keys.map(key=>reasonLabels[key][language==='zh'?0:1]).join(' / '):text('输入条件满足（用户确认）','Input conditions met (user-confirmed)');
  }
  function writeInputs() {
    for(const field of fields)field.value=draft[field.name];
    tonnes.value=mjToTonnes(draft.euEnergyMJ);
    for(const field of [tonnes,...fields]) {
      field.setCustomValidity('');field.removeAttribute('aria-invalid');
      document.getElementById(`error-${field===tonnes?'fuelTonnes':field.name}`).textContent='';
    }
  }
  function validate(field) {
    if(field.readOnly)return true; // Compiled ledger values were validated at import.
    field.setCustomValidity('');
    let message='';
    if(!Number.isFinite(field.valueAsNumber))message=text('请输入有效数字。','Enter a valid number.');
    else if(field.validity.rangeUnderflow||field.validity.rangeOverflow)message=text(`请输入 ${field.min} 至 ${field.max} 之间的数值。`,`Enter a value between ${field.min} and ${field.max}.`);
    else if(field.validity.stepMismatch)message=text(`请按 ${field.step} 的步长输入。`,`Use increments of ${field.step}.`);
    if(!message&&field===tonnes) {
      const mj=tonnesToMJ(field.valueAsNumber);
      if(Math.abs(mj-Math.round(mj))>Math.max(0.000001,Number.EPSILON*Math.abs(mj)*4))message=text('换算后的能源须为整数 MJ；可在高级区直接输入能源。','Converted energy must be whole MJ; enter energy directly in Advanced assumptions.');
    }
    field.setCustomValidity(message);
    field.setAttribute('aria-invalid',String(Boolean(message)));
    document.getElementById(`error-${field===tonnes?'fuelTonnes':field.name}`).textContent=message;
    return !message;
  }
  function focusInput(name) {
    if(name==='eua') {
      document.querySelector('[data-tab="tab-cockpit"]').click();
      const slider=document.querySelector('.sync-eua');slider.focus();slider.scrollIntoView({block:'center'});return;
    }
    const field=document.getElementById(`input-${name}`);
    if(advanced.contains(field))advanced.open=true;
    field.focus();field.scrollIntoView({block:'center'});
  }
  function draftNote() {
    const message=dirty?text('有未应用草稿：标签及结果仍显示上次已应用的假设。','Unapplied draft: tags and results still show the last applied assumptions.'):
      text('标签与结果显示当前已应用假设。所有金额仍为演示模型估算。','Tags and results show applied assumptions. All amounts remain demo-model estimates.');
    note.textContent=dirty?message+' '+text('点击“应用输入并比较”后更新。','Select Apply Inputs & Compare to update.'):
      text('已应用输入。确认不等于外部核验；未核验及非法律意见等边界仍然适用。','Inputs applied. Confirmation is not external verification; unverified-data and non-legal-advice limitations still apply.');
    document.getElementById('assumptionDraftStatus').textContent=message;
    apply.disabled=dirty;
    for(const container of form.querySelectorAll('[data-field]')) {
      const name=container.dataset.field,field=container.querySelector('input');
      const value=name==='fuelTonnes'?tonnesToMJ(field.valueAsNumber):field.valueAsNumber;
      const expected=defaults[name==='fuelTonnes'?'euEnergyMJ':name];
      const isDefault=field.validity.valid&&Math.abs(value-expected)<0.000001;
      container.querySelector('.field-default').textContent=isDefault?text('默认值','Default'):text('已修改','Modified');
      container.querySelector('[data-restore]').disabled=isDefault;
    }
    const count=[...advanced.querySelectorAll('input[name]')].filter(field=>field.validity.valid&&field.valueAsNumber===defaults[field.name]).length;
    document.getElementById('advancedAssumptionsSummary').textContent=text(`高级假设（${count} 项使用默认值）`,`Advanced assumptions (${count} at defaults)`);
    const confirmed=confirmationKeys.every(key=>applied[key]);
    document.getElementById('confirmationStatus').textContent=dirty?text('草稿尚未应用；确认按钮会应用有效输入并一次确认三项声明。','Draft not applied; Confirm applies valid inputs and confirms all three declarations.'):
      confirmed?text('三项假设已确认（用户操作，不代表真实核验）。','All three assumptions confirmed by user action, not real verification.'):
      text('运营输入未确认。确认前请阅读下方三项声明。','Operating inputs unconfirmed. Read the three declarations before confirming.');
  }
  function commit(confirmAll=false) {
    const invalid=[tonnes,...fields].filter(field=>!validate(field));
    if(invalid.length){focusInput(invalid[0]===tonnes?'fuelTonnes':invalid[0].name);draftNote();return;}
    if(confirmAll)for(const key of confirmationKeys)draft[key]=true;
    dirty=false;onApplyInputs({...draft});
  }
  form.addEventListener('input',event=>{
    const field=event.target;
    if(!field.matches('input[type="number"]'))return;
    dirty=true;
    if(validate(field)) {
      if(field===tonnes){draft.euEnergyMJ=Math.round(tonnesToMJ(field.valueAsNumber));energy.value=draft.euEnergyMJ;validate(energy);}
      else {draft[field.name]=field.valueAsNumber;if(field===energy){tonnes.value=mjToTonnes(draft.euEnergyMJ);validate(tonnes);}}
    }
    for(const key of confirmationKeys)draft[key]=false;
    draftNote();
  });
  form.addEventListener('submit',event=>{event.preventDefault();commit();});
  document.getElementById('confirmAssumptionsBtn').addEventListener('click',()=>commit(true));
  document.getElementById('loadDemoAssumptionsBtn').addEventListener('click',()=>{
    draft={};for(const field of fields)draft[field.name]=defaults[field.name];
    for(const key of confirmationKeys)draft[key]=false;writeInputs();commit(true);
  });
  for(const button of form.querySelectorAll('[data-restore]'))button.addEventListener('click',()=>{
    const name=button.dataset.restore,field=document.getElementById(`input-${name}`);
    field.value=name==='fuelTonnes'?mjToTonnes(defaults.euEnergyMJ):defaults[name];
    field.dispatchEvent(new Event('input',{bubbles:true}));field.focus();
  });
  document.getElementById('planningInputsPanel').addEventListener('click',event=>{
    const jump=event.target.closest('[data-jump]');if(jump)focusInput(jump.dataset.jump);
    const preset=event.target.closest('[data-preset]');if(preset)onPreset(preset.dataset.preset);
  });
  function closeHelp() {
    for(const button of form.querySelectorAll('[data-help]')) {
      button.setAttribute('aria-expanded','false');document.getElementById(button.getAttribute('aria-controls')).hidden=true;
    }
  }
  for(const button of form.querySelectorAll('[data-help]')) {
    const open=()=>{closeHelp();button.setAttribute('aria-expanded','true');document.getElementById(button.getAttribute('aria-controls')).hidden=false;};
    button.addEventListener('focus',open);button.addEventListener('click',open);
  }
  document.addEventListener('keydown',event=>{if(event.key==='Escape')closeHelp();});
  document.addEventListener('click',event=>{if(!event.target.closest('.planning-field'))closeHelp();});
  apply.addEventListener('click',()=>onApplyOption(latest.recommendation));
  return {
    reset(){dirty=false;closeHelp();},
    render(m,lang,defaultValues) {
      language=lang;defaults=defaultValues;
      applied={...m.settings,euEnergyMJ:m.modelVessel.euEnergyMJ,actualWtWIntensity:m.modelVessel.actualWtWIntensity};
      if(!dirty){draft={};for(const field of fields)draft[field.name]=applied[field.name];for(const key of confirmationKeys)draft[key]=applied[key];writeInputs();}
      const chips=[['eua',`EUA €${num(applied.euaPrice)}`],['fuelTonnes',text(`燃油 ${num(mjToTonnes(applied.euEnergyMJ),4)} 等效吨`,`Fuel ${num(mjToTonnes(applied.euEnergyMJ),4)} equivalent t`)],['bunkerPrice',text(`燃油价 €${num(applied.bunkerPrice)}/等效吨`,`Fuel €${num(applied.bunkerPrice)}/equivalent t`)],['blendPremium',text(`溢价 €${num(applied.blendPremium)}/等效吨`,`Premium €${num(applied.blendPremium)}/equivalent t`)],['poolPrice',text(`组池 €${num(applied.poolPrice)}/tCB`,`Pool €${num(applied.poolPrice)}/tCB`)],['poolAvailable',text(`可用 ${num(applied.poolAvailable)} tCB`,`Available ${num(applied.poolAvailable)} tCB`)],['maxExtraHours',text(`航时上限 ${num(applied.maxExtraHours)} h`,`Extra-time limit ${num(applied.maxExtraHours)} h`)],['actualWtWIntensity',text(`生命周期强度 ${num(applied.actualWtWIntensity,4)}`,`Lifecycle intensity ${num(applied.actualWtWIntensity,4)}`)]];
      document.getElementById('assumptionTags').innerHTML=chips.map(([name,label])=>`<button type="button" class="assumption-tag" data-jump="${name}">${label}</button>`).join('');
      document.getElementById('poolSupplySummary').textContent=text(`可用量 ${num(applied.poolAvailable)} tCB`,`Available ${num(applied.poolAvailable)} tCB`);
      for(const button of form.querySelectorAll('[data-help]'))button.setAttribute('aria-label',text('说明：','Explanation: ')+button.previousElementSibling.textContent);
      for(const field of [tonnes,...fields])if(field.getAttribute('aria-invalid')==='true')validate(field);
      document.getElementById('planningBaseInputs').textContent=text(
        `基准生命周期强度 ${num(m.modelVessel.actualWtWIntensity,4)} gCO₂e/MJ · 范围内能源 ${num(m.modelVessel.euEnergyMJ,0)} MJ · 基准航速 ${num(m.modelVessel.serviceSpeedKn,1)} kn`,
        `Base lifecycle intensity ${num(m.modelVessel.actualWtWIntensity,4)} gCO₂e/MJ · Scoped energy ${num(m.modelVessel.euEnergyMJ,0)} MJ · Base speed ${num(m.modelVessel.serviceSpeedKn,1)} kn`);
      document.getElementById('planningCurrentInputs').textContent=text(
        `当前模型：${num(m.comparison.active.actualIntensity,4)} gCO₂e/MJ · ${num(m.comparison.active.energyMJ,0)} MJ（含新增航时辅助燃油）`,
        `Active model: ${num(m.comparison.active.actualIntensity,4)} gCO₂e/MJ · ${num(m.comparison.active.energyMJ,0)} MJ (including extra-time auxiliary fuel)`);
      latest=planOptions(m.modelVessel,m.settings);
      const base=latest.rows[0];
      document.getElementById('optionCompareBody').innerHTML=latest.rows.map(option=>`<tr>
        <td><strong>${names[option.id][lang==='zh'?0:1]}</strong><br>${num(option.speedDelta,1)} kn / ${num(option.blendPct,1)}% / ${num(option.allocatedPoolTonnes,4)} tCB</td>
        <td class="num"><strong>${money(option.totalEur)}</strong><br>Δ ${money(option.totalEur-base.totalEur)}</td>
        <td class="num">${money(option.ownerScopedEur)}</td><td class="num">${money(option.chartererScopedEur)}</td>
        <td class="num option-extra">${num(option.extraHours)} h</td><td>${status(option)}</td>
        <td class="num option-extra">${money(option.euEts)}</td><td class="num option-extra">${money(option.fuelEu)}</td><td class="num option-extra">${money(option.poolCost)}</td>
        <td class="num option-extra">${money(option.blendCost-option.fuelSaving)}</td><td class="num option-extra">${money(option.timeCost)}</td></tr>`).join('');
      const best=latest.recommendation;
      document.getElementById('planningRecommendation').innerHTML=`<strong>${best.pending.length?text('最低成本待确认候选','Lowest-cost candidate: confirmation needed'):text('已确认输入下的最低模型成本候选','Lowest model-cost candidate under confirmed inputs')}</strong>
        <p>${text('航速调整','Speed change')} ${num(best.speedDelta,1)} kn · ${text('燃料能源占比','Fuel energy share')} ${num(best.blendPct,1)}% · ${text('实际组池','Allocated pool')} ${num(best.allocatedPoolTonnes,4)} tCB</p>
        <p>${text('欧元费用比较值','EUR comparison value')} <b>${money(best.totalEur)}</b> · Δ ${money(best.totalEur-base.totalEur)} · +${num(best.extraHours)} h</p>
        <p>${text('构成：合规（含组池）','Breakdown: compliance incl. pool')} ${money(best.complianceEur)} · ${text('燃料净增量','Net fuel delta')} ${money(best.blendCost-best.fuelSaving)} · ${text('航时费','Time cost')} ${money(best.timeCost)}</p>
        <p>${status(best)}. ${text('只最小化表列欧元成本，不含 UK 英镑费用，未加回共有基准燃油账单，比较值可为负，不代表应付账单、利润或已核验的执行建议。','Minimizes listed EUR costs only; excludes UK GBP and common baseline fuel costs. Values can be negative and are not payable bills, profit or verified execution advice.')}</p>`;
      document.getElementById('planningSearchScope').textContent=text(
        `比较 ${latest.candidateCount} 个满足数值限制的组合：航速 0 至 −2 kn、步长 0.2；燃料 0 至 ${m.settings.maxBlendPct}%、步长 5 个百分点并包含上限；组池比较不用与可用量内补缺口两端，并纳入当前有效方案。若有用户确认条件的方案，优先在其中选最低成本者；否则仅显示待确认候选。`,
        `${latest.candidateCount} combinations within numerical limits: speed 0 to −2 kn in 0.2 steps; fuel 0 to ${m.settings.maxBlendPct}% in 5-point steps plus the exact limit; pooling zero or capped supply, plus the valid current option. Choose the lowest cost among user-confirmed candidates when any exist; otherwise show a pending candidate.`);
      draftNote();
      return latest;
    }
  };
}
