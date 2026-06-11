import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import ScanView from '@/src/components/ScanView';
import { UserProfile } from '@/src/types';

describe('ScanView Component Test Suite', () => {
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

  it('renders ScanView camera portal and preset upload zones', () => {
    const mockAddActivity = vi.fn();
    render(<ScanView onAddCustomActivity={mockAddActivity} userProfile={mockProfile} />);

    // Assert headers are in place
    expect(screen.getByText(/Scan & Upload/i)).toBeInTheDocument();
    expect(screen.getByText(/Utilize Gemini Vision to extract carbon impact/i)).toBeInTheDocument();
    
    // Quick Demo Presets list exists
    expect(screen.getByText(/Quick Demo Presets/i)).toBeInTheDocument();
  });

  it('allows clicking an OCR preset sample to trigger virtual scan processing', async () => {
    const mockAddActivity = vi.fn();
    render(<ScanView onAddCustomActivity={mockAddActivity} userProfile={mockProfile} />);

    // Discover the sample cards
    const samplePresetBtn = screen.getAllByText(/Grocery Receipt OCR/i)[0];
    expect(samplePresetBtn).toBeInTheDocument();

    // Trigger sample receipt scan
    await act(async () => {
      fireEvent.click(samplePresetBtn);
    });

    // Click Analyze Carbon button
    await act(async () => {
      const analyzeBtn = screen.getByText(/Analyze Carbon/i);
      fireEvent.click(analyzeBtn);
    });

    // Verify scan displays emissions estimation results cards using findByText to await the async response
    const resultHeader = await screen.findByText(/Analysis Result/i, {}, { timeout: 2000 });
    expect(resultHeader).toBeInTheDocument();
    
    const co2Label = await screen.findByText(/Estimated CO2e/i, {}, { timeout: 2000 });
    expect(co2Label).toBeInTheDocument();

    const scoreLabel = await screen.findByText(/Result Score/i, {}, { timeout: 2000 });
    expect(scoreLabel).toBeInTheDocument();
  });
});
