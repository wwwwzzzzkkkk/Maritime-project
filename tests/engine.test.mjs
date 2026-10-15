import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultSettings, computeScenario, compareOptions, fuelPenalty, clientValue, ventureEconomics } from '../js/compliance-engine.mjs';
import { vessels } from '../js/light-data.mjs';

const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < .00001, `${actual} != ${expected}`);

test('A3 subtotals and single-period FuelEU examples reproduce the benchmark', () => {
  const settings = defaultSettings();
  const m = computeScenario(vessels[0], settings);
  close(m.euEts, 88000); close(m.ukEts, 13200);
  close(m.rawBalanceGrams / 1e6, -371.1648); close(m.fuelEu, 237191.26637554567);
  const future = computeScenario(vessels[0], { ...settings, year: 2030 });
  close(future.rawBalanceGrams / 1e6, -969.1744); close(future.fuelEu, 619346.7248908295);
  assert.equal(m.etsComplete, false);
});

test('surplus vessel has no penalty, fictitious savings or unnecessary pooling purchase', () => {
  const m = compareOptions(vessels[2], defaultSettings());
  close(m.baseline.rawBalanceGrams / 1e6, 161.4256);
  close(m.baseline.fuelEu, 0); close(m.costDelta, 0); close(m.pooling.poolCost, 0);
});

test('same-price baseline follows market inputs without changing physical emissions', () => {
  const base = compareOptions(vessels[0], defaultSettings());
  const higher = compareOptions(vessels[0], { ...defaultSettings(), euaPrice: 100 });
  close(higher.baseline.totalEur, 347191.2663755457);
  close(higher.costDelta, 0); close(higher.priceEffectVs80, 22000);
  close(higher.active.physicalWtWTonnes, base.active.physicalWtWTonnes);
});

test('pooling is capped by available surplus and leaves the correct residual penalty', () => {
  const m = computeScenario(vessels[0], { ...defaultSettings(), year: 2030, poolingTonnes: 371.165 });
  close(m.netBalanceGrams / 1e6, -598.0094); close(m.fuelEu, 382155.3307061455);
  const capped = compareOptions(vessels[0], { ...defaultSettings(), year: 2030 });
  close(capped.pooling.allocatedPoolTonnes, 400);
  assert.ok(capped.pooling.fuelEu > 0);
  const ample = compareOptions(vessels[0], { ...defaultSettings(), year: 2030, poolAvailable: 1200 });
  close(ample.pooling.fuelEu, 0); close(ample.pooling.poolCost, 969.1744 * 180);
});

test('pure pooling changes costs without changing the vessel physical estimate', () => {
  const m = compareOptions(vessels[0], { ...defaultSettings(), poolingTonnes: 375 });
  assert.ok(m.costDelta < 0); close(m.physicalDelta, 0);
});

test('repeated deficits escalate, while surplus never becomes a penalty', () => {
  close(fuelPenalty(-371164800, 91.6, 2), 237191.26637554567 * 1.1);
  close(fuelPenalty(161425600, 88.2, 2), 0);
});

test('all supported vessels, years and sensitivity prices obey accounting identities', () => {
  for (const vessel of vessels) for (const year of [2026,2030]) for (const euaPrice of [60,80,100]) {
    const settings = { ...defaultSettings(), year, euaPrice };
    const unchanged = compareOptions(vessel, settings);
    close(unchanged.costDelta, 0); close(unchanged.physicalDelta, 0);
    const comparison = compareOptions(vessel, { ...settings, speedDelta:-1, blendPct:15, poolingTonnes:300 });
    for (const m of [comparison.baseline, comparison.active, comparison.pooling]) {
      close(m.totalEur, m.euEts + m.fuelEu + m.poolCost + m.operatingDelta);
      close(m.ownerEur + m.chartererEur, m.complianceEur);
      close(m.ukEts, m.legs.filter(l => l.currency === 'GBP').reduce((sum,l) => sum+l.cost,0));
      assert.ok(m.fuelEu >= 0);
    }
    close(Object.values(comparison.drivers).reduce((sum,n)=>sum+n,0), comparison.costDelta);
  }
});

test('speed affects sailing energy and sailing legs, with port activity held constant', () => {
  const settings = { ...defaultSettings(), speedDelta:-2 };
  const m = computeScenario(vessels[0], settings);
  close(m.legs.find(l=>l.id==='E3').co2Tonnes, 100);
  close(m.legs.find(l=>l.id==='U2').co2Tonnes, 20);
  assert.ok(m.energyMJ < vessels[0].euEnergyMJ);
});

test('client and venture economics keep negative cases visible', () => {
  close(clientValue(defaultSettings()).year1, 1400);
  close(clientValue({ ...defaultSettings(), advisorSavings:0 }).year1, -600);
  close(clientValue({ ...defaultSettings(), internalCost:2000 }).year1, -600);
  assert.deepEqual(ventureEconomics(55,3200,180000), { result:-4000, breakEven:57 });
});
