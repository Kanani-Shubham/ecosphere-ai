import {
  UserProfile,
  Activity,
  Goal,
  Challenge,
  SavedReport,
  ChatMessage,
  ApplianceUsage,
  CommunityPost,
  Badge,
  RewardTransaction
} from "../types";

const PROFILE_KEY = "ecosphere_profile";
const ACTIVITIES_KEY = "ecosphere_activities";
const GOALS_KEY = "ecosphere_goals";
const CHALLENGES_KEY = "ecosphere_challenges";
const CHATS_KEY = "ecosphere_chats";
const APPLIANCES_KEY = "ecosphere_appliances";
const COMMUNITY_KEY = "ecosphere_community";
const BADGES_KEY = "ecosphere_badges";
const TRANSACTIONS_KEY = "ecosphere_transactions";

export const getLocalProfile = (): UserProfile | null => {
  const data = localStorage.getItem(PROFILE_KEY);
  return data ? JSON.parse(data) : null;
};

export const saveLocalProfile = (profile: UserProfile): void => {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
};

export const getLocalActivities = (): Activity[] => {
  const data = localStorage.getItem(ACTIVITIES_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveLocalActivities = (activities: Activity[]): void => {
  localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities));
};

export const getLocalGoals = (): Goal[] => {
  const data = localStorage.getItem(GOALS_KEY);
  if (data) return JSON.parse(data);
  // Default goals if none exist
  return [
    {
      id: "1",
      title: "Reduce emissions by 20%",
      category: "energy",
      targetValue: 200,
      currentValue: 65,
      deadline: "2026-12-31",
      completed: false
    },
    {
      id: "2",
      title: "Walk 100 km this month",
      category: "transport",
      targetValue: 100,
      currentValue: 40,
      deadline: "2026-06-30",
      completed: false
    },
    {
      id: "3",
      title: "Save 50 kWh electricity",
      category: "energy",
      targetValue: 50,
      currentValue: 35,
      deadline: "2026-06-25",
      completed: false
    },
    {
      id: "4",
      title: "Plant 10 trees",
      category: "waste",
      targetValue: 10,
      currentValue: 3,
      deadline: "2026-12-31",
      completed: false
    }
  ];
};

export const saveLocalGoals = (goals: Goal[]): void => {
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
};

export const getLocalChallenges = (): Challenge[] => {
  const data = localStorage.getItem(CHALLENGES_KEY);
  if (data) return JSON.parse(data);
  return [
    {
      id: "c1",
      title: "Walk 3 km today",
      category: "transport",
      description: "Save vehicle fuel and emissions by walk instead of driving short distances.",
      xpReward: 20,
      pointsReward: 100,
      difficulty: "Easy",
      completed: false,
      type: "daily"
    },
    {
      id: "c2",
      title: "No plastic day",
      category: "waste",
      description: "Refuse single-use cups, grocery carrier bags, and plastic cutlery.",
      xpReward: 15,
      pointsReward: 75,
      difficulty: "Easy",
      completed: false,
      type: "daily"
    },
    {
      id: "c3",
      title: "Use public transport",
      category: "transport",
      description: "Adopt train, electric commuter rail, or shared transit today.",
      xpReward: 25,
      pointsReward: 150,
      difficulty: "Medium",
      completed: false,
      type: "daily"
    },
    {
      id: "c4",
      title: "Eat plant-based meal",
      category: "food",
      description: "Prepare a breakfast, lunch or dinner consisting solely of vegetables & grains.",
      xpReward: 15,
      pointsReward: 75,
      difficulty: "Easy",
      completed: false,
      type: "daily"
    },

    {
      id: "c5",
      title: "Commute by bicycle",
      category: "transport",
      description: "Bicycle to and from school, college or work, saving 5 kg CO2.",
      xpReward: 50,
      pointsReward: 250,
      difficulty: "Medium",
      completed: false,
      type: "weekly"
    },
    {
      id: "c6",
      title: "Set thermostat to 25°C",
      category: "energy",
      description: "Ensure household active cooling is optimized for less grid carbon draw.",
      xpReward: 40,
      pointsReward: 200,
      difficulty: "Easy",
      completed: false,
      type: "weekly"
    },

    {
      id: "c7",
      title: "Zero Waste Week",
      category: "waste",
      description: "Produce zero disposable waste for 7 consecutive days.",
      xpReward: 100,
      pointsReward: 500,
      difficulty: "Hard",
      completed: false,
      type: "special"
    },
    {
      id: "c8",
      title: "Eco Home Retrofit",
      category: "energy",
      description:
        "Install LED lighting, energy timers, or switch electricity sources to certified solar.",
      xpReward: 150,
      pointsReward: 750,
      difficulty: "Hard",
      completed: false,
      type: "special"
    }
  ];
};

export const saveLocalChallenges = (challenges: Challenge[]): void => {
  localStorage.setItem(CHALLENGES_KEY, JSON.stringify(challenges));
};

