import { db, DbNotification } from "../lib/db";
import { useStore } from "../lib/store";

export type NotificationType = "success" | "warning" | "achievement" | "information" | "system";

export class NotificationService {
  /**
   * Core execution method: Create a new notification and post to store & db
   */
  public static async createNotification(
    title: string,
    body: string,
    category: DbNotification["category"],
    type: NotificationType = "information"
  ): Promise<DbNotification> {
    const formattedTitle =
      type === "achievement"
        ? `🏆 ${title}`
        : type === "success"
          ? `✅ ${title}`
          : type === "warning"
            ? `⚠️ ${title}`
            : title;

    const notification: DbNotification = {
      id: "notify-" + Date.now() + Math.random().toString(36).substr(2, 4),
      title: formattedTitle,
      body,
      category,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      read: false
    };

    // 1. Write to Dexie Database
    await db.notifications.put(notification);

    // 2. Refresh Zustand Store (with a safe fallback if store is not initialized)
    try {
      const storeState = useStore.getState();
      if (storeState && typeof storeState.initStore === "function") {
        const notifications = [notification, ...(storeState.notifications || [])];
        useStore.setState({ notifications });
      }
    } catch (e) {
      console.warn("[NotificationService] Safe-write update warning. Store hydration pending.", e);
    }

    return notification;
  }

  /**
   * Delete an existing notification completely
   */
  public static async deleteNotification(id: string): Promise<void> {
    await db.notifications.delete(id);
    try {
      const current = useStore.getState().notifications || [];
      useStore.setState({ notifications: current.filter((n) => n.id !== id) });
    } catch {}
  }

  /**
   * Mark notification as read
   */
  public static async markRead(id: string): Promise<void> {
    try {
      const current = useStore.getState().notifications || [];
      const updated = current.map((n) => (n.id === id ? { ...n, read: true } : n));
      useStore.setState({ notifications: updated });
      const matched = updated.find((n) => n.id === id);
      if (matched) {
        await db.notifications.put(matched);
      }
    } catch {
      // Direct DB update
      const matched = await db.notifications.get(id);
      if (matched) {
        matched.read = true;
        await db.notifications.put(matched);
      }
    }
  }

  /**
   * Mark notification as unread
   */
  public static async markUnread(id: string): Promise<void> {
    try {
      const current = useStore.getState().notifications || [];
      const updated = current.map((n) => (n.id === id ? { ...n, read: false } : n));
      useStore.setState({ notifications: updated });
      const matched = updated.find((n) => n.id === id);
      if (matched) {
        await db.notifications.put(matched);
      }
    } catch {
      const matched = await db.notifications.get(id);
      if (matched) {
        matched.read = false;
        await db.notifications.put(matched);
      }
    }
  }

  /**
   * Clear all notification logs
   */
  public static async clearAll(): Promise<void> {
    await db.notifications.clear();
    try {
      useStore.setState({ notifications: [] });
    } catch {}
  }

  /**
   * Automatic triggers based on specific gameplay events
   */
  public static async notifyChallengeCompleted(
    title: string,
    xp: number,
    points: number
  ): Promise<void> {
    await this.createNotification(
      "Eco Challenge Completed!",
      `Great effort! You've successfully completed the challenge "${title}". Gained +${xp} XP and +${points} EcoPoints!`,
      "challenge",
      "success"
    );
  }

  public static async notifyXPClaimed(xp: number, badgeUnlocked?: string): Promise<void> {
    await this.createNotification(
      "XP Gained & Logged!",
      `Claimed your activity rewards. Added +${xp} XP to your climate level progress.${badgeUnlocked ? ` Unlocked new milestone: ${badgeUnlocked}!` : ""}`,
      "achievement",
      "achievement"
    );
  }

  public static async notifyGoalCompleted(title: string): Promise<void> {
    await this.createNotification(
      "Climate Goal Achieved!",
      `Outstanding! You reached 100% completion in your personal green goal: "${title}". Thank you for protecting our ecosystem!`,
      "goal",
      "success"
    );
  }

  public static async notifyGoalProgress(title: string, progressPercent: number): Promise<void> {
    if (progressPercent >= 100) return; // trigger completed instead
    await this.createNotification(
      "Goal Progress Updated",
      `Your goal "${title}" is now ${progressPercent.toFixed(0)}% complete. Keep going!`,
      "goal",
      "information"
    );
  }

  public static async notifyAchievementUnlocked(title: string, description: string): Promise<void> {
    await this.createNotification(
      "Achievement Milestone Unlocked!",
      `Congratulations! You unlocked the legendary badge [${title}] for: ${description}`,
      "achievement",
      "achievement"
    );
  }

  public static async notifyStreakIncreased(days: number): Promise<void> {
    await this.createNotification(
      "Activity Streak Multiplier!",
      `You have maintained a consecutive sustainable log streak for ${days} days! Keep the green flame burning! 🔥`,
      "system",
      "success"
    );
  }

  public static async notifyCarbonScoreImproved(scoreIncrease: number): Promise<void> {
    await this.createNotification(
      "Eco-Efficiency Rating Improved!",
      `Your localized Carbon Score just improved by +${scoreIncrease} points compared to the city baseline!`,
      "ai",
      "success"
    );
  }

  public static async notifyAIRecommendationGenerated(): Promise<void> {
    await this.createNotification(
      "Fresh AI Advisory Published",
      "Deep-learning climate coaching recommendations have been tailored and compiled in your profile advisory.",
      "ai",
      "information"
    );
  }

  public static async notifyLearningLessonCompleted(
    title: string,
    xpGained: number
  ): Promise<void> {
    await this.createNotification(
      "Lesson Completed!",
      `Environmental study unit "${title}" completed. Gained +${xpGained} XP toward your climate scholar badges!`,
      "learning",
      "success"
    );
  }

  public static async notifyScanCompleted(type: string, carbonImpact: number): Promise<void> {
    await this.createNotification(
      "Visual OCR Scan Compiled",
      `Image snapshot parsed: ${type.toUpperCase()} analyzed. Gained +150 EcoPoints. Calculated item carbon footprint: ${carbonImpact} kg CO2e.`,
      "system",
      "success"
    );
  }

  public static async notifyReportGenerated(): Promise<void> {
    await this.createNotification(
      "Weekly Footprint Invoice Ready",
      "A complete localized climate audit report has been formulated. Download options are enabled in your report dashboard.",
      "system",
      "system"
    );
  }

  public static async notifyCommunityMilestoneReached(likesCount: number): Promise<void> {
    await this.createNotification(
      "Community Reach Boosted",
      `Your published green action garnered over ${likesCount} supporting views or likes. The network is listening!`,
      "challenge",
      "achievement"
    );
  }

  public static async notifyWalletRewardReceived(
    title: string,
    pointsSpent: number
  ): Promise<void> {
    await this.createNotification(
      "Reward Voucher Transacted",
      `Successfully spent ${pointsSpent} EcoPoints for voucher: "${title}". Serial numbers has been sent to scan history catalog.`,
      "system",
      "achievement"
    );
  }
}
