export interface SavedReport {
  id: string;
  month: string; // e.g., "June 2026"
  totalEmissions: number; // in kg CO2
  reductionRate: number; // e.g. 18%
  rankPercentile: number; // top 15%
  breakdown: {
    transport: number;
    food: number;
    energy: number;
    shopping: number;
    waste: number;
  };
}

export interface TimelineMilestone {
  id: string;
  date: string;
  title: string;
  description: string;
  type: "activity" | "challenge" | "level" | "achievement";
  value: string;
}
