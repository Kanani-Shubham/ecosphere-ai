import { create } from "zustand";
import { db, DbScanLog, DbNotification, DbLearningArticle, DbSettings } from "./db";
import {
  UserProfile,
  Activity,
  Goal,
  Challenge,
  CommunityPost,
  Badge,
  RewardTransaction,
  ChatMessage,
  CategoryType
} from "../types";
import { calculateCarbonActionSavings } from "./carbonCalculator";
import { getProgression } from "../utils/xpCalculator";
import { calculateStreakUpdate } from "../utils/streakCalculator";
export { getProgression, calculateStreakUpdate };

interface AppState {
  profile: UserProfile | null;
  user: UserProfile | null;
  isTransactionLocked: boolean;
  activities: Activity[];
  goals: Goal[];
  challenges: Challenge[];
  community: CommunityPost[];
  badges: Badge[];
  transactions: RewardTransaction[];
  chats: ChatMessage[];
  scans: DbScanLog[];
  notifications: DbNotification[];
  learningArticles: DbLearningArticle[];
  settings: DbSettings | null;
  isLoadingStore: boolean;
  dbInitStatus:
    | "uninitialized"
    | "loading"
    | "restoring"
    | "ready"
    | "corrupted"
    | "recovered"
    | "error";
  dbStatusMessage: string;

  // Global Operations
  initStore: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  resetAll: () => Promise<void>;

  // Activity Operations
  addActivity: (
    activity: Omit<Activity, "id" | "date"> & { id?: string; date?: string }
  ) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;

  // Goal Operations
  addGoal: (
    goal: Omit<Goal, "id" | "completed" | "currentValue"> & {
      id?: string;
      currentValue?: number;
      completed?: boolean;
    }
  ) => Promise<void>;
  toggleGoalComplete: (id: string) => Promise<void>;
  incrementGoalProgress: (id: string, amount: number) => Promise<void>;
  clearGoals: () => Promise<void>;

  // Challenge Operations
  completeChallenge: (id: string) => Promise<void>;

  // Community Operations
  addCommunityPost: (
    content: string,
    category: string,
    image?: string,
    postType?: "text" | "image" | "achievement" | "challenge" | "milestone"
  ) => Promise<void>;
  likeCommunityPost: (postId: string) => Promise<void>;
  commentCommunityPost: (postId: string, commentText: string) => Promise<void>;
  replyCommentCommunityPost: (
    postId: string,
    commentId: string,
    replyText: string
  ) => Promise<void>;
  deleteCommunityPost: (postId: string) => Promise<void>;
  editCommunityPost: (postId: string, newContent: string) => Promise<void>;
  reportCommunityPost: (postId: string) => Promise<void>;
  saveCommunityPost: (postId: string) => Promise<void>;

  // Scan Operations
  addScan: (scan: Omit<DbScanLog, "id" | "timestamp">) => Promise<void>;
  deleteScan: (id: string) => Promise<void>;

  // Notification Operations
  addNotification: (
    title: string,
    body: string,
    category: DbNotification["category"]
  ) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;

  // Learning Hub Operations
  bookmarkArticle: (id: string) => Promise<void>;
  completeArticle: (id: string) => Promise<void>;
  addLearningArticle: (article: DbLearningArticle) => Promise<void>;

  // Settings Operations
  saveSettings: (settings: Partial<DbSettings>) => Promise<void>;

  // AI Assistant Messages
  addChatMessage: (msg: ChatMessage) => Promise<void>;
  clearChats: () => Promise<void>;

  // Achievement audit trigger
  auditAchievements: () => void;
  // Unified Rewards & Challenge Operations
  addRewardTransaction: (
    title: string,
    points: number,
    xp: number,
    source: string,
    dateArg?: string
  ) => Promise<void>;
  claimDailyMission: () => Promise<void>;
}

// Default initial state data for cold restarts
const DEFAULT_GOALS: Goal[] = [
  {
    id: "1",
    title: "Reduce home power consumption by 20%",
    category: "energy",
    targetValue: 120,
    currentValue: 45,
    deadline: "2026-07-31",
    completed: false
  },
  {
    id: "2",
    title: "Cycle or walk to local markets",
    category: "transport",
    targetValue: 50,
    currentValue: 12,
    deadline: "2026-06-30",
    completed: false
  },
  {
    id: "3",
    title: "Eat organic vegan breakfasts",
    category: "food",
    targetValue: 30,
    currentValue: 10,
    deadline: "2026-12-31",
    completed: false
  },
  {
    id: "4",
    title: "Compost organic household solid scrap",
    category: "waste",
    targetValue: 10,
    currentValue: 3,
    deadline: "2026-06-25",
    completed: false
  }
];

