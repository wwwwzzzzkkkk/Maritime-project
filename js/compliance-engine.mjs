// Deterministic teaching model. Inputs are bounded by the UI; no regulatory verification is performed.
export const MODEL_VERSION = 'light-4.2.0';
export const ASSUMPTIONS = Object.freeze({
  referenceIntensity: 91.16,
  vlsfoMJPerTonne: 41000,
  penaltyPerEquivalentTonne: 2400,
  sailingEnergyShare: 0.88,
  blendTtwReduction: 0.26,
  blendWtwReduction: 0.32
});

export function defaultSettings() {
  return {
    year: 2026, euaPrice: 80, ukPrice: 60, speedDelta: 0, blendPct: 0,
    poolingTonnes: 0, poolAvailable: 400, poolPrice: 180,
    bunkerPrice: 550, blendPremium: 260, consecutiveDeficits: 1,
    etsOwnerPct: 85, fuelOwnerPct: 85, poolOwnerPct: 85,
    hoursSaved: 120, advisorSavings: 2000, internalCost: 0,
    distanceNm: 6000, maxExtraHours: 24, dailyTimeCost: 5000, maxBlendPct: 30,
    auxFuelPerDay: 2, auxCo2Factor: 3.114, auxCoveragePct: 100,
    operationsConfirmed: false, fuelConfirmed: false, poolConfirmed: false, operatingOwnerPct: 85
  };
}

export function intensityTarget(year) {
  return ASSUMPTIONS.referenceIntensity * (1 - (year < 2030 ? 0.02 : 0.06));
}

export function fuelPenalty(balanceGrams, actualIntensity, consecutiveDeficits) {
  const deficitGrams = Math.max(-balanceGrams, 0);
  const base = deficitGrams / (actualIntensity * ASSUMPTIONS.vlsfoMJPerTonne)
    * ASSUMPTIONS.penaltyPerEquivalentTonne;
  return base * (1 + (consecutiveDeficits - 1) / 10);
}