export const getLocalChats = (): ChatMessage[] => {
  const data = localStorage.getItem(CHATS_KEY);
  return data
    ? JSON.parse(data)
    : [
        {
          id: "init-1",
          sender: "ai",
          text: "Hi! I am your AI Eco Coach. I can help you reduce your carbon footprint and build sustainable habits. Where should we start active optimization today?",
          timestamp: "11:22 AM"
        }
      ];
};

export const saveLocalChats = (chats: ChatMessage[]): void => {
  localStorage.setItem(CHATS_KEY, JSON.stringify(chats));
};

export const getLocalAppliances = (): ApplianceUsage[] => {
  const data = localStorage.getItem(APPLIANCES_KEY);
  if (data) return JSON.parse(data);
  return [
    { id: "app-1", name: "Air Conditioner", powerUsage: 1.5, hoursUsed: 8, co2Impact: 5.4 },
    { id: "app-2", name: "Refrigerator", powerUsage: 0.15, hoursUsed: 24, co2Impact: 1.62 },
    { id: "app-3", name: "Water Heater", powerUsage: 3.0, hoursUsed: 1.5, co2Impact: 2.02 },
    { id: "app-4", name: "Smart Lighting", powerUsage: 0.05, hoursUsed: 6, co2Impact: 0.13 },
    {
      id: "app-5",
      name: "Televisions & Workstations",
      powerUsage: 0.4,
      hoursUsed: 5,
      co2Impact: 0.9
    }
  ];
};

export const saveLocalAppliances = (appliances: ApplianceUsage[]): void => {
  localStorage.setItem(APPLIANCES_KEY, JSON.stringify(appliances));
};

export const getLocalCommunity = (): CommunityPost[] => {
  const data = localStorage.getItem(COMMUNITY_KEY);
  if (data) return JSON.parse(data);
  return [
    {
      id: "post-1",
      author: "Sarah Green",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      timeString: "2h ago",
      content:
        "Just completed my 30 day green commuting challenge! Swapped my SUV for zero-emission electric rail and bike rides. Reduced my personal output by ~25 kg CO2e this month! 🌲🚲",
      likes: 128,
      commentsCount: 24,
      liked: false,
      category: "Transport",
      image:
        "https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=600&auto=format&fit=crop"
    },
    {
      id: "post-2",
      author: "Nora R",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
      timeString: "4h ago",
      content:
        "Switched fully to zero waste cooking and plant-based lunches. Loving the fresh local ingredients. Zero transport overhead, organic and extremely tasty. Swipe for suggestions!",
      likes: 89,
      commentsCount: 15,
      liked: true,
      category: "Food"
    }
  ];
};

export const saveLocalCommunity = (posts: CommunityPost[]): void => {
  localStorage.setItem(COMMUNITY_KEY, JSON.stringify(posts));
};

export const getLocalBadges = (): Badge[] => {
  const data = localStorage.getItem(BADGES_KEY);
  if (data) return JSON.parse(data);
  return [
    {
      id: "b1",
      title: "Green Starter",
      description: "Complete onboarding and personal profile setup.",
      icon: "🌱",
      unlocked: true,
      unlockedDate: "2026-06-09",
      requirement: "Setup profile"
    },
    {
      id: "b2",
      title: "Green Streak",
      description: "Log activities or green commuting for 7 days consecutively.",
      icon: "🔥",
      unlocked: false,
      requirement: "7-day streak"
    },
    {
      id: "b3",
      title: "Tree Hugger",
      description: "Record savings equivalent to 50 kg CO2e.",
      icon: "🌳",
      unlocked: false,
      requirement: "50 kg CO2e saved"
    },
    {
      id: "b4",
      title: "Eco Master",
      description: "Reach Level 10 and maintain active eco-warrior ranking.",
      icon: "👑",
      unlocked: false,
      requirement: "Reach Level 10"
    },
    {
      id: "b5",
      title: "Power Saver",
      description: "Log appliance adjustments and save 15 kWh.",
      icon: "⚡",
      unlocked: false,
      requirement: "Reduce electricity"
    }
  ];
};

export const saveLocalBadges = (badges: Badge[]): void => {
  localStorage.setItem(BADGES_KEY, JSON.stringify(badges));
};

export const getLocalTransactions = (): RewardTransaction[] => {
  const data = localStorage.getItem(TRANSACTIONS_KEY);
  if (data) return JSON.parse(data);
  return [
    { id: "tx-1", title: "Account Signup Bonus", points: 1000, type: "earn", date: "2026-06-09" },
    {
      id: "tx-2",
      title: "Completed: Walk instead of drive",
      points: 250,
      type: "earn",
      date: "2026-06-09"
    }
  ];
};

export const saveLocalTransactions = (txs: RewardTransaction[]): void => {
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(txs));
};
