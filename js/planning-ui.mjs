import { planOptions } from './option-planner.mjs?v=4.2.0';

export function createPlanningUi({onApplyInputs,onApplyOption}) {
  const form=document.getElementById('planningForm');
  const note=document.getElementById('planningDraftNote');
  const apply=document.getElementById('applyRecommendedOption');
  let dirty=false,language='zh',latest;
  const money=value=>new Intl.NumberFormat('en-GB',{style:'currency',currency:'EUR',maximumFractionDigits:2}).format(value);
  const num=(value,digits=2)=>new Intl.NumberFormat('en-GB',{maximumFractionDigits:digits}).format(value);
  const text=(zh,en)=>language==='zh'?zh:en;
  const reasonLabels={timeLimit:['超过允许新增航时','Exceeds extra-time limit'],fuelLimit:['超过可用燃料比例','Exceeds fuel-share limit'],operations:['运营输入未确认','Operating inputs unconfirmed'],fuel:['燃料条件未确认','Fuel conditions unconfirmed'],pool:['组池供给未确认','Pool supply unconfirmed']};
  const names={baseline:['保持现状','Unmodified baseline'],current:['当前方案','Current option'],speed:['仅调整航速（范围内最低）','Speed only (lowest in range)'],fuel:['仅调整燃料（范围内最低）','Fuel only (lowest in range)'],pooling:['仅使用可用组池','Available pooling only'],combined:['组合搜索最低候选','Lowest search candidate']};
  function status(option) {
    const keys=option.withinLimits?option.pending:option.reasons;
    return keys.length?keys.map(key=>reasonLabels[key][language==='zh'?0:1]).join(' / '):text('输入条件满足（用户确认）','Input conditions met (user-confirmed)');
  }
  function draftNote() {
    note.textContent=dirty?text('有未应用更改：结果仍使用上次已应用的输入。点击“应用输入并比较”后更新。','Unapplied changes: results still use the last applied inputs. Select Apply Inputs & Compare to update.'):
      text('已应用输入。所有金额仍为示例模型估算，确认勾选不等于外部核验。','Inputs applied. Amounts remain demo-model estimates; confirmation is not external verification.');
    apply.disabled=dirty;
  }
  form.addEventListener('input',()=>{dirty=true;draftNote();});
  form.addEventListener('submit',event=>{
    event.preventDefault();
    const values={};
    for(const field of form.querySelectorAll('[name]'))values[field.name]=field.type==='checkbox'?field.checked:Number(field.value);
    dirty=false;onApplyInputs(values);
  });
  apply.addEventListener('click',()=>onApplyOption(latest.recommendation));
  return {
    reset(){dirty=false;},
    render(m,lang) {
      language=lang;
      const values={...m.settings,euEnergyMJ:m.modelVessel.euEnergyMJ,actualWtWIntensity:m.modelVessel.actualWtWIntensity};
      if(!dirty)for(const field of form.querySelectorAll('[name]')) {
        if(field.type==='checkbox')field.checked=values[field.name];else field.value=values[field.name];
      }
      document.getElementById('planningBaseInputs').textContent=text(
        `基准强度 ${num(m.modelVessel.actualWtWIntensity,4)} gCO₂e/MJ · 范围内能源 ${num(m.modelVessel.euEnergyMJ,0)} MJ · 基准航速 ${num(m.modelVessel.serviceSpeedKn,1)} kn`,
        `Base intensity ${num(m.modelVessel.actualWtWIntensity,4)} gCO₂e/MJ · Scoped energy ${num(m.modelVessel.euEnergyMJ,0)} MJ · Base speed ${num(m.modelVessel.serviceSpeedKn,1)} kn`);
      document.getElementById('planningCurrentInputs').textContent=text(
        `当前模型：${num(m.comparison.active.actualIntensity,4)} gCO₂e/MJ · ${num(m.comparison.active.energyMJ,0)} MJ（含新增航时辅助燃油）`,
        `Active model: ${num(m.comparison.active.actualIntensity,4)} gCO₂e/MJ · ${num(m.comparison.active.energyMJ,0)} MJ (including extra-time auxiliary fuel)`);
      latest=planOptions(m.modelVessel,m.settings);
      const base=latest.rows[0];
      document.getElementById('optionCompareBody').innerHTML=latest.rows.map(option=>`<tr>
        <td><strong>${names[option.id][lang==='zh'?0:1]}</strong><br>${num(option.speedDelta,1)} kn / ${num(option.blendPct,1)}% / ${num(option.allocatedPoolTonnes,4)} tCB</td>
        <td class="num"><strong>${money(option.totalEur)}</strong><br>Δ ${money(option.totalEur-base.totalEur)}</td>
        <td class="num">${money(option.ownerScopedEur)}</td><td class="num">${money(option.chartererScopedEur)}</td>
        <td class="num">${num(option.extraHours)} h</td><td>${status(option)}</td>
        <td class="num">${money(option.euEts)}</td><td class="num">${money(option.fuelEu)}</td><td class="num">${money(option.poolCost)}</td>
        <td class="num">${money(option.blendCost-option.fuelSaving)}</td><td class="num">${money(option.timeCost)}</td></tr>`).join('');
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
