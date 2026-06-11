import { CategoryType } from "./Carbon";

export interface Challenge {
  id: string;
  title: string;
  category: CategoryType;
  description: string;
  xpReward: number;
  pointsReward: number;
  difficulty: "Easy" | "Medium" | "Hard";
  completed: boolean;
  type: "daily" | "weekly" | "special";
}
