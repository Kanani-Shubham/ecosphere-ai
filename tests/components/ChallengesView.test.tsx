import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import ChallengesView from '@/src/components/ChallengesView';
import { UserProfile, Challenge, Badge, CommunityPost } from '@/src/types';
import { useStore } from '@/src/lib/store';

describe('ChallengesView Component Test Suite', () => {
  const mockProfile: UserProfile = {
    name: 'Jane Doe',
    profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
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

  const mockChallenges: Challenge[] = [
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
  ];

  const mockBadges: Badge[] = [
    {
      id: 'b1',
      title: 'Carbon Cutter',
      description: 'Save your first 10kg of CO2 emissions',
      icon: '🌿',
      unlocked: true,
      requirement: 'Save 10kg CO2',
      unlockedAt: '2026-06-11'
    } as any
  ];

  const mockCommunity: CommunityPost[] = [
    {
      id: 'p1',
      author: 'Rohan (Father)',
      authorLevel: 2,
      authorRank: 'Sprout Caretaker',
      avatar: '👨',
      content: 'I switched to LED light bulbs today. Save 5kg CO2 monthly!',
      category: 'energy',
      likes: 3,
      liked: false,
      timeString: '2 hours ago',
      comments: [
        { id: 'com1', author: 'Anita (Mom)', text: 'Excellent job, Rohan!', timestamp: '1 hour ago' }
      ]
    } as any
  ];

  const defaultProps = {
    profile: mockProfile,
    challenges: mockChallenges,
    badges: mockBadges,
    community: mockCommunity,
    onCompleteChallenge: vi.fn(),
    onPostCommunity: vi.fn(),
    onLikePost: vi.fn(),
    onAddComment: vi.fn(),
    onAddCustomActivity: vi.fn()
  };

  it('renders Challenges subtab as default with list of active challenges', () => {
    render(<ChallengesView {...defaultProps} />);
    
    // Header should be active
    expect(screen.getByText(/Meatless Monday/i)).toBeInTheDocument();
    expect(screen.getByText(/Eat vegetarian/i)).toBeInTheDocument();
  });

  it('allows switching to Levels & Badges subtab and renders achievements', () => {
    render(<ChallengesView {...defaultProps} />);
    
    // Switch subtab to "Levels & Badges"
    const badgesTab = screen.getByText(/Levels & Badges/i);
    fireEvent.click(badgesTab);
    
    // Check that the badge name or standard labels are rendered
    expect(screen.getByText(/Carbon Cutter/i)).toBeInTheDocument();
    expect(screen.getByText(/Save your first 10kg/i)).toBeInTheDocument();
  });

  it('allows switching to Leaderboard subtab and renders participants and user rank indicator', () => {
    render(<ChallengesView {...defaultProps} />);
    
    // Switch subtab to "Leaderboard"
    const leaderboardTab = screen.getByText(/Leaderboard/i);
    fireEvent.click(leaderboardTab);
    
    // User named Jane Doe should be shown as Jane Doe (You)
    expect(screen.getByText(/Jane Doe \(You\)/i)).toBeInTheDocument();
    
    // Leaderboard rankings filters are visible
    expect(screen.getByRole('button', { name: /Global/i })).toBeInTheDocument();
  });

  it('allows switching to Community tab and supports posting and liking actions', async () => {
    const storeLikeSpy = vi.spyOn(useStore.getState(), 'likeCommunityPost');
    render(<ChallengesView {...defaultProps} />);
    
    // Switch subtab to "Community" using exact accessible button name to avoid multiple text match collisions
    const communityTab = screen.getByRole('button', { name: 'Community' });
    fireEvent.click(communityTab);
    
    // Checks that the post and its author exist
    expect(screen.getByText(/I switched to LED/i)).toBeInTheDocument();
    expect(screen.getByText(/Rohan \(Father\)/i)).toBeInTheDocument();

    // Trigger community post like
    const likeButton = screen.getByRole('button', { name: '3' });
    fireEvent.click(likeButton);
    expect(storeLikeSpy).toHaveBeenCalledWith('p1');
  });
});
