/**
 * XP AND PROGRESSION CALCULATOR UTILITY
 * Standardizes ecosystem level thresholds and rank titles.
 */

export interface ProgressionResult {
  level: number;
  xpNeeded: number;
  levelRank: string;
}

export interface LevelThreshold {
  level: number;
  minXp: number;
  rank: string;
}

export const LEVEL_THRESHOLDS: LevelThreshold[] = [
  { level: 1, minXp: 0, rank: "Seedling Planter" },
  { level: 2, minXp: 500, rank: "Sprout Caretaker" },
  { level: 3, minXp: 1500, rank: "Earth Guardian" },
  { level: 4, minXp: 3000, rank: "Eco Watcher" },
  { level: 5, minXp: 5000, rank: "Nature Custodian" },
  { level: 6, minXp: 7400, rank: "Forest Protector" },
  { level: 7, minXp: 10000, rank: "Green Master" },
  { level: 8, minXp: 14000, rank: "Climate Warrior" },
  { level: 9, minXp: 20000, rank: "Eco Commander" },
  { level: 10, minXp: 30000, rank: "Biosphere Legend" }
];

/**
 * Calculates user level and rank based on total accumulated XP.
 * 
 * @param xp Total User Experience points (XP)
 * @returns Object specifying current level, level rank description, and next level target XP
 */
export function getProgression(xp: number): ProgressionResult {
  let active = LEVEL_THRESHOLDS[0];
  for (const t of LEVEL_THRESHOLDS) {
    if (xp >= t.minXp) {
      active = t;
    } else {
      break;
    }
  }

  const nextThreshold = LEVEL_THRESHOLDS.find((t) => t.level === active.level + 1);
  const xpNeeded = nextThreshold ? nextThreshold.minXp : active.minXp + 10000;

  return {
    level: active.level,
    xpNeeded,
    levelRank: active.rank
  };
}
