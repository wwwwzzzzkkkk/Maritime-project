import { ASSUMPTIONS } from './compliance-engine.mjs?v=4.4.0';

// VLSFO-equivalent display conversion; canonical energy remains euEnergyMJ.
export const tonnesToMJ = tonnes => tonnes * ASSUMPTIONS.vlsfoMJPerTonne;
export const mjToTonnes = energyMJ => energyMJ / ASSUMPTIONS.vlsfoMJPerTonne;
