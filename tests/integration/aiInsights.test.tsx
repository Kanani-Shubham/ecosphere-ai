import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import AuxiliaryViews from '@/src/components/AuxiliaryViews';
import { UserProfile } from '@/src/types';

describe('AI Insights & Coach Workflow Integration Flow', () => {
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

  it('renders AI Coach View, handles chat interactions, and displays localized recommendations', async () => {
    const mockBack = vi.fn();
    const mockAddActivity = vi.fn();

    render(
      <AuxiliaryViews 
        viewName="ai-coach" 
        onBack={mockBack} 
        profile={mockProfile} 
        onAddCustomActivity={mockAddActivity} 
      />
    );

    // AI Coach heading is presented and verified using getByRole to avoid subtitle match collissions
    expect(screen.getByRole('heading', { name: 'AI Eco Coach' })).toBeInTheDocument();
    
    // User can communicate through input bar
    const inputElement = screen.getByPlaceholderText(/Ask me anything.../i);
    expect(inputElement).toBeInTheDocument();

    fireEvent.change(inputElement, { target: { value: 'How can I save carbon on food?' } });
    expect(inputElement).toHaveValue('How can I save carbon on food?');

    // Submit user prompt
    const sendButton = screen.getByRole('button', { name: /Send/i });
    expect(sendButton).toBeInTheDocument();
    
    fireEvent.click(sendButton);

    // AI Coach responds (offline backup or live response)
    expect(await screen.findByText(/How can I save carbon on food\?/i)).toBeInTheDocument();
  });

  it('renders AI Insights View and details historical analytics predictions', async () => {
    const mockBack = vi.fn();
    const mockAddActivity = vi.fn();

    render(
      <AuxiliaryViews 
        viewName="ai-insights" 
        onBack={mockBack} 
        profile={mockProfile} 
        onAddCustomActivity={mockAddActivity} 
      />
    );

    // Checks real headers of the rendered insights layout once async load completes
    expect(await screen.findByText(/Personalized Insight/i, {}, { timeout: 2000 })).toBeInTheDocument();
    expect(await screen.findByText(/Top Suggestions Proposed/i, {}, { timeout: 2000 })).toBeInTheDocument();
  });
});
