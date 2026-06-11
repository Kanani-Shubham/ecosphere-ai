import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import DashboardView from '@/src/components/DashboardView';
import { useStore } from '@/src/lib/store';
import { UserProfile, Activity } from '@/src/types';

describe('DashboardView Component Test Suite', () => {
  const mockProfile: UserProfile = {
    name: 'Jane Doe',
    profileImage: '🌱',
    level: 3,
    levelRank: 'Earth Guardian',
    xp: 1800,
    totalXP: 1800,
    xpNeeded: 3000,
    streak: 5,
    currentStreak: 5,
    longestStreak: 5,
    ecoPoints: 1200,
    dailyMissionClaimedDate: '',
    lastClaimDate: '',
    lastRewardClaimDate: '',
    hasCompletedOnboarding: true,
  } as any;

  const mockActivities: Activity[] = [
    {
      id: 'act1',
      title: 'Commute via Electric Scooter',
      category: 'transport',
      co2Value: -1.2,
      date: '2026-06-11',
      pointsEarned: 150
    },
    {
      id: 'act2',
      title: 'Balanced Plant-Based Lunch',
      category: 'food',
      co2Value: -2.4,
      date: '2026-06-11',
      pointsEarned: 240
    }
  ];

  it('renders dashboard with primary user greetings and status stats card', () => {
    const mockOnNavigate = vi.fn();
    const mockAddActivity = vi.fn();

    render(
      <DashboardView 
        profile={mockProfile}
        activities={mockActivities}
        onNavigate={mockOnNavigate}
        onAddCustomActivity={mockAddActivity}
      />
    );

    // Greets user
    expect(screen.getByText(/Jane Doe/i)).toBeInTheDocument();
    
    // Shows user stats (Points)
    expect(screen.getByText(/Eco Points/i)).toBeInTheDocument();
    
    // Shows Active Streak
    expect(screen.getByText(/Active Streak/i)).toBeInTheDocument();
  });

  it('allows clicking navigations elements and triggers callbacks', () => {
    const mockOnNavigate = vi.fn();
    const mockAddActivity = vi.fn();

    render(
      <DashboardView 
        profile={mockProfile}
        activities={mockActivities}
        onNavigate={mockOnNavigate}
        onAddCustomActivity={mockAddActivity}
      />
    );

    const coachButton = screen.getByText(/AI Eco Coach/i);
    expect(coachButton).toBeInTheDocument();
    
    // Simulates dashboard tabs interaction and route switches 
    fireEvent.click(coachButton);
    expect(mockOnNavigate).toHaveBeenCalled();
  });

  it('triggers the daily reward claim when clicking the reward claim action', async () => {
    const mockOnNavigate = vi.fn();
    const mockAddActivity = vi.fn();
    
    // Watch store claimDailyMission trigger
    const claimDailyMissionSpy = vi.spyOn(useStore.getState(), 'claimDailyMission');

    render(
      <DashboardView 
        profile={mockProfile}
        activities={mockActivities}
        onNavigate={mockOnNavigate}
        onAddCustomActivity={mockAddActivity}
      />
    );

    const claimButton = screen.getByText(/Claim \+250 Points/i);
    expect(claimButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(claimButton);
    });

    expect(claimDailyMissionSpy).toHaveBeenCalled();
  });
});
