import {
  HIGH_EMISSION_PERCENTAGE_THRESHOLD_TRANSPORT,
  HIGH_EMISSION_PERCENTAGE_THRESHOLD_FOOD,
  HIGH_EMISSION_PERCENTAGE_THRESHOLD_ENERGY,
  HIGH_EMISSION_PERCENTAGE_THRESHOLD_SHOPPING,
  HIGH_EMISSION_PERCENTAGE_THRESHOLD_WASTE
} from "../constants/carbon";

/**
 * CENTRALIZED CARBON CALCULATION SERVICE
 * EcoSphere AI's single source of truth for carbon calculations.
 * Used application-wide to assert realistic factors and emission footprints.
 */

export interface EmissionFactors {
  transport: {
    walk: number;
    bicycle: number;
    bike: number; // motor bike
    ev: number;
    car: number; // petrol car
    bus: number;
    train: number;
    flight: number;
  };
  food: {
    vegan: number;
    vegetarian: number;
    dairy: number;
    poultry: number;
    seafood: number;
    redMeat: number;
  };
  energy: {
    electricityKwh: number; // default grid
    solarKwh: number;
    lpgKg: number;
    gasM3: number;
    waterLiters: number;
  };
  shopping: {
    electronics: number; // average per unit
    clothing: number;
    householdItems: number;
    packaging: number;
  };
  waste: {
    plasticKg: number;
    foodWasteKg: number;
    paperKg: number;
    metalKg: number;
  };
  travel: {
    domesticKm: number;
    internationalKm: number;
  };
  appliances: {
    acHourlyKwh: number;
    refrigeratorDailyKwh: number;
    washingMachineCycleKwh: number;
    waterHeaterHourlyKwh: number;
    lightsHourlyKwh: number;
  };
}

// Highly accurate localized emission factors (kg CO2e per unit)
export const CURRENT_EMISSION_FACTORS: EmissionFactors = {
  transport: {
    walk: 0.0,
    bicycle: 0.0,
    bike: 0.09, // kg CO2e per km
    ev: 0.02, // kg CO2e per km (grid charging footprint)
    car: 0.18, // kg CO2e per km (petrol/diesel automotive average)
    bus: 0.05, // kg CO2e per passenger km
    train: 0.03, // kg CO2e per passenger km
    flight: 0.15 // kg CO2e per passenger km
  },
  food: {
    vegan: 1.5, // daily kg CO2e footprint
    vegetarian: 2.4, // daily kg CO2e footprint
    dairy: 3.5, // daily kg CO2e footprint
    poultry: 4.8, // daily kg CO2e footprint
    seafood: 5.4, // daily kg CO2e footprint
    redMeat: 7.2 // daily kg CO2e footprint
  },
  energy: {
    electricityKwh: 0.45, // grid power average kg CO2e per kWh
    solarKwh: 0.02, // life-cycle PV cell solar footprint per kWh
    lpgKg: 2.98, // kg CO2e per kg of LPG
    gasM3: 1.95, // kg CO2e per cubic meter of Natural Gas
    waterLiters: 0.0003 // kg CO2e per liter of supply water tap volume
  },
  shopping: {
    electronics: 18.5, // base kg CO2e per consumer electronics item
    clothing: 5.2, // base kg CO2e per apparel item
    householdItems: 3.1, // base kg CO2e per unit item
    packaging: 0.45 // average single-use delivery package box
  },
  waste: {
    plasticKg: 1.4, // landfill plastic degradation
    foodWasteKg: 0.8, // organic landfill gas emission output
    paperKg: 0.6, // lifecycle paper degradation
    metalKg: 0.35 // steel/aluminum conversion
  },
  travel: {
    domesticKm: 0.13, // mixed domestic travel average
    internationalKm: 0.16 // long-haul flights average
  },
  appliances: {
    acHourlyKwh: 1.2, // average draw for standard 1.5-ton split AC
    refrigeratorDailyKwh: 1.8, // standard triple-door frost free unit
    washingMachineCycleKwh: 0.65, // front-load smart cycle
    waterHeaterHourlyKwh: 2.2, // 2kW geyser run
    lightsHourlyKwh: 0.04 // combined household LED lights (100W absolute)
  }
};

export class CarbonCalculationService {
  private static factors: EmissionFactors = CURRENT_EMISSION_FACTORS;

  /**
   * Fetch current global emission factors
   */
  public static getEmissionFactors(): EmissionFactors {
    return this.factors;
  }

  /**
   * Sets custom factors for future emission updates or localized profiles
   */
  public static updateEmissionFactors(newFactors: Partial<EmissionFactors>): void {
    this.factors = {
      ...this.factors,
      ...newFactors
    };
  }

  /**
   * Transport Category Calculations
   */
  public static calculateTransport(
    mode: keyof EmissionFactors["transport"],
    distanceKm: number
  ): number {
    const factor = this.factors.transport[mode] ?? 0;
    return Number((distanceKm * factor).toFixed(2));
  }

  /**
   * Food Category Calculations (daily diet factor)
   */
  public static calculateFood(diet: keyof EmissionFactors["food"], days: number = 1): number {
    const factor = this.factors.food[diet] ?? 2.4;
    return Number((factor * days).toFixed(2));
  }

  /**
   * Energy Category Calculations
   */
  public static calculateEnergy(
    type: "electricity" | "solar" | "lpg" | "gas" | "water",
    value: number
  ): number {
    let factor = 0;
    switch (type) {
      case "electricity":
        factor = this.factors.energy.electricityKwh;
        break;
      case "solar":
        factor = this.factors.energy.solarKwh;
        break;
      case "lpg":
        factor = this.factors.energy.lpgKg;
        break;
      case "gas":
        factor = this.factors.energy.gasM3;
        break;
      case "water":
        factor = this.factors.energy.waterLiters;
        break;
    }
    return Number((value * factor).toFixed(2));
  }

