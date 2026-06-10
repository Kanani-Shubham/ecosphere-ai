export interface UserProfile {
  name: string;
  age: number;
  country: string;
  city: string;
  level: number;
  xp: number;
  xpNeeded: number;
  ecoPoints: number;
  streak: number;
  levelRank: string;
  hasCompletedOnboarding: boolean;
  transportHabit: string;
  foodHabit: string;
  electricityHabit: string;
  shoppingHabit: string;
  travelHabit: string;
  profileImage?: string; // base64 string
  username?: string;
  email?: string;
  phone?: string;
  bio?: string;
  lifestyleType?: string;
  dietPreference?: string;
  transportationPreference?: string;
  sustainabilityGoals?: string;
  lastActivityDate?: string;
  longestStreak?: number;
  dailyMissionClaimedDate?: string;
  completedSeasons?: SeasonHistoryRecord[];
  totalXP: number;
  currentStreak: number;
  lastClaimDate?: string;
  lastRewardClaimDate?: string;
}

export interface SeasonHistoryRecord {
  seasonId: string;
  seasonName: string;
  xpEarned: number;
  milestonesAchieved: number;
  badgeUnlockedTitle?: string;
  completedAt: string;
}

export type CategoryType = 'transport' | 'food' | 'energy' | 'shopping' | 'waste';

export interface Activity {
  id: string;
  title: string;
  category: CategoryType;
  co2Value: number; // in kg CO2e
  date: string; // ISO String or YYYY-MM-DD
  pointsEarned: number;
  isCustom?: boolean;
}

export interface Goal {
  id: string;
  title: string;
  category: CategoryType;
  targetValue: number; // target reduction or save (e.g. 100kg)
  currentValue: number;
  deadline: string;
  completed: boolean;
}

export interface Challenge {
  id: string;
  title: string;
  category: CategoryType;
  description: string;
  xpReward: number;
  pointsReward: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  completed: boolean;
  type: 'daily' | 'weekly' | 'special';
}

export interface SavedReport {
  id: string;
  month: string; // e.g., "June 2026"
  totalEmissions: number; // in kg CO2
  reductionRate: number; // e.g. 18%
  rankPercentile: number; // top 15%
  breakdown: {
    transport: number;
    food: number;
    energy: number;
    shopping: number;
    waste: number;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface ApplianceUsage {
  id: string;
  name: string;
  powerUsage: number; // in kW/hr
  hoursUsed: number;
  co2Impact: number; // in kg CO2
}

export interface TravelComparison {
  from: string;
  to: string;
  distance: number; // km
  options: {
    mode: 'car' | 'ev' | 'bus' | 'train' | 'bike' | 'walking';
    time: string;
    co2: number; // kg CO2
    points: number;
  }[];
}

export interface MarketplaceProduct {
  id: string;
  name: string;
  category: string;
  rating: number;
  sustainabilityScore: number; // 0-100
  pricePoints: number; // cost in Eco Points
  co2Saved: number; // estimate
  image: string;
}

export interface CommentItem {
  id: string;
  authorId?: string;
  author: string;
  avatar: string;
  content: string;
  timeString: string;
  replies?: CommentItem[];
}

export interface CommunityPost {
  id: string;
  authorId?: string; // e.g. "user" for real-time profile lookup
  author: string;
  avatar: string;
  timeString: string;
  content: string;
  likes: number;
  commentsCount: number;
  liked: boolean;
  category: string;
  image?: string;
  commentsList?: CommentItem[];
  saved?: boolean;
  reported?: boolean;
  authorLevel?: number;
  authorRank?: string;
  authorBadge?: string;
  postType?: 'text' | 'image' | 'achievement' | 'challenge' | 'milestone';
  isEdited?: boolean;
}

export interface TimelineMilestone {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'activity' | 'challenge' | 'level' | 'achievement';
  value: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedDate?: string;
  requirement: string;
}

export interface RewardTransaction {
  id: string;
  title: string;
  points: number;
  type: 'earn' | 'spend';
  date: string;
  xpEarned?: number;
  source?: string;
}
