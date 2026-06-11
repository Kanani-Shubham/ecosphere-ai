import { describe, it, expect } from 'vitest';
import { getProgression } from '@/src/lib/store';

describe('XP Progression System Unit Tests', () => {
  it('correctly maps lower bounds of the XP level system', () => {
    // Level 1: 0 XP
    const p1 = getProgression(0);
    expect(p1.level).toBe(1);
    expect(p1.xpNeeded).toBe(500);
    expect(p1.levelRank).toBe('Seedling Planter');

    const p1Boundary = getProgression(499);
    expect(p1Boundary.level).toBe(1);
    expect(p1Boundary.xpNeeded).toBe(500);
  });

  it('correctly detects level bounds and upshifts levels', () => {
    // Level 2 begins at 500 XP
    const p2Low = getProgression(500);
    expect(p2Low.level).toBe(2);
    expect(p2Low.xpNeeded).toBe(1500);
    expect(p2Low.levelRank).toBe('Sprout Caretaker');

    // Level 3 begins at 1500 XP
    const p3 = getProgression(1500);
    expect(p3.level).toBe(3);
    expect(p3.xpNeeded).toBe(3000);
    expect(p3.levelRank).toBe('Earth Guardian');
  });

  it('correctly reports bounds for cap level (Level 10)', () => {
    // Level 10 starts at 30000 XP
    const p10 = getProgression(30000);
    expect(p10.level).toBe(10);
    expect(p10.xpNeeded).toBe(40000); // 30000 + 10000 offset fallback
    expect(p10.levelRank).toBe('Biosphere Legend');

    const pHuge = getProgression(99999);
    expect(pHuge.level).toBe(10);
    expect(pHuge.xpNeeded).toBe(40000);
  });

  it('handles negative inputs safely (falls back to level 1)', () => {
    const pNeg = getProgression(-100);
    expect(pNeg.level).toBe(1);
    expect(pNeg.levelRank).toBe('Seedling Planter');
  });
});
