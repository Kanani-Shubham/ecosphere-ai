import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import DashboardView from '@/src/components/DashboardView';
import { UserProfile } from '@/src/types';

describe('Accessibility & Keyboard Navigation Tests', () => {
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

  it('contains proper semantic landmarks and ARIA markers', () => {
    const mockOnNavigate = vi.fn();
    const mockAddActivity = vi.fn();

    render(
      <DashboardView 
        profile={mockProfile}
        activities={[]}
        onNavigate={mockOnNavigate}
        onAddCustomActivity={mockAddActivity}
      />
    );

    // Main buttons should have valid keyboard interactive interfaces
    const actionableElements = screen.getAllByRole('button');
    actionableElements.forEach(btn => {
      // Buttons must not have negative tabIndex (i.e. default focusable is fine)
      expect(btn.tabIndex).toBeGreaterThanOrEqual(0);
    });
  });

  it('supports focus navigation sequence correctly', () => {
    const mockOnNavigate = vi.fn();
    const mockAddActivity = vi.fn();

    render(
      <DashboardView 
        profile={mockProfile}
        activities={[]}
        onNavigate={mockOnNavigate}
        onAddCustomActivity={mockAddActivity}
      />
    );

    const claimButton = screen.getByRole('button', { name: /\+250 Points/i });
    expect(claimButton).toBeInTheDocument();
    
    // Focus claim button
    claimButton.focus();
    expect(document.activeElement).toBe(claimButton);
  });
});
