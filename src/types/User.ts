export interface SeasonHistoryRecord {
  seasonId: string;
  seasonName: string;
  xpEarned: number;
  milestonesAchieved: number;
  badgeUnlockedTitle?: string;
  completedAt: string;
}

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
  postType?: "text" | "image" | "achievement" | "challenge" | "milestone";
  isEdited?: boolean;
}

export interface RewardTransaction {
  id: string;
  title: string;
  points: number;
  type: "earn" | "spend";
  date: string;
  xpEarned?: number;
  source?: string;
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
