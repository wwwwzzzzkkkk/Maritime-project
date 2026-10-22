import { computeScenario } from './compliance-engine.mjs?v=4.7.3';

// Deterministic finite search. Pooling costs are linear, so evaluate zero and capped supply.
export function assessOption(result, settings) {
  const reasons=[];
  if(result.extraHours > settings.maxExtraHours + 1e-8)reasons.push('timeLimit');
  if(result.blendPct > settings.maxBlendPct)reasons.push('fuelLimit');
  const pending=[];
  if(!settings.operationsConfirmed)pending.push('operations');
  if(result.blendPct > 0 && !settings.fuelConfirmed)pending.push('fuel');
  if(result.allocatedPoolTonnes > 0 && !settings.poolConfirmed)pending.push('pool');
  return {withinLimits:reasons.length===0,reasons,pending};
}

export function planOptions(vessel, settings) {
  function evaluate(id,speedDelta,blendPct,usePool,poolingTonnes=0) {
    const input={...settings,speedDelta,blendPct,poolingTonnes:usePool?settings.poolAvailable:poolingTonnes};
    const result={...computeScenario(vessel,input),id,speedDelta,blendPct};
    return {...result,...assessOption(result,settings)};
  }
  const baseline=evaluate('baseline',0,0,false);
  const current=evaluate('current',settings.speedDelta,settings.blendPct,false,settings.poolingTonnes);
  const speeds=Array.from({length:11},(_,i)=>Number((-i*.2).toFixed(1)));
  const blends=[...new Set([...Array.from({length:Math.floor(settings.maxBlendPct/5)+1},(_,i)=>i*5),settings.maxBlendPct])];
  const candidates=[];
  for(const speed of speeds)for(const blend of blends)for(const pool of [false,true]) {
    const option=evaluate('combined',speed,blend,pool);
    if(option.withinLimits)candidates.push(option);
  }
  // A valid user-selected combination also competes, even if outside the search step grid.
  if(current.withinLimits)candidates.push(current);
  const cheapest=list=>list.reduce((best,x)=>x.totalEur<best.totalEur?x:best);
  const speed=cheapest(candidates.filter(x=>x.blendPct===0&&x.allocatedPoolTonnes===0));
  const fuel=cheapest(candidates.filter(x=>x.speedDelta===0&&x.allocatedPoolTonnes===0));
  const pool=evaluate('pooling',0,0,true);
  const combined=cheapest(candidates);
  const confirmed=candidates.filter(x=>x.pending.length===0);
  const recommendation=confirmed.length?cheapest(confirmed):combined;
  return {
    rows:[baseline,current,{...speed,id:'speed'},{...fuel,id:'fuel'},pool,{...combined,id:'combined'}],
    recommendation:{...recommendation,id:'recommendation'},
    candidateCount:candidates.length,
    search:{speedStepKn:.2,fuelStepPct:5,pooling:'zero-or-available-capped-by-deficit',objective:'scoped-EUR-excludes-GBP',includesCurrent:true}
  };
}
