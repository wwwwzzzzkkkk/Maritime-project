import { defaultSettings,compareOptions } from './compliance-engine.mjs?v=4.5.1';
import { vessels } from './light-data.mjs?v=4.5.1';
import { compileLedger,validateLedger } from './ledger.mjs?v=4.5.1';
export const WORKSPACE_SCHEMA='mareg-workspace-v1';
const range=(x,min,max)=>typeof x==='number'&&Number.isFinite(x)&&x>=min&&x<=max;
const limits={euaPrice:[50,120],ukPrice:[0,1000],speedDelta:[-2,0],blendPct:[0,50],poolingTonnes:[0,10000],poolAvailable:[0,10000],poolPrice:[0,10000],bunkerPrice:[0,10000],blendPremium:[0,10000],distanceNm:[1,1e6],maxExtraHours:[0,100000],dailyTimeCost:[0,1e6],maxBlendPct:[0,50],auxFuelPerDay:[0,1000],auxCo2Factor:[.01,10],auxCoveragePct:[0,100]};
export function validateAnalysis(input) {
  if(!input||typeof input!=='object'||!['v1','v2','v3'].includes(input.selectedVesselId)||!['as_is','amended','deadlock'].includes(input.selectedScenario)||!['zh','en'].includes(input.language))throw new Error('分析对象或语言无效 / Invalid analysis identity or language');
  const t=input.twin;
  if(!t||!range(t.euaPrice,50,120)||!range(t.jitSpeedDeltaKn,-2,0)||!range(t.biofuelBlendPct,0,50)||!range(t.poolingSurplusTonnes,0,10000)||![2,6].includes(t.fueleuTargetCut)||!['voyage_gencon','time_nype_bimco','split_blue_ga'].includes(t.charterType))throw new Error('情景输入越界 / Scenario inputs outside bounds');
  const settings={...defaultSettings()};
  for(const key of Object.keys(settings)) {
    const value=input.settings?.[key];
    if(typeof settings[key]==='boolean'){if(typeof value!=='boolean')throw new Error('确认状态缺失 / Missing confirmation state');}
    else if(!Number.isFinite(value))throw new Error('分析包含无效数值 / Invalid numeric analysis input');
    if(limits[key]&&!range(value,...limits[key]))throw new Error(`输入越界 / Out-of-range input: ${key}`);
    // Fields not exposed by this UI retain their original defaults on import.
    settings[key]=limits[key]||typeof settings[key]==='boolean'?value:settings[key];
  }
  const vesselInputs={},ledgerDocuments={};
  for(const id of ['v1','v2','v3']) {
    const values=input.vesselInputs?.[id];
    if(values){if(!range(values.euEnergyMJ,1000,1e12)||!range(values.actualWtWIntensity,1,200))throw new Error('船舶能源或强度越界 / Vessel inputs outside bounds');vesselInputs[id]={euEnergyMJ:values.euEnergyMJ,actualWtWIntensity:values.actualWtWIntensity};}
    const ledger=input.ledgerDocuments?.[id];if(ledger){validateLedger(ledger);const compiled=compileLedger(ledger,id);if(id===input.selectedVesselId&&Math.abs(settings.distanceNm-compiled.screened.distanceNm)>1e-8)throw new Error('台账距离必须来自同一记录 / Ledger distance must match its records');ledgerDocuments[id]=structuredClone(ledger);}
  }
  return {selectedVesselId:input.selectedVesselId,selectedScenario:input.selectedScenario,language:input.language,
    twin:{euaPrice:t.euaPrice,jitSpeedDeltaKn:t.jitSpeedDeltaKn,biofuelBlendPct:t.biofuelBlendPct,poolingSurplusTonnes:t.poolingSurplusTonnes,fueleuTargetCut:t.fueleuTargetCut,charterType:t.charterType},settings,vesselInputs,ledgerDocuments};
}
export function evaluateAnalysis(a) {
  const ledger=a.ledgerDocuments[a.selectedVesselId];
  const vessel=ledger?compileLedger(ledger,a.selectedVesselId).vessel:{...vessels.find(v=>v.id===a.selectedVesselId),...a.vesselInputs[a.selectedVesselId]};
  if(!ledger&&a.selectedVesselId==='v1')vessel.name='MV DEMO-01';
  const owner={voyage_gencon:85,time_nype_bimco:18,split_blue_ga:50}[a.twin.charterType];
  const settings={...a.settings,year:a.twin.fueleuTargetCut===6?2030:2026,euaPrice:a.twin.euaPrice,speedDelta:a.twin.jitSpeedDeltaKn,blendPct:a.twin.biofuelBlendPct,poolingTonnes:a.twin.poolingSurplusTonnes,etsOwnerPct:owner,fuelOwnerPct:owner,poolOwnerPct:owner,operatingOwnerPct:owner};
  return {vessel,settings,comparison:compareOptions(vessel,settings)};
}
export function validateWorkspace(file) {
  if(file?.schema!==WORKSPACE_SCHEMA||typeof file.name!=='string'||!file.name.trim()||file.name.length>80||!Array.isArray(file.cases)||file.cases.length>12)throw new Error('请导入本版工作区 JSON，旧计算快照不能恢复 / Import a workspace JSON; old snapshots are read-only records');
  const input=validateAnalysis(file.input);
  const cases=file.cases.map(c=>{if(typeof c.name!=='string'||!c.name.trim()||c.name.length>80)throw new Error('情景名称无效 / Invalid scenario name');return {name:c.name,input:validateAnalysis(c.input)};});
  return {schema:WORKSPACE_SCHEMA,name:file.name.trim(),savedAt:typeof file.savedAt==='string'?file.savedAt:'',input,cases};
}
