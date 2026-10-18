import test from 'node:test';
import assert from 'node:assert/strict';
import {tonnesToMJ,mjToTonnes} from '../js/inputs-adapter.mjs';
import {computeScenario,defaultSettings} from '../js/compliance-engine.mjs';
import {vessels} from '../js/light-data.mjs';

test('4000 VLSFO-equivalent tonnes and 164000000 MJ convert in both directions',()=>{
  assert.equal(tonnesToMJ(4000),164000000);
  assert.equal(mjToTonnes(164000000),4000);
});
test('conversion covers zero, original energy limits, and fractional equivalent tonnes',()=>{
  assert.equal(tonnesToMJ(0),0);assert.equal(mjToTonnes(0),0);
  for(const mj of [1000,1001,1000000000000])assert.ok(Math.abs(tonnesToMJ(mjToTonnes(mj))-mj)<=.000001);
  assert.equal(tonnesToMJ(4000.5),164020500);
  assert.equal(mjToTonnes(164020500),4000.5);
});
test('converted energy reproduces real engine benchmarks without engine edits',()=>{
  const s=defaultSettings(),v={...vessels[0],euEnergyMJ:tonnesToMJ(4000)};
  const before=computeScenario(vessels[0],s),after=computeScenario(v,s);
  assert.deepEqual(after,before);
  assert.equal(after.euEts,88000);assert.equal(after.ukEts,13200);
  assert.equal(after.fuelEu.toFixed(2),'237191.27');
  assert.equal(computeScenario(v,{...s,year:2030}).fuelEu.toFixed(2),'619346.72');
  assert.equal(Math.round(after.ownerEur),276413);assert.equal(Math.round(after.chartererEur),48779);
});
