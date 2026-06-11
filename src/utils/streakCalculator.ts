import { UserProfile } from "../types";

export interface StreakUpdateResult {
  streak: number;
  longestStreak: number;
  lastActivityDate: string;
}

/**
 * Calculates updated streak counter and date milestones.
 * Includes check for consecutive days, same day logs, and gaps.
 * 
 * @param profile Core User Profiles schema
 * @param activityDate Optional date parameter (YYYY-MM-DD)
 * @returns Updated streak parameters
 */
export function calculateStreakUpdate(profile: UserProfile, activityDate?: string): StreakUpdateResult {
  const today = activityDate || new Date().toISOString().split("T")[0];
  const lastActiveDate = profile.lastActivityDate;

  if (!lastActiveDate) {
    return {
      streak: 1,
      longestStreak: Math.max(profile.longestStreak || 0, 1),
      lastActivityDate: today
    };
  }

  const lastDate = new Date(lastActiveDate);
  const todayDate = new Date(today);

  lastDate.setHours(0, 0, 0, 0);
  todayDate.setHours(0, 0, 0, 0);

  const diffTime = todayDate.getTime() - lastDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return {
      streak: profile.streak,
      longestStreak: Math.max(profile.longestStreak || 0, profile.streak),
      lastActivityDate: today
    };
  } else if (diffDays === 1) {
    const newStreak = profile.streak + 1;
    return {
      streak: newStreak,
      longestStreak: Math.max(profile.longestStreak || 0, newStreak),
      lastActivityDate: today
    };
  } else {
    return {
      streak: 1,
      longestStreak: Math.max(profile.longestStreak || 0, 1),
      lastActivityDate: today
    };
  }
}
