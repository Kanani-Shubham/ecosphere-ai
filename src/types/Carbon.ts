export type CategoryType = "transport" | "food" | "energy" | "shopping" | "waste";

export interface Activity {
  id: string;
  title: string;
  category: CategoryType;
  co2Value: number; // in kg CO2e
  date: string; // ISO String or YYYY-MM-DD
  pointsEarned: number;
  isCustom?: boolean;
}

export interface Goal {
  id: string;
  title: string;
  category: CategoryType;
  targetValue: number; // target reduction or save (e.g. 100kg)
  currentValue: number;
  deadline: string;
  completed: boolean;
}

export interface ApplianceUsage {
  id: string;
  name: string;
  powerUsage: number; // in kW/hr
  hoursUsed: number;
  co2Impact: number; // in kg CO2
}

export interface TravelComparisonOption {
  mode: "car" | "ev" | "bus" | "train" | "bike" | "walking";
  time: string;
  co2: number; // kg CO2
  points: number;
}

export interface TravelComparison {
  from: string;
  to: string;
  distance: number; // km
  options: TravelComparisonOption[];
}