export function computeScenario(vessel, settings) {
  const blend = settings.blendPct / 100;
  const speedRatio = (vessel.serviceSpeedKn + settings.speedDelta) / vessel.serviceSpeedKn;
  // Fixed-distance propulsion approximation. Stationary energy is held constant.
  const sailingFactor = speedRatio ** 2;
  const energyFactor = ASSUMPTIONS.sailingEnergyShare * sailingFactor
    + (1 - ASSUMPTIONS.sailingEnergyShare);
  const extraHours = settings.distanceNm / (vessel.serviceSpeedKn + settings.speedDelta)
    - settings.distanceNm / vessel.serviceSpeedKn;
  const timeCost = extraHours / 24 * settings.dailyTimeCost;
  const extraAuxFuelTonnes = extraHours / 24 * settings.auxFuelPerDay;
  const extraAuxEnergyMJ = extraAuxFuelTonnes * ASSUMPTIONS.vlsfoMJPerTonne;
  const co2BlendFactor = 1 - blend * ASSUMPTIONS.blendTtwReduction;
  const legs = vessel.legs.map(leg => {
    const co2Tonnes = leg.co2Tonnes * co2BlendFactor * (leg.activity === 'sailing' ? sailingFactor : 1);
    const coveredTonnes = co2Tonnes * leg.coverage;
    const unitPrice = leg.currency === 'EUR' ? settings.euaPrice : settings.ukPrice;
    return { ...leg, co2Tonnes, coveredTonnes, unitPrice, cost: coveredTonnes * unitPrice };
  });
  // Additional auxiliary fuel is in the same declared FuelEU comparison scope.
  if (extraAuxFuelTonnes > 0) {
    const co2Tonnes = extraAuxFuelTonnes * settings.auxCo2Factor * co2BlendFactor;
    const coverage = settings.auxCoveragePct / 100;
    legs.push({id:'AUX', activity:'auxiliary', currency:'EUR', co2Tonnes, coverage,
      coveredTonnes:co2Tonnes * coverage, unitPrice:settings.euaPrice,
      cost:co2Tonnes * coverage * settings.euaPrice});
  }
  const euLegs = legs.filter(leg => leg.currency === 'EUR');
  const ukLegs = legs.filter(leg => leg.currency === 'GBP');
  const euCoveredCo2 = euLegs.reduce((sum, leg) => sum + leg.coveredTonnes, 0);
  const ukCoveredCo2 = ukLegs.reduce((sum, leg) => sum + leg.coveredTonnes, 0);
  const euEts = euCoveredCo2 * settings.euaPrice;
  const ukEts = ukCoveredCo2 * settings.ukPrice;
  const energyMJ = vessel.euEnergyMJ * energyFactor + extraAuxEnergyMJ;
  const actualIntensity = vessel.actualWtWIntensity * (1 - blend * ASSUMPTIONS.blendWtwReduction);
  const target = intensityTarget(settings.year);
  const rawBalanceGrams = (target - actualIntensity) * energyMJ;
  const deficitTonnes = Math.max(-rawBalanceGrams / 1e6, 0);
  // Allocation is capped by demand and the separately declared available surplus.
  const allocatedPoolTonnes = Math.min(settings.poolingTonnes, settings.poolAvailable, deficitTonnes);
  const netBalanceGrams = rawBalanceGrams + allocatedPoolTonnes * 1e6;
  const unpooledPenalty = fuelPenalty(rawBalanceGrams, actualIntensity, settings.consecutiveDeficits);
  const fuelEu = fuelPenalty(netBalanceGrams, actualIntensity, settings.consecutiveDeficits);
  const poolCost = allocatedPoolTonnes * settings.poolPrice;
  const baseEquivalentTonnes = vessel.euEnergyMJ / ASSUMPTIONS.vlsfoMJPerTonne;
  const fuelSaving = (baseEquivalentTonnes - energyMJ / ASSUMPTIONS.vlsfoMJPerTonne) * settings.bunkerPrice;
  const blendCost = energyMJ / ASSUMPTIONS.vlsfoMJPerTonne * blend * settings.blendPremium;
  const operatingDelta = blendCost - fuelSaving + timeCost;
  const complianceEur = euEts + fuelEu + poolCost;
  const totalEur = complianceEur + operatingDelta;
  const ownerEur = euEts * settings.etsOwnerPct / 100
    + fuelEu * settings.fuelOwnerPct / 100 + poolCost * settings.poolOwnerPct / 100;
  return {
    extraHours, timeCost, extraAuxFuelTonnes, extraAuxEnergyMJ,
    ownerScopedEur:ownerEur + operatingDelta * settings.operatingOwnerPct / 100,
    chartererScopedEur:complianceEur - ownerEur + operatingDelta * (1 - settings.operatingOwnerPct / 100),
    legs, euCoveredCo2, ukCoveredCo2, euEts, ukEts, energyMJ, actualIntensity, target,
    rawBalanceGrams, netBalanceGrams, deficitTonnes, allocatedPoolTonnes,
    unpooledPenalty, fuelEu, poolCost, fuelSaving, blendCost, operatingDelta,
    complianceEur, totalEur, ownerEur, chartererEur: complianceEur - ownerEur,
    physicalWtWTonnes: energyMJ * actualIntensity / 1e6,
    etsComplete: false // This edition intentionally calculates CO2 subtotals, not three-gas ETS totals.
  };
}

export function compareOptions(vessel, settings) {
  const baseSettings = { ...settings, speedDelta: 0, blendPct: 0, poolingTonnes: 0 };
  const baseline = computeScenario(vessel, baseSettings);
  const active = computeScenario(vessel, settings);
  const pooling = computeScenario(vessel, { ...baseSettings, poolingTonnes: baseline.deficitTonnes });
  const costDelta = active.totalEur - baseline.totalEur;
  const physicalDelta = active.physicalWtWTonnes - baseline.physicalWtWTonnes;
  const drivers = {
    etsOperations: active.euEts - baseline.euEts,
    fuelOperations: active.unpooledPenalty - baseline.fuelEu,
    poolPenalty: active.fuelEu - active.unpooledPenalty,
    poolFees: active.poolCost,
    operatingCosts: active.operatingDelta
  };
  return {
    baseline, active, pooling, costDelta, physicalDelta, drivers,
    costDeltaPct: costDelta / baseline.totalEur * 100,
    physicalDeltaPct: physicalDelta / baseline.physicalWtWTonnes * 100,
    priceEffectVs80: baseline.euCoveredCo2 * (settings.euaPrice - 80),
    priceEffectVs80Gbp: baseline.ukCoveredCo2 * (settings.ukPrice - 60)
  };
}

export function clientValue(settings) {
  const labor = settings.hoursSaved * 40;
  const gross = labor + settings.advisorSavings;
  return { labor, gross, recurring: gross - 4800 - settings.internalCost, year1: gross - 5400 - settings.internalCost };
}

export function ventureEconomics(clients, contribution, fixedCost) {
  return { result: clients * contribution - fixedCost, breakEven: Math.ceil(fixedCost / contribution) };
}
