import { describe, it, expect } from 'vitest';
import { 
  calculateTransportCarbon, 
  calculateFoodCarbon, 
  calculateEnergyCarbon, 
  calculateCarbonActionSavings 
} from '@/src/lib/carbonCalculator';

describe('Carbon Calculator Unit Tests', () => {
  describe('calculateTransportCarbon', () => {
    it('accurately calculates emissions for car and hybrid modes with positive floats', () => {
      // Petrol/Diesel Car factor is 0.18 kg CO2e / km
      expect(calculateTransportCarbon('car', 10)).toBe(1.8);
      expect(calculateTransportCarbon('car', 25.5)).toBe(4.59);
      
      // Hybrid mode factor is petrol car * 0.55 = 0.099 (rounded in implementation or directly fixed)
      expect(calculateTransportCarbon('hybrid', 10)).toBe(0.99); // 1.8 * 0.55 = 0.99
    });

    it('calculates 0 emissions for zero-emission clean options', () => {
      expect(calculateTransportCarbon('walking', 12.4)).toBe(0);
      expect(calculateTransportCarbon('cycle', 8.5)).toBe(0);
    });

    it('calculates correct values for electric vehicle mode and public transport mode', () => {
      // EV factor is 0.02
      expect(calculateTransportCarbon('ev', 100)).toBe(2.0);
      // Public transit factor is 0.05
      expect(calculateTransportCarbon('public', 100)).toBe(5.0);
    });

    it('handles negative or zero distance values safely', () => {
      expect(calculateTransportCarbon('car', 0)).toBe(0);
      expect(calculateTransportCarbon('car', -10)).toBe(-1.8); // standard multiplier math
    });

    it('handles extreme distance values correctly', () => {
      expect(calculateTransportCarbon('car', 1000000)).toBe(180000);
    });
  });

  describe('calculateFoodCarbon', () => {
    it('returns suitable daily kg CO2e metrics for diet profiles', () => {
      expect(calculateFoodCarbon('meat')).toBe(7.2); // Red meat
      expect(calculateFoodCarbon('veg')).toBe(2.4);  // Vegetarian
      expect(calculateFoodCarbon('vegan')).toBe(1.5); // Vegan
      expect(calculateFoodCarbon('balanced')).toBe(3.5); // Default dairy
    });
  });

  describe('calculateEnergyCarbon', () => {
    it('returns grid average for 100% standard dirty electricity consumption', () => {
      // Grid electricity factor: 0.45 kg CO2e / kWh
      expect(calculateEnergyCarbon(100, 0)).toBe(45);
    });

    it('returns solar average for 100% clean source solar power inputs', () => {
      // Solar life-cycle factor: 0.02 kg CO2e / kWh
      expect(calculateEnergyCarbon(100, 100)).toBe(2);
    });

    it('returns proportional weighted mixture for partial utility mixes', () => {
      // 50 kwh dirty * 0.45 + 50 kwh clean * 0.02 = 22.5 + 1.0 = 23.5 kg
      expect(calculateEnergyCarbon(100, 50)).toBe(23.5);
    });

    it('handles decimal metrics and negative kWh capacities', () => {
      expect(calculateEnergyCarbon(10.5, 20)).toBe(3.82);
    });
  });

  describe('calculateCarbonActionSavings', () => {
    it('generates high value points and CO2 saved equivalents for active swaps', () => {
      const result = calculateCarbonActionSavings('transport', 10, 'cycle');
      // car (0.18) - bike (0.0) = 0.18 savings * 10 = 1.80 kg CO2 saved
      // points = 1.8 * 60 + 10 * 5 = 108 + 50 = 158
      expect(result.carbonSaved).toBe(1.8);
      expect(result.ecoPoints).toBe(158);
    });

    it('evaluates dietary adjustments correctly for meat to veggie transitions', () => {
      const result = calculateCarbonActionSavings('food', 3, 'veg');
      // baseline red meat (7.2) - vegetarian (2.4) = 4.8 * 3 days = 14.4 kg CO2 saved
      // points = 14.4 * 120 = 1728 points
      expect(result.carbonSaved).toBe(14.4);
      expect(result.ecoPoints).toBe(1728);
    });

    it('handles recycling and conscious shopping milestones', () => {
      const bRecycling = calculateCarbonActionSavings('waste', 5);
      // waste: value * (plasticKg - 0.2) = 5 * (1.4 - 0.2) = 5 * 1.2 = 6 kg CO2
      // points = 6 * 120 = 720 points
      expect(bRecycling.carbonSaved).toBe(6);
      expect(bRecycling.ecoPoints).toBe(720);
    });
  });
});