  /**
   * Shopping Category Calculations
   */
  public static calculateShopping(
    category: keyof EmissionFactors["shopping"],
    quantity: number = 1
  ): number {
    const factor = this.factors.shopping[category] ?? 0;
    return Number((quantity * factor).toFixed(2));
  }

  /**
   * waste Category Calculations
   */
  public static calculateWaste(type: keyof EmissionFactors["waste"], weightKg: number): number {
    const factor = this.factors.waste[type] ?? 0;
    return Number((weightKg * factor).toFixed(2));
  }

  /**
   * Travel Category Calculations
   */
  public static calculateTravel(type: keyof EmissionFactors["travel"], distanceKm: number): number {
    const factor = this.factors.travel[type] ?? 0;
    return Number((distanceKm * factor).toFixed(2));
  }

  /**
   * Appliances active usage calculations
   */
  public static calculateAppliance(
    appliance: keyof EmissionFactors["appliances"],
    unitsOfTimeOrCycle: number
  ): number {
    const consumptionKwh = this.factors.appliances[appliance] ?? 0;
    const totalKwh = consumptionKwh * unitsOfTimeOrCycle;
    return Number((totalKwh * this.factors.energy.electricityKwh).toFixed(2));
  }

  /**
   * Compare standard activity saving vs. modern practice alternative
   */
  public static getCalculationSavings(
    category: "transport" | "food" | "energy" | "waste" | "shopping",
    activityValue: number,
    modeArg?: string
  ): { carbonSaved: number; ecoPoints: number } {
    let co2Saved = 0;
    let points = 0;

    switch (category) {
      case "transport": {
        const selectedModeFactor =
          this.factors.transport[modeArg as keyof EmissionFactors["transport"]] ?? 0;
        const baselineCarFactor = this.factors.transport.car;
        co2Saved = (baselineCarFactor - selectedModeFactor) * activityValue;
        points = Math.round(co2Saved * 60 + activityValue * 5);
        break;
      }
      case "food": {
        const baselineMeat = this.factors.food.redMeat;
        const alternativeDiet =
          this.factors.food[modeArg as keyof EmissionFactors["food"]] ??
          this.factors.food.vegetarian;
        co2Saved = (baselineMeat - alternativeDiet) * activityValue; // daily swaps
        points = Math.round(co2Saved * 120);
        break;
      }
      case "energy": {
        // value represents saved kWh
        co2Saved = activityValue * this.factors.energy.electricityKwh;
        points = Math.round(co2Saved * 150);
        break;
      }
      case "waste": {
        // value represents kg waste recycled vs. landfill
        co2Saved = activityValue * (this.factors.waste.plasticKg - 0.2);
        points = Math.round(co2Saved * 120);
        break;
      }
      case "shopping": {
        // packaging or clothing offsets
        co2Saved =
          activityValue * (this.factors.shopping.clothing - this.factors.shopping.packaging);
        points = Math.round(co2Saved * 200);
        break;
      }
    }

    return {
      carbonSaved: Number(Math.max(0, co2Saved).toFixed(2)),
      ecoPoints: Math.max(10, points)
    };
  }

  /**
   * Generate comprehensive breakdown object and personalized recommendations
   */
  public static getCarbonBreakdown(totals: {
    transport: number;
    food: number;
    energy: number;
    shopping: number;
    waste: number;
  }): {
    breakdownPercentages: Record<string, number>;
    recommendations: string[];
  } {
    const total = Object.values(totals).reduce((a, b) => a + b, 0) || 1;
    const percentages: Record<string, number> = {};
    for (const [k, v] of Object.entries(totals)) {
      percentages[k] = Number(((v / total) * 100).toFixed(1));
    }

    // Dynamic tailored recommendations list
    const recommendations: string[] = [];
    if (percentages.transport > HIGH_EMISSION_PERCENTAGE_THRESHOLD_TRANSPORT) {
      recommendations.push(
        "Your transport footprint is relatively high! Try mapping more electric transit routes, biking, or choosing remote days."
      );
    }
    if (percentages.food > HIGH_EMISSION_PERCENTAGE_THRESHOLD_FOOD) {
      recommendations.push(
        "Food emissions represent a significant leverage point. Incorporating vegan or soy-based options 3 days a week will lower this."
      );
    }
    if (percentages.energy > HIGH_EMISSION_PERCENTAGE_THRESHOLD_ENERGY) {
      recommendations.push(
        "Optimize active thermal control. Standardizing split ACs at 24°C-25°C can slash electricity emissions up to 15%."
      );
    }
    if (percentages.shopping > HIGH_EMISSION_PERCENTAGE_THRESHOLD_SHOPPING) {
      recommendations.push(
        "Avoid impulse consumer purchases. Prioritize recycled kraft packaging and biodegradable daily products."
      );
    }
    if (percentages.waste > HIGH_EMISSION_PERCENTAGE_THRESHOLD_WASTE) {
      recommendations.push(
        "Minimize organic household garbage diversion; prioritize home composting to mitigate solid landfill gases."
      );
    }

    if (recommendations.length < 3) {
      recommendations.push(
        "Maintain your positive eco-habits! Consistently trace daily logs to stay well ahead of target predictions."
      );
      recommendations.push(
        "Redeem accumulated EcoPoints on green certifications to broaden real-world impact footprint."
      );
    }

    return {
      breakdownPercentages: percentages,
      recommendations: recommendations.slice(0, 4)
    };
  }
}
