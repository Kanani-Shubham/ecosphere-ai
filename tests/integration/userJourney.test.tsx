import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import App from '@/src/App';
import { useStore } from '@/src/lib/store';

describe('User Integration Flow: End-to-End Navigation', () => {
  it('correctly mounts the App, skips splash, handles tabs switching, and updates centralized states', async () => {
    // Spy on initStore and mock it so App mount does not re-fetch/clear our mock state
    const initSpy = vi.spyOn(useStore.getState(), 'initStore').mockResolvedValue();

    // Directly seed the store with an onboarded, fully-set profile state
    useStore.setState({
      isLoadingStore: false,
      dbInitStatus: 'ready',
      profile: {
        name: 'Jane Doe',
        avatar: '🌱',
        level: 3,
        levelRank: 'Earth Guardian',
        totalXP: 1800,
        xp: 1800,
        xpNeeded: 3000,
        currentStreak: 5,
        streak: 5,
        ecoPoints: 1200,
        dailyMissionClaimedDate: '',
        lastClaimDate: '',
        lastRewardClaimDate: '',
        hasCompletedOnboarding: true,
      } as any,
      challenges: [
        {
          id: 'c1',
          title: 'Meatless Monday',
          description: 'Eat vegetarian or vegan diets for the entire day',
          category: 'food',
          pointsReward: 100,
          xpReward: 50,
          completed: false,
          type: 'daily'
        } as any
      ],
      badges: [
        {
          id: 'b1',
          title: 'Carbon Cutter',
          description: 'Save your first 10kg of CO2 emissions',
          icon: '🌿',
          unlocked: true,
          requirement: 'Save 10kg CO2',
          unlockedAt: '2026-06-11'
        } as any
      ],
      community: [
        {
          id: 'p1',
          authorName: 'Rohan (Father)',
          avatar: '👨',
          content: 'I switched to LED light bulbs today.',
          category: 'energy',
          likes: 3,
          likedByMe: false,
          timestamp: '2 hours ago',
          comments: []
        } as any
      ],
      activities: []
    });

    render(<App />);

    // Flush any pending microtasks from initial render
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Discover navigation tab buttons
    const challengesTab = screen.getByRole('button', { name: /Challenges/i });
    expect(challengesTab).toBeInTheDocument();

    // Click Challenges Tab and expect navigation to propagate
    await act(async () => {
      fireEvent.click(challengesTab);
    });

    // Make sure we see standard challenges view elements
    expect(screen.getByText(/Meatless Monday/i)).toBeInTheDocument();

    initSpy.mockRestore();
  });
});
