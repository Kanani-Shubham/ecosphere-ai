import { CarbonCalculationService } from '../services/CarbonCalculationService';

// Re-expose emission factors directly from the centralized service to keep states in sync
export const EMISSION_FACTORS = {
  transport: {
    car: 0.18,
    hybrid: 0.10,
    ev: 0.02,
    public: 0.05,
    cycle: 0.0,
    walking: 0.0
  },
  food: {
    meat: 6.8,
    balanced: 4.1,
    veg: 2.4,
    vegan: 1.5
  },
  energy: {
    gridKwh: 0.38,
    solarKwh: 0.02
  },
  waste: {
    landfillKg: 1.2,
    recycledKg: 0.2
  },
  shopping: {
    electronics: 15.0,
    clothing: 4.5,
    groceries: 1.8,
    localGroceries: 0.4
  }
};

/**
 * Calculates transit carbon impact using central calculation service
 */
export function calculateTransportCarbon(
  mode: 'car' | 'hybrid' | 'ev' | 'public' | 'cycle' | 'walking',
  distanceKm: number
): number {
  if (mode === 'walking') {
    return CarbonCalculationService.calculateTransport('walk', distanceKm);
  }
  if (mode === 'cycle') {
    return CarbonCalculationService.calculateTransport('bicycle', distanceKm);
  }
  if (mode === 'public') {
    return CarbonCalculationService.calculateTransport('bus', distanceKm);
  }
  if (mode === 'hybrid') {
    return Number((CarbonCalculationService.calculateTransport('car', distanceKm) * 0.55).toFixed(2));
  }
  if (mode === 'ev') {
    return CarbonCalculationService.calculateTransport('ev', distanceKm);
  }
  return CarbonCalculationService.calculateTransport('car', distanceKm);
}

/**
 * Calculates food emissions using central calculation service
 */
export function calculateFoodCarbon(diet: 'meat' | 'balanced' | 'veg' | 'vegan'): number {
  if (diet === 'meat') {
    return CarbonCalculationService.calculateFood('redMeat', 1);
  }
  if (diet === 'veg') {
    return CarbonCalculationService.calculateFood('vegetarian', 1);
  }
  if (diet === 'vegan') {
    return CarbonCalculationService.calculateFood('vegan', 1);
  }
  return CarbonCalculationService.calculateFood('dairy', 1);
}

/**
 * Calculates energy utility footprints using central calculation service
 */
export function calculateEnergyCarbon(kwh: number, cleanSourcePercent: number = 0): number {
  const dirtyKwh = (kwh * (100 - cleanSourcePercent)) / 100;
  const cleanKwh = (kwh * cleanSourcePercent) / 100;
  
  const dirtyCarbon = CarbonCalculationService.calculateEnergy('electricity', dirtyKwh);
  const cleanCarbon = CarbonCalculationService.calculateEnergy('solar', cleanKwh);
  
  return Number((dirtyCarbon + cleanCarbon).toFixed(2));
}

/**
 * Calculates carbon savings comparing user current practice vs baseline using central service
 */
export function calculateCarbonActionSavings(
  category: 'transport' | 'food' | 'energy' | 'waste' | 'shopping',
  actionValue: number,
  modeArg?: string
): { carbonSaved: number; ecoPoints: number } {
  // Convert legacy mode arguments to fit Service signature
  let targetMode = modeArg;
  if (category === 'transport') {
    if (modeArg === 'cycle') targetMode = 'bicycle';
    if (modeArg === 'walking') targetMode = 'walk';
    if (modeArg === 'public') targetMode = 'bus';
  } else if (category === 'food') {
    if (modeArg === 'meat') targetMode = 'redMeat';
  }

  return CarbonCalculationService.getCalculationSavings(category, actionValue, targetMode);
}
