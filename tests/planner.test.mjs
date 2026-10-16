import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultSettings, computeScenario } from '../js/compliance-engine.mjs';
import { planOptions } from '../js/option-planner.mjs?v=4.2.1';
import { vessels } from '../js/light-data.mjs';
const close=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-7,`${actual} != ${expected}`);

test('extra time, auxiliary energy/emissions and party amounts reconcile independently',()=>{
  const settings={...defaultSettings(),speedDelta:-1,distanceNm:6000,auxFuelPerDay:2,dailyTimeCost:5000};
  const m=computeScenario(vessels[0],settings);
  const hours=6000/12.5-6000/13.5;
  close(m.extraHours,hours);close(m.timeCost,hours/24*5000);
  close(m.extraAuxEnergyMJ,hours/24*2*41000);
  const aux=m.legs.find(l=>l.id==='AUX');close(aux.co2Tonnes,hours/24*2*3.114);
  close(m.euEts,m.legs.filter(l=>l.currency==='EUR').reduce((sum,l)=>sum+l.cost,0));
  close(m.totalEur,m.euEts+m.fuelEu+m.poolCost+m.blendCost-m.fuelSaving+m.timeCost);
  close(m.ownerScopedEur+m.chartererScopedEur,m.totalEur);
});

test('zero delay and fuel allowance exclude slower/blended candidates; current violation stays visible',()=>{
  const p=planOptions(vessels[0],{...defaultSettings(),maxExtraHours:0,maxBlendPct:0,speedDelta:-1,blendPct:20,poolAvailable:0});
  assert.equal(p.recommendation.speedDelta,0);assert.equal(p.recommendation.blendPct,0);
  assert.equal(p.rows[1].withinLimits,false);assert.deepEqual(p.rows[1].reasons,['timeLimit','fuelLimit']);
});

test('uncertain supply cannot displace a user-confirmed candidate',()=>{
  const s={...defaultSettings(),maxExtraHours:0,maxBlendPct:0,operationsConfirmed:true};
  const unconfirmed=planOptions(vessels[0],s);
  assert.equal(unconfirmed.recommendation.allocatedPoolTonnes,0);
  assert.ok(unconfirmed.rows[5].allocatedPoolTonnes>0);
  const confirmed=planOptions(vessels[0],{...s,poolConfirmed:true});
  assert.ok(confirmed.recommendation.allocatedPoolTonnes>0);assert.equal(confirmed.recommendation.pending.length,0);
});

test('expensive pooling stays unpurchased and positive-balance vessel is not sold fictitious savings',()=>{
  const s={...defaultSettings(),maxExtraHours:0,maxBlendPct:0,poolPrice:10000,operationsConfirmed:true,poolConfirmed:true};
  assert.equal(planOptions(vessels[0],s).recommendation.allocatedPoolTonnes,0);
  const p=planOptions(vessels[2],s);assert.equal(p.recommendation.allocatedPoolTonnes,0);
  close(p.recommendation.totalEur,p.rows[0].totalEur);
});

test('an exact non-grid fuel limit is considered; objective remains scoped EUR with separate UK ledger',()=>{
  const p=planOptions(vessels[0],{...defaultSettings(),maxExtraHours:0,maxBlendPct:7,poolAvailable:0,blendPremium:0,operationsConfirmed:true,fuelConfirmed:true});
  close(p.recommendation.blendPct,7);assert.equal(p.search.objective,'scoped-EUR-excludes-GBP');
  assert.ok(p.recommendation.ukEts>0);
});
