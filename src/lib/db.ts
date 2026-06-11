import Dexie, { Table } from "dexie";
import {
  UserProfile,
  Activity,
  Goal,
  Challenge,
  CommunityPost,
  Badge,
  RewardTransaction,
  ChatMessage
} from "../types";

// Extend models for internal DB attributes
export interface DbScanLog {
  id: string;
  name: string;
  type: "receipt" | "bill" | "camera";
  timestamp: string;
  co2Value: number;
  category: string;
  summary: string;
  warning?: string;
  items?: Array<{ name: string; co2: number; category: string; alternative?: string }>;
  carbonImpactScore?: number;
  monthlySavingsEstimate?: string;
  carbonReductionPotential?: string;
  personalizedSuggestions?: string[];
  betterAlternatives?: string[];
}

export interface DbNotification {
  id: string;
  title: string;
  body: string;
  category: "achievement" | "challenge" | "goal" | "learning" | "ai" | "system";
  timestamp: string;
  read: boolean;
}

export interface DbLearningArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  co2SavedValue?: number;
  readProgress: number; // 0 to 100
  bookmarked: boolean;
  completed: boolean;
  xpValue: number;
  dateGenerated: string;
}

export interface DbSettings {
  id: "global";
  theme: "light" | "dark" | "system";
  language: "en" | "hi" | "gu" | "es" | "fr" | "de" | "ar" | "zh";
  dailyReminder: boolean;
  challengeReminder: boolean;
  goalReminder: boolean;
  weeklyReportReminder: boolean;
  achievementAlerts: boolean;
}

export class EcoSphereDatabase extends Dexie {
  profile!: Table<UserProfile & { id: string }, string>;
  activities!: Table<Activity, string>;
  goals!: Table<Goal, string>;
  challenges!: Table<Challenge, string>;
  community!: Table<CommunityPost & { replies?: any[] }, string>;
  badges!: Table<Badge, string>;
  transactions!: Table<RewardTransaction, string>;
  chats!: Table<ChatMessage, string>;
  scans!: Table<DbScanLog, string>;
  notifications!: Table<DbNotification, string>;
  learningArticles!: Table<DbLearningArticle, string>;
  settings!: Table<DbSettings, string>;

  constructor() {
    super("EcoSphereDatabase");
    this.version(1).stores({
      profile: "id",
      activities: "id, category, date",
      goals: "id, category, completed",
      challenges: "id, category, completed, type",
      community: "id, category",
      badges: "id, unlocked",
      transactions: "id, type, date",
      chats: "id, timestamp",
      scans: "id, type, timestamp",
      notifications: "id, category, read",
      learningArticles: "id, category, bookmarked, completed",
      settings: "id"
    });
  }
}

export const db = new EcoSphereDatabase();