const DEFAULT_CHALLENGES: Challenge[] = [
  {
    id: "c1",
    title: "Walk 3 km today",
    category: "transport",
    description: "Save vehicle fuel and emissions by walk instead of driving short distances.",
    xpReward: 40,
    pointsReward: 150,
    difficulty: "Easy",
    completed: false,
    type: "daily"
  },
  {
    id: "c2",
    title: "No plastic day",
    category: "waste",
    description: "Refuse single-use cups, grocery carrier bags, and plastic cutlery.",
    xpReward: 30,
    pointsReward: 100,
    difficulty: "Easy",
    completed: false,
    type: "daily"
  },
  {
    id: "c3",
    title: "Use public transport",
    category: "transport",
    description: "Adopt train, electric commuter rail, or shared transit today.",
    xpReward: 60,
    pointsReward: 200,
    difficulty: "Medium",
    completed: false,
    type: "daily"
  },
  {
    id: "c4",
    title: "Eat plant-based meal",
    category: "food",
    description: "Prepare a breakfast, lunch or dinner consisting solely of vegetables & grains.",
    xpReward: 30,
    pointsReward: 100,
    difficulty: "Easy",
    completed: false,
    type: "daily"
  },
  {
    id: "c5",
    title: "Commute by bicycle",
    category: "transport",
    description: "Bicycle to and from school, college or work, saving 5 kg CO2.",
    xpReward: 120,
    pointsReward: 350,
    difficulty: "Medium",
    completed: false,
    type: "weekly"
  },
  {
    id: "c6",
    title: "Set thermostat to 25°C",
    category: "energy",
    description: "Ensure household active cooling is optimized for less grid carbon draw.",
    xpReward: 80,
    pointsReward: 250,
    difficulty: "Easy",
    completed: false,
    type: "weekly"
  },
  {
    id: "c7",
    title: "Zero Waste Week",
    category: "waste",
    description: "Produce zero disposable waste for 7 consecutive days.",
    xpReward: 300,
    pointsReward: 750,
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
    xpReward: 450,
    pointsReward: 1000,
    difficulty: "Hard",
    completed: false,
    type: "special"
  }
];

const DEFAULT_BADGES: Badge[] = [
  {
    id: "b1",
    title: "Green Starter",
    description: "Complete onboarding and personal profile setup.",
    icon: "🌱",
    unlocked: false,
    requirement: "Setup profile"
  },
  {
    id: "b2",
    title: "Green Streak",
    description: "Maintain a sustainable activity streak for over 5 days.",
    icon: "🔥",
    unlocked: false,
    requirement: "5-day streak"
  },
  {
    id: "b3",
    title: "Tree Saver",
    description: "Accumulate more than 50 kg of CO2 savings.",
    icon: "🌳",
    unlocked: false,
    requirement: "50 kg CO2e saved"
  },
  {
    id: "b4",
    title: "Eco Champion",
    description: "Rise to Level 10 and maintain active eco-warrior energy.",
    icon: "👑",
    unlocked: false,
    requirement: "Reach Level 10"
  },
  {
    id: "b5",
    title: "Light Speed",
    description: "Record direct home appliance savings or switch to solar.",
    icon: "⚡",
    unlocked: false,
    requirement: "Reduce electricity"
  }
];

const DEFAULT_SETTINGS: DbSettings = {
  id: "global",
  theme: "light",
  language: "en",
  dailyReminder: true,
  challengeReminder: true,
  goalReminder: true,
  weeklyReportReminder: true,
  achievementAlerts: true
};

const DEFAULT_COMMUNITY: CommunityPost[] = [];

const DEFAULT_CHATS: ChatMessage[] = [
  {
    id: "init-1",
    sender: "ai",
    text: "Welcome to EcoSphere AI, your proactive climate-coaching environment! I am here to help you identify quick emission cuts, log receipts, or audit appliance logs with deep intelligence. Where would you like to start?",
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }
];

const DEFAULT_LEARNING: DbLearningArticle[] = [
  {
    id: "la-1",
    title: "Understanding CO2e Footprints",
    content:
      "Carbon dioxide equivalent (CO2e) is a unit used to compare the climate impact of various greenhouse gases including methane and nitrous oxide based on their global warming potential. Minimizing everyday inputs is key to balancing the biosphere.",
    category: "Science",
    co2SavedValue: 4.5,
    readProgress: 0,
    bookmarked: false,
    completed: false,
    xpValue: 50,
    dateGenerated: "2026-06-09"
  },
  {
    id: "la-2",
    title: "Vampire Power & Smart Adjustments",
    content:
      "Microwaves, TVs, and wall adapters draw electricity even when on stand-by mode. Connecting household electronics to programmable smart outlets or switching appliance mains off is estimated to save 8-12% of baseline home electrical costs.",
    category: "Energy",
    co2SavedValue: 6.2,
    readProgress: 0,
    bookmarked: false,
    completed: false,
    xpValue: 40,
    dateGenerated: "2026-06-09"
  }
];

