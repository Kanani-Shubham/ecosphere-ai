import { describe, it, expect } from 'vitest';
import { calculateStreakUpdate } from '@/src/utils/streakCalculator';
import { UserProfile } from '@/src/types';

describe('Streak Calculation Unit Tests', () => {
  const baseProfile: UserProfile = {
    name: "Jane Doe",
    profileImage: "🌱",
    level: 3,
    levelRank: "Earth Guardian",
    xp: 1800,
    totalXP: 1800,
    xpNeeded: 3000,
    streak: 5,
    currentStreak: 5,
    longestStreak: 5,
    ecoPoints: 1200,
    dailyMissionClaimedDate: "",
    lastClaimDate: "",
    lastRewardClaimDate: "",
    hasCompletedOnboarding: true,
  } as any;

  it('initializes streak to 1 when there is no lastActivityDate', () => {
    const profileNoActivity = { ...baseProfile, lastActivityDate: undefined };
    const result = calculateStreakUpdate(profileNoActivity as any, '2026-06-11');
    expect(result.streak).toBe(1);
    expect(result.longestStreak).toBe(5); // retains the profile's historic record
    expect(result.lastActivityDate).toBe('2026-06-11');
  });

  it('keeps streak identical if logging multiple times on the same calendar day (diff === 0)', () => {
    const profileWithToday = { ...baseProfile, lastActivityDate: '2026-06-11', streak: 5 };
    const result = calculateStreakUpdate(profileWithToday as any, '2026-06-11');
    expect(result.streak).toBe(5);
    expect(result.longestStreak).toBe(5);
    expect(result.lastActivityDate).toBe('2026-06-11');
  });

  it('increments streak by 1 if logging on the consecutive day (diff === 1)', () => {
    const profileWithYesterday = { ...baseProfile, lastActivityDate: '2026-06-10', streak: 5 };
    const result = calculateStreakUpdate(profileWithYesterday as any, '2026-06-11');
    expect(result.streak).toBe(6);
    expect(result.longestStreak).toBe(6);
    expect(result.lastActivityDate).toBe('2026-06-11');
  });

  it('resets streak back to 1 (new start) if logging is delayed by more than 1 day (diff > 1)', () => {
    const profileWithTwoDaysAgo = { ...baseProfile, lastActivityDate: '2026-06-08', streak: 5 };
    const result = calculateStreakUpdate(profileWithTwoDaysAgo as any, '2026-06-11');
    expect(result.streak).toBe(1);
    expect(result.longestStreak).toBe(5); // keeps historical record
    expect(result.lastActivityDate).toBe('2026-06-11');
  });
});
