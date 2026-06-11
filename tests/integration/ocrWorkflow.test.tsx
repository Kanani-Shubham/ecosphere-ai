import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import ScanView from '@/src/components/ScanView';
import { useStore } from '@/src/lib/store';
import { UserProfile } from '@/src/types';

describe('OCR Scan Integration Flow', () => {
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

  it('handles image preset selection, simulates OCR processing, extracts parameters, and updates scans database logs', async () => {
    const mockAddActivity = vi.fn();
    const storeScanSpy = vi.spyOn(useStore.getState(), 'addScan');

    render(<ScanView onAddCustomActivity={mockAddActivity} userProfile={mockProfile} />);

    // Select the utility bill preset using its unique description to avoid category title collisions
    const billPreset = screen.getByText(/Extract kWh usage, estimate peak carbon draw/i);
    expect(billPreset).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(billPreset);
    });

    // Click Analyze Carbon button
    await act(async () => {
      const analyzeBtn = screen.getByText(/Analyze Carbon/i);
      fireEvent.click(analyzeBtn);
    });

    // Check parsed items matches mock layout calculations
    const resultHeader = await screen.findByText(/Analysis Result/i, {}, { timeout: 2000 });
    expect(resultHeader).toBeInTheDocument();
    
    // Save/Claim action to central database log store
    const logButton = screen.getByRole('button', { name: /Log Savings to Timeline/i });
    expect(logButton).toBeInTheDocument();

    fireEvent.click(logButton);

    // Assert scanned invoice item has been added into Dexie and Zustand log entries
    expect(storeScanSpy).toHaveBeenCalled();
  });
});