export const useAppStore = create<AppState>((set, get) => ({
  profile: null,
  user: null,
  isTransactionLocked: false,
  activities: [],
  goals: [],
  challenges: [],
  community: [],
  badges: [],
  transactions: [],
  chats: [],
  scans: [],
  notifications: [],
  learningArticles: [],
  settings: null,
  isLoadingStore: true,
  dbInitStatus: "uninitialized",
  dbStatusMessage: "Awaiting database engine...",

  initStore: async () => {
    try {
      set({
        isLoadingStore: true,
        dbInitStatus: "loading",
        dbStatusMessage: "Connecting to browser storage (IndexedDB)..."
      });

      // Corruption recovery safety wrapper
      try {
        if (!db.isOpen()) {
          await db.open();
        }
      } catch (err) {
        console.warn("Database failed to open normally. Executing recovery rebuild.", err);
        set({
          dbInitStatus: "corrupted",
          dbStatusMessage: "Database corruption detected! Rebuilding storage..."
        });

        // Attempt recovery rebuild by resetting Dexie local Tables
        await db.delete();
        await db.open();

        set({
          dbInitStatus: "recovered",
          dbStatusMessage: "Database storage recovered successfully."
        });
      }

      set({
        dbInitStatus: "restoring",
        dbStatusMessage: "Restoring Climate Profile & User History..."
      });

      // Fetch initial datasets
      let dbProfile = await db.profile.get("user");
      if (dbProfile) {
        if (dbProfile.totalXP === undefined) dbProfile.totalXP = dbProfile.xp || 0;
        if (dbProfile.currentStreak === undefined) dbProfile.currentStreak = dbProfile.streak || 0;

        const todayStr = new Date().toISOString().split("T")[0];
        const lastActiveDate = dbProfile.lastActivityDate;
        if (lastActiveDate) {
          const lastDate = new Date(lastActiveDate);
          const todayDate = new Date(todayStr);
          lastDate.setHours(0, 0, 0, 0);
          todayDate.setHours(0, 0, 0, 0);
          const diffTime = todayDate.getTime() - lastDate.getTime();
          const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays > 1) {
            dbProfile.streak = 0;
            dbProfile.currentStreak = 0;
          }
        }
        await db.profile.put(dbProfile);
      }
      const dbActivities = await db.activities.toArray();
      const dbGoals = await db.goals.toArray();
      const dbChallenges = await db.challenges.toArray();
      const dbCommunity = await db.community.toArray();
      const dbBadges = await db.badges.toArray();
      const dbTransactions = await db.transactions.toArray();
      const dbChats = await db.chats.toArray();
      const dbScans = await db.scans.toArray();
      const dbNotifications = await db.notifications.toArray();
      const dbLearning = await db.learningArticles.toArray();
      const dbSettings = await db.settings.get("global");

      let finalSettings = dbSettings;
      if (!dbSettings) {
        finalSettings = DEFAULT_SETTINGS;
        await db.settings.put(DEFAULT_SETTINGS);
      }

      // If empty tables, bootstrap with high quality defaults to ensure zero-lag out-of-the-box user experience
      let finalGoals = dbGoals;
      if (dbGoals.length === 0) {
        finalGoals = DEFAULT_GOALS;
        await db.goals.bulkPut(DEFAULT_GOALS);
      }

      let finalChallenges = dbChallenges;
      if (dbChallenges.length === 0) {
        finalChallenges = DEFAULT_CHALLENGES;
        await db.challenges.bulkPut(DEFAULT_CHALLENGES);
      }

      let finalBadges = dbBadges;
      if (dbBadges.length === 0) {
        finalBadges = DEFAULT_BADGES;
        await db.badges.bulkPut(DEFAULT_BADGES);
      }

      let finalCommunity = dbCommunity;
      if (dbCommunity.length === 0) {
        finalCommunity = DEFAULT_COMMUNITY;
        await db.community.bulkPut(DEFAULT_COMMUNITY);
      }

      let finalChats = dbChats;
      if (dbChats.length === 0) {
        finalChats = DEFAULT_CHATS;
        await db.chats.bulkPut(DEFAULT_CHATS);
      }

      let finalLearning = dbLearning;
      if (dbLearning.length === 0) {
        finalLearning = DEFAULT_LEARNING;
        await db.learningArticles.bulkPut(DEFAULT_LEARNING);
      }

      set({
        profile: dbProfile || null,
        user: dbProfile || null,
        activities: dbActivities,
        goals: finalGoals,
        challenges: finalChallenges,
        community: finalCommunity,
        badges: finalBadges,
        transactions: dbTransactions,
        chats: finalChats,
        scans: dbScans,
        notifications: dbNotifications,
        learningArticles: finalLearning,
        settings: finalSettings,
        isLoadingStore: false,
        dbInitStatus: "ready",
        dbStatusMessage: "Data synchronization completed!"
      });

      // Audit achievements once based on initial load data
      get().auditAchievements();
    } catch (e) {
      console.error("Dexie database initialize exception:", e);
      set({
        isLoadingStore: false,
        dbInitStatus: "error",
        dbStatusMessage: "Initialization error. Storage localized."
      });
    }
  },

  updateProfile: async (newProfile) => {
    const current = get().profile;
    // Calculate level metrics based on new/updated XP
    let updatedXp = newProfile.xp !== undefined ? newProfile.xp : current?.xp || 0;
    const progression = getProgression(updatedXp);
    const isLevelUp = current && current.level > 0 && progression.level > current.level;

    const consolidated: UserProfile = {
      name: current?.name || "Eco Warrior",
      age: current?.age || 26,
      country: current?.country || "India",
      city: current?.city || "Mumbai",
      transportHabit: current?.transportHabit || "ev",
      foodHabit: current?.foodHabit || "balanced",
      electricityHabit: current?.electricityHabit || "standard",
      shoppingHabit: current?.shoppingHabit || "groceries",
      travelHabit: current?.travelHabit || "standard",
      ...current,
      ...newProfile,
      level: progression.level,
      xp: updatedXp,
      totalXP: updatedXp,
      xpNeeded: progression.xpNeeded,
      levelRank: progression.levelRank,
      ecoPoints:
        newProfile.ecoPoints !== undefined ? newProfile.ecoPoints : current?.ecoPoints || 1000,
      streak:
        newProfile.streak !== undefined
          ? newProfile.streak
          : newProfile.currentStreak !== undefined
            ? newProfile.currentStreak
            : current?.streak || 0,
      currentStreak:
        newProfile.currentStreak !== undefined
          ? newProfile.currentStreak
          : newProfile.streak !== undefined
            ? newProfile.streak
            : current?.currentStreak || 0,
      hasCompletedOnboarding:
        newProfile.hasCompletedOnboarding !== undefined
          ? newProfile.hasCompletedOnboarding
          : current?.hasCompletedOnboarding || true
    };

    set({ profile: consolidated, user: consolidated });
    await db.profile.put({ ...consolidated, id: "user" });

    if (isLevelUp) {
      await get().addNotification(
        "Level Up Achieved!",
        `Amazing work, you reached level ${progression.level}! Your ecosystem rank is now "${consolidated.levelRank}". Keep logging to protect our climate!`,
        "system"
      );
    }
    // Audit achievements after updates
    get().auditAchievements();
  },

  resetAll: async () => {
    await db.profile.clear();
    await db.activities.clear();
    await db.goals.clear();
    await db.challenges.clear();
    await db.community.clear();
    await db.badges.clear();
    await db.transactions.clear();
    await db.chats.clear();
    await db.scans.clear();
    await db.notifications.clear();
    await db.learningArticles.clear();
    set({
      profile: null,
      activities: [],
      goals: [],
      challenges: [],
      community: [],
      badges: [],
      transactions: [],
      chats: [],
      scans: [],
      notifications: [],
      learningArticles: [],
      settings: DEFAULT_SETTINGS
    });
    // Restore bootstrap setting
    await db.settings.put(DEFAULT_SETTINGS);
  },

  addActivity: async (act) => {
    const id = act.id || "act-" + Date.now();
    const date = act.date || new Date().toISOString().split("T")[0];
    const fullActivity: Activity = {
      ...act,
      id,
      date
    };

    const updated = [...get().activities, fullActivity];
    set({ activities: updated });
    await db.activities.put(fullActivity);

    // Apply EcoPoints and XP awards dynamically from activities using unified Reward system
    const currentPointsAwarded = act.pointsEarned || 100;
    const currentXpAwarded = act.pointsEarned ? Math.round(act.pointsEarned * 0.3) : 30;

    const profile = get().profile;
    if (profile) {
      await get().addRewardTransaction(
        `Logged Activity: ${act.title}`,
        currentPointsAwarded,
        currentXpAwarded,
        "activity",
        date
      );

      // Dynamically increment active target goals matching this activity category
      await Promise.all(
        get().goals.map(async (g) => {
          if (!g.completed && g.category === act.category) {
            // Log carbon value saved as progress
            await get().incrementGoalProgress(g.id, act.co2Value);
          }
        })
      );
    }
  },

  deleteActivity: async (id) => {
    const act = get().activities.find((a) => a.id === id);
    if (act) {
      const updated = get().activities.filter((a) => a.id !== id);
      set({ activities: updated });
      await db.activities.delete(id);
    }
  },

  addGoal: async (goal) => {
    const id = goal.id || "goal-" + Date.now();
    const fullGoal: Goal = {
      id,
      title: goal.title,
      category: goal.category,
      targetValue: goal.targetValue,
      currentValue: goal.currentValue || 0,
      deadline: goal.deadline,
      completed: goal.completed || false
    };

    const updated = [...get().goals, fullGoal];
    set({ goals: updated });
    await db.goals.put(fullGoal);
  },

  toggleGoalComplete: async (id) => {
    const items = get().goals.map((g) => {
      if (g.id === id) {
        return { ...g, completed: true, currentValue: g.targetValue };
      }
      return g;
    });

    set({ goals: items });
    const target = items.find((g) => g.id === id);
    if (target) {
      await db.goals.put(target);

      // Award bonus points on goal accomplishments
      const profile = get().profile;
      if (profile) {
        await get().updateProfile({
          ecoPoints: profile.ecoPoints + 300,
          xp: profile.xp + 150
        });

        // Log transaction
        const tx: RewardTransaction = {
          id: "tx-" + Date.now(),
          title: `Sustained Goal Complete: ${target.title}`,
          points: 300,
          type: "earn",
          date: new Date().toISOString().split("T")[0]
        };
        set({ transactions: [...get().transactions, tx] });
        await db.transactions.put(tx);

        await get().addNotification(
          "Goal Target Accomplished!",
          `Splendid! You have successfully completed your goal "${target.title}". Gained +300 Eco Points & +150 XP.`,
          "goal"
        );
      }
    }
  },

  incrementGoalProgress: async (id, amount) => {
    const items = get().goals.map((g) => {
      if (g.id === id) {
        const nextValue = Number((g.currentValue + amount).toFixed(1));
        const isCompletedNow = nextValue >= g.targetValue;
        return {
          ...g,
          currentValue: isCompletedNow ? g.targetValue : nextValue,
          completed: g.completed || isCompletedNow
        };
      }
      return g;
    });

    set({ goals: items });
    const target = items.find((g) => g.id === id);
    if (target) {
      await db.goals.put(target);

      if (target.completed) {
        // Trigger rewards on newly completed
        const profile = get().profile;
        if (profile) {
          await get().updateProfile({
            ecoPoints: profile.ecoPoints + 300,
            xp: profile.xp + 150
          });
          const tx: RewardTransaction = {
            id: "tx-" + Date.now(),
            title: `Goal Complete: ${target.title}`,
            points: 300,
            type: "earn",
            date: new Date().toISOString().split("T")[0]
          };
          set({ transactions: [...get().transactions, tx] });
          await db.transactions.put(tx);

          await get().addNotification(
            "Goal Target Achieved!",
            `Way to go! You earned 300 Eco Points by logging enough actions to complete "${target.title}".`,
            "goal"
          );
        }
      }
    }
  },

  clearGoals: async () => {
    await db.goals.clear();
    set({ goals: [] });
  },

  completeChallenge: async (id) => {
    // Prevent duplicate claim / Claim once only guard
    const ch = get().challenges.find((c) => c.id === id);
    if (!ch || ch.completed) return;

    const updated = get().challenges.map((c) => {
      if (c.id === id) {
        return { ...c, completed: true };
      }
      return c;
    });

    set({ challenges: updated });
    await db.challenges.put({ ...ch, completed: true });

    // Store a corresponding Activity log automatically to ensure timeline, carbon calculators, and reports updates
    const date = new Date().toISOString().split("T")[0];
    const actId = "challenge-act-" + Date.now();
    const challengeActivity: Activity = {
      id: actId,
      title: `Challenge: ${ch.title}`,
      category: ch.category,
      co2Value: -2.0, // standard offset value
      date,
      pointsEarned: ch.pointsReward
    };

    set((state) => ({
      activities: [...state.activities, challengeActivity]
    }));
    await db.activities.put(challengeActivity);

    // Increment active goals matching this category
    await Promise.all(
      get().goals.map(async (g) => {
        if (!g.completed && g.category === ch.category) {
          await get().incrementGoalProgress(g.id, challengeActivity.co2Value);
        }
      })
    );

    const profile = get().profile;
    if (profile) {
      await get().addRewardTransaction(
        `Challenge Completed: ${ch.title}`,
        ch.pointsReward,
        ch.xpReward,
        "challenge",
        date
      );

      await get().addNotification(
        "Challenge Complete!",
        `Congratulations on resolving "${ch.title}"! Gained +${ch.pointsReward} Points & +${ch.xpReward} XP. Daily streak expanded!`,
        "challenge"
      );
    }
  },

  addCommunityPost: async (content, category, image, postType) => {
    if (!content || !content.trim()) return;

    const profile = get().profile;
    const author = profile?.name || "Eco Warrior";
    const avatar =
      profile?.profileImage ||
      (profile?.name
        ? `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(profile.name)}`
        : "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150");

    const newPost: CommunityPost = {
      id: "post-" + Date.now(),
      authorId: "user", // critical for real-time local sync matching
      author,
      avatar,
      timeString: "Just now",
      content,
      likes: 0,
      commentsCount: 0,
      liked: false,
      category,
      image,
      commentsList: [],
      saved: false,
      reported: false,
      authorLevel: profile?.level || 1,
      authorRank: profile?.levelRank || "Novice",
      postType: postType || "text"
    };

    const updated = [newPost, ...get().community];
    set({ community: updated });
    await db.community.put(newPost);

    // Reward points for initiating green stories
    if (profile) {
      await get().updateProfile({
        ecoPoints: profile.ecoPoints + 50,
        xp: profile.xp + 25
      });

      const tx: RewardTransaction = {
        id: "tx-" + Date.now(),
        title: `Community Organic Story Shared`,
        points: 50,
        type: "earn",
        date: new Date().toISOString().split("T")[0]
      };
      set({ transactions: [...get().transactions, tx] });
      await db.transactions.put(tx);

      await get().addNotification(
        "Social Contribution Logged",
        "Your green story has been broadcasted. Others can now see, like and duplicate your efforts! +50 EcoPoints granted.",
        "learning"
      );
    }
  },

  likeCommunityPost: async (postId) => {
    const updated = get().community.map((p) => {
      if (p.id === postId) {
        return {
          ...p,
          liked: !p.liked,
          likes: p.liked ? p.likes - 1 : p.likes + 1
        };
      }
      return p;
    });
    set({ community: updated });
    const clicked = updated.find((p) => p.id === postId);
    if (clicked) {
      await db.community.put(clicked);
    }
  },

  commentCommunityPost: async (postId, text) => {
    const profile = get().profile;
    const authorName = profile?.name || "Eco Warrior";
    const avatar =
      profile?.profileImage ||
      (profile?.name
        ? `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(profile.name)}`
        : "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150");

    const newComment = {
      id: "comment-" + Date.now(),
      authorId: "user",
      author: authorName,
      avatar,
      content: text,
      timeString: "Just now",
      replies: []
    };

    const updated = get().community.map((p) => {
      if (p.id === postId) {
        const comments = p.commentsList || [];
        return {
          ...p,
          commentsCount: p.commentsCount + 1,
          commentsList: [...comments, newComment]
        };
      }
      return p;
    });
    set({ community: updated });
    const clicked = updated.find((p) => p.id === postId);
    if (clicked) {
      await db.community.put(clicked);
    }
  },

  replyCommentCommunityPost: async (postId, commentId, replyText) => {
    const profile = get().profile;
    const authorName = profile?.name || "Eco Warrior";
    const avatar =
      profile?.profileImage ||
      (profile?.name
        ? `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(profile.name)}`
        : "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150");

    const newReply = {
      id: "reply-" + Date.now(),
      authorId: "user",
      author: authorName,
      avatar,
      content: replyText,
      timeString: "Just now"
    };

    const updated = get().community.map((p) => {
      if (p.id === postId) {
        const comments = (p.commentsList || []).map((c) => {
          if (c.id === commentId) {
            return {
              ...c,
              replies: [...(c.replies || []), newReply]
            };
          }
          return c;
        });
        return {
          ...p,
          commentsCount: p.commentsCount + 1,
          commentsList: comments
        };
      }
      return p;
    });
    set({ community: updated });
    const clicked = updated.find((p) => p.id === postId);
    if (clicked) {
      await db.community.put(clicked);
    }
  },

  deleteCommunityPost: async (postId) => {
    const updated = get().community.filter((p) => p.id !== postId);
    set({ community: updated });
    await db.community.delete(postId);
  },

  editCommunityPost: async (postId, newContent) => {
    const updated = get().community.map((p) => {
      if (p.id === postId) {
        return {
          ...p,
          content: newContent,
          isEdited: true
        };
      }
      return p;
    });
    set({ community: updated });
    const clicked = updated.find((p) => p.id === postId);
    if (clicked) {
      await db.community.put(clicked);
    }
  },

  reportCommunityPost: async (postId) => {
    const updated = get().community.map((p) => {
      if (p.id === postId) {
        return {
          ...p,
          reported: true
        };
      }
      return p;
    });
    set({ community: updated });
    const clicked = updated.find((p) => p.id === postId);
    if (clicked) {
      await db.community.put(clicked);
    }
  },

  saveCommunityPost: async (postId) => {
    const updated = get().community.map((p) => {
      if (p.id === postId) {
        return {
          ...p,
          saved: !p.saved
        };
      }
      return p;
    });
    set({ community: updated });
    const clicked = updated.find((p) => p.id === postId);
    if (clicked) {
      await db.community.put(clicked);
    }
  },

  addScan: async (scan) => {
    const id = "scan-" + Date.now();
    const fullScanLog: DbScanLog = {
      ...scan,
      id,
      timestamp: new Date().toLocaleString()
    };

    const updated = [fullScanLog, ...get().scans];
    set({ scans: updated });
    await db.scans.put(fullScanLog);

    // Auto-create and save corresponding Activity log to update analytics and timeline!
    const date = new Date().toISOString().split("T")[0];
    const actId = "scan-act-" + Date.now();
    const activityName = scan.name;
    const category = (scan.category ||
      (scan.type === "receipt"
        ? "food"
        : scan.type === "bill"
          ? "energy"
          : "shopping")) as CategoryType;

    // Receipts generally represent carbon redacting savings; other scans list footprints
    let co2Val = scan.co2Value;
    if (scan.type === "receipt") {
      co2Val = -Math.abs(co2Val);
    } else {
      co2Val = Math.abs(co2Val);
    }

    const scanActivity: Activity = {
      id: actId,
      title: `Scan: ${activityName}`,
      category,
      co2Value: Number(co2Val.toFixed(1)),
      date,
      pointsEarned: 150
    };

    set((state) => ({
      activities: [...state.activities, scanActivity]
    }));
    await db.activities.put(scanActivity);

    // Increment active target goals matching this category
    await Promise.all(
      get().goals.map(async (g) => {
        if (!g.completed && g.category === category) {
          await get().incrementGoalProgress(g.id, scanActivity.co2Value);
        }
      })
    );

    // Unified Reward & Wallet Engine update
    const profile = get().profile;
    if (profile) {
      await get().addRewardTransaction(
        `AI Environment Scan: ${scan.name}`,
        150, // EcoPoints
        50, // XP
        "scan",
        date
      );

      // Centrally dispatch scan completed notification
      await get().addNotification(
        "Environmental Scan Processed",
        `Gemini successfully analyzed ${scan.name}. Logged ${Math.abs(co2Val)} kg CO₂e and awarded +150 EcoPoints!`,
        "system"
      );
    }

    try {
      const { NotificationService } = await import("../services/NotificationService");
      await NotificationService.notifyScanCompleted(scan.type, scan.co2Value);
    } catch (e) {
      console.warn("[addScan] NotificationService call failed.", e);
    }
  },

  deleteScan: async (id) => {
    const updated = get().scans.filter((s) => s.id !== id);
    set({ scans: updated });
    await db.scans.delete(id);
  },

  addNotification: async (title, body, category) => {
    const { NotificationService } = await import("../services/NotificationService");
    await NotificationService.createNotification(title, body, category);
  },

  markNotificationRead: async (id) => {
    const updated = get().notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    set({ notifications: updated });
    const matched = updated.find((n) => n.id === id);
    if (matched) {
      await db.notifications.put(matched);
    }
  },

  clearAllNotifications: async () => {
    await db.notifications.clear();
    set({ notifications: [] });
  },

  bookmarkArticle: async (id) => {
    const updated = get().learningArticles.map((a) =>
      a.id === id ? { ...a, bookmarked: !a.bookmarked } : a
    );
    set({ learningArticles: updated });
    const matched = updated.find((a) => a.id === id);
    if (matched) {
      await db.learningArticles.put(matched);
    }
  },

  completeArticle: async (id) => {
    const updated = get().learningArticles.map((a) => {
      if (a.id === id && !a.completed) {
        return { ...a, completed: true, readProgress: 100 };
      }
      return a;
    });

    const isFirstTimeCompletion =
      get().learningArticles.find((a) => a.id === id)?.completed === false;

    set({ learningArticles: updated });
    const matched = updated.find((a) => a.id === id);
    if (matched) {
      await db.learningArticles.put(matched);

      if (isFirstTimeCompletion) {
        // Award learning points
        const profile = get().profile;
        if (profile) {
          await get().updateProfile({
            ecoPoints: profile.ecoPoints + matched.xpValue * 2, // Double points
            xp: profile.xp + matched.xpValue
          });

          const tx: RewardTransaction = {
            id: "tx-" + Date.now(),
            title: `Read Article: ${matched.title}`,
            points: matched.xpValue * 2,
            type: "earn",
            date: new Date().toISOString().split("T")[0]
          };
          set({ transactions: [...get().transactions, tx] });
          await db.transactions.put(tx);

          await get().addNotification(
            "Eco knowledge Acquired!",
            `Successfully read "${matched.title}". Earned +${matched.xpValue * 2} eco points. Knowledge is power!`,
            "learning"
          );
        }
      }
    }
  },

  addLearningArticle: async (article) => {
    const articles = [article, ...get().learningArticles];
    set({ learningArticles: articles });
    await db.learningArticles.put(article);
  },

  saveSettings: async (settingsDiff) => {
    const current = get().settings || DEFAULT_SETTINGS;
    const combined: DbSettings = {
      ...current,
      ...settingsDiff,
      id: "global"
    };
    set({ settings: combined });
    await db.settings.put(combined);
  },

  addChatMessage: async (msg) => {
    const updated = [...get().chats, msg];
    set({ chats: updated });
    await db.chats.put(msg);
  },

  clearChats: async () => {
    await db.chats.clear();
    set({ chats: DEFAULT_CHATS });
    await db.chats.bulkPut(DEFAULT_CHATS);
  },

  // Auto-Unlocking achievement engine
  auditAchievements: () => {
    const state = get();
    const profile = state.profile;
    if (!profile) return;

    // We search current badges status
    let changed = false;
    const auditedBadges = state.badges.map((b) => {
      if (b.unlocked) return b; // Already unlocked

      let shouldUnlock = false;

      switch (b.id) {
        case "b1":
          // Complete onboarding profile setup
          shouldUnlock = !!profile.name && profile.name !== "Eco Warrior";
          break;
        case "b2":
          // Maintain sustainable activity streak
          shouldUnlock = profile.streak >= 5;
          break;
        case "b3":
          // Accumulate more than 50 kg of CO2 savings
          const sumCo2 = state.activities.reduce(
            (acc, current) => acc + (current.co2Value || 0),
            0
          );
          shouldUnlock = sumCo2 >= 50;
          break;
        case "b4":
          // Level up to Level 10
          shouldUnlock = profile.level >= 10;
          break;
        case "b5":
          // Power saver - adjust residential grids
          const hasLoggedEnergy = state.activities.some((a) => a.category === "energy");
          shouldUnlock = hasLoggedEnergy;
          break;
      }

      if (shouldUnlock) {
        changed = true;
        // Generate automatic achievement notification
        setTimeout(() => {
          state.addNotification(
            `Badge Unlocked: ${b.title}!`,
            `Spectacular! You successfully fulfilled requirements for ${b.title}: "${b.description}"`,
            "achievement"
          );
        }, 100);

        return {
          ...b,
          unlocked: true,
          unlockedDate: new Date().toISOString().split("T")[0]
        };
      }

      return b;
    });

    if (changed) {
      set({ badges: auditedBadges });
      // Bulk update committed to persistent DB tables
      auditedBadges.forEach((b) => {
        db.badges.put(b);
      });
    }
  },

  addRewardTransaction: async (title, points, xp, source, dateArg) => {
    const profile = get().profile;
    if (!profile) return;

    const date = dateArg || new Date().toISOString().split("T")[0];
    const isSpend = points < 0 || source === "marketplace";
    const tx: RewardTransaction = {
      id: "tx-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      title,
      points: Math.abs(points),
      type: isSpend ? "spend" : "earn",
      date,
      xpEarned: xp,
      source
    };

    await db.transactions.put(tx);
    const dbTransactions = await db.transactions.toArray();

    // Dynamic Sum calculations
    let computedPoints = 0;
    let computedXp = 0;
    dbTransactions.forEach((t) => {
      if (t.type === "earn") {
        computedPoints += t.points || 0;
        computedXp += (t as any).xpEarned || 0;
      } else {
        computedPoints -= t.points || 0;
      }
    });

    set({ transactions: dbTransactions });

    let streakUpdate = {};
    if (points > 0 || xp > 0) {
      streakUpdate = calculateStreakUpdate(profile, date);
    }

    await get().updateProfile({
      ...streakUpdate,
      ecoPoints: computedPoints,
      xp: computedXp
    });
  },

  claimDailyMission: async () => {
    if (get().isTransactionLocked) {
      console.warn("Operation locked. Transaction is already in progress.");
      return;
    }
    const profile = get().profile;
    if (!profile) return;

    const todayStr = new Date().toISOString().split("T")[0];

    // Double-check: Check memory state & db profile to prevent duplicate claims
    if (
      profile.dailyMissionClaimedDate === todayStr ||
      profile.lastClaimDate === todayStr ||
      profile.lastRewardClaimDate === todayStr
    ) {
      console.warn("Daily mission already claimed today according to memory profile.");
      return;
    }

    set({ isTransactionLocked: true });

    try {
      // Direct Dexie database double check to prevent multiple tab race conditions
      const existingTx = await db.transactions
        .filter((t) => t.source === "daily-mission" && t.date === todayStr)
        .first();

      if (existingTx) {
        console.warn("Daily mission transaction already exists in persistent database.");
        await get().updateProfile({
          dailyMissionClaimedDate: todayStr,
          lastClaimDate: todayStr,
          lastRewardClaimDate: todayStr
        });
        set({ isTransactionLocked: false });
        return;
      }

      // Add actual activity log record for carbon reduction calculating "Trees Saved"
      await get().addActivity({
        title: "Completed Daily Mission: Green Walk",
        category: "transport",
        co2Value: -2.5,
        date: todayStr,
        pointsEarned: 250
      });

      // Claim through unified reward ledger (updates ecoPoints, totalXP, xp automatically)
      await get().addRewardTransaction(
        "Completed Daily Mission: Green Walk",
        250,
        50,
        "daily-mission",
        todayStr
      );

      // Perform unified profile update with reset dates and explicit reward dates
      await get().updateProfile({
        dailyMissionClaimedDate: todayStr,
        lastClaimDate: todayStr,
        lastRewardClaimDate: todayStr
      });

      await get().addNotification(
        "Daily Mission Claimed!",
        "Great work! You claimed +250 Eco Points for completing your daily mission.",
        "challenge"
      );

      // Explicitly trigger badges check
      get().auditAchievements();
    } catch (err) {
      console.error("Error during transaction claimDailyMission:", err);
    } finally {
      set({ isTransactionLocked: false });
    }
  }
}));
export const useStore = useAppStore;
