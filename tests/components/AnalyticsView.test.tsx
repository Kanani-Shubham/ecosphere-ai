import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import AnalyticsView from '@/src/components/AnalyticsView';
import { Activity } from '@/src/types';

describe('AnalyticsView Component Test Suite', () => {
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
      title: 'Meatless diet logs',
      category: 'food',
      co2Value: -4.8,
      date: '2026-06-11',
      pointsEarned: 240
    }
  ];

  it('renders analytics view defaults with general savings overview', () => {
    render(<AnalyticsView activities={mockActivities} />);

    // Renders primary text
    expect(screen.getByText(/Aggregate Carbon Score/i)).toBeInTheDocument();
    
    // Renders tabs
    expect(screen.getByRole('button', { name: /^Overview$/i })).toBeInTheDocument();
    expect(screen.getByText(/Category Impact/i)).toBeInTheDocument();
    expect(screen.getByText(/Impact Report/i)).toBeInTheDocument();
  });

  it('allows clicking filtering tabs to toggled layout segments', () => {
    render(<AnalyticsView activities={mockActivities} />);

    const breakdownTab = screen.getByText(/Category Impact/i);
    fireEvent.click(breakdownTab);

    // After switching tabs, specific breakdown segments show up
    expect(screen.getByText(/Carbon Source Allocation/i)).toBeInTheDocument();
  });

  it('handles PDF dynamic download triggered cleanly without crashing', async () => {
    vi.useFakeTimers();
    render(<AnalyticsView activities={mockActivities} />);

    const reportTab = screen.getByText(/Impact Report/i);
    fireEvent.click(reportTab);

    // Find export pdf button
    const exportBtn = screen.getByRole('button', { name: /Download PDF/i });
    expect(exportBtn).toBeInTheDocument();

    fireEvent.click(exportBtn);

    // Fast-forwards the download generation timers
    await act(async () => {
      vi.runAllTimers();
    });

    // Check we reverted from downloading state back to idle successfully
    expect(screen.getByRole('button', { name: /Download PDF/i })).toBeInTheDocument();
    vi.useRealTimers();
  });
});
