import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Award, Flame, Trophy, Users, Heart, MessageSquare, Plus, Check, Star, Lock, Eye, Compass, Share2, Send, Sparkles, X
} from "lucide-react";
import { UserProfile, Challenge, CommunityPost, Badge, Activity } from "../types";
import { useStore } from "../lib/store";

interface ChallengesViewProps {
  profile: UserProfile;
  challenges: Challenge[];
  badges: Badge[];
  community: CommunityPost[];
  onCompleteChallenge: (challengeId: string) => void;
  onPostCommunity: (text: string) => void;
  onLikePost: (postId: string) => void;
  onAddComment: (postId: string, commentText: string) => void;
  onAddCustomActivity: (act: Activity) => void;
}

export default function ChallengesView({
  profile,
  challenges,
  badges,
  community,
  onCompleteChallenge,
  onPostCommunity,
  onLikePost,
  onAddComment,
  onAddCustomActivity
}: ChallengesViewProps) {
  // Navigation inside this tab: 'active' | 'leaderboard' | 'gamification' | 'community'
  const [subTab, setSubTab] = useState<'active' | 'leaderboard' | 'gamification' | 'community'>('active');
  const [challengeFilter, setChallengeFilter] = useState<'daily' | 'weekly' | 'special'>('daily');
  const [leaderboardFilter, setLeaderboardFilter] = useState<'global' | 'friends' | 'local'>('global');

  // Input for adding community posts
  const [newPostText, setNewPostText] = useState("");
  
  // Comments management
  const [commentInput, setCommentInput] = useState<{ [key: string]: string }>({});

  // Archive and pre-register states
  const [showArchives, setShowArchives] = useState(false);
  const [preRegisteredJuly, setPreRegisteredJuly] = useState(() => localStorage.getItem("ecosphere_prereg_july") === "true");

  // Achievement Sharing dialog states
  const [sharingBadge, setSharingBadge] = useState<Badge | null>(null);
  const [ecoMotto, setEcoMotto] = useState("Small acts multiplied by millions can transform the world.");
  const [shareSuccess, setShareSuccess] = useState("");

  // Additional advanced operations direct from store
  const store = useStore();
  const pImage = profile.profileImage;
  const pName = profile.name;
  const pLevel = profile.level;
  const pRank = profile.levelRank;

  // Read streak, totalXP, and ecoPoints reactively from the central Zustand user store for consistency
  const currentStreak = useStore((state) => state.user?.currentStreak) ?? useStore.getState().user?.currentStreak ?? profile.currentStreak ?? profile.streak ?? 0;
  const totalXP = useStore((state) => state.user?.totalXP) ?? useStore.getState().user?.totalXP ?? profile.totalXP ?? profile.xp ?? 0;
  const userEcoPoints = useStore((state) => state.user?.ecoPoints) ?? useStore.getState().user?.ecoPoints ?? profile.ecoPoints ?? 0;

  // Local state for interactive features
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all"); // 'all' | 'transport' | 'food' | 'energy' | 'shopping' | 'waste' | 'saved'
  const [postType, setPostType] = useState<'text' | 'image' | 'achievement' | 'milestone'>('text');
  const [postCategory, setPostCategory] = useState("General");
  
  const [imagePayload, setImagePayload] = useState<string | null>(null);
  const [isCompactingImage, setIsCompactingImage] = useState(false);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  
  // Reply input states
  const [nestedReplyTarget, setNestedReplyTarget] = useState<{ postId: string; commentId: string } | null>(null);
  const [nestedReplyText, setNestedReplyText] = useState("");

  // Editing post states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  // Image selected converter and compressor canvas
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompactingImage(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 320;
        let w = img.width;
        let h = img.height;
        if (w > h && w > maxDim) {
          h = (h * maxDim) / w;
          w = maxDim;
        } else if (h > w && h > maxDim) {
          w = (w * maxDim) / h;
          h = maxDim;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, w, h);
        const compressedString = canvas.toDataURL("image/jpeg", 0.75);
        setImagePayload(compressedString);
        setIsCompactingImage(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleCommunityPostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim() && !imagePayload) return;
    
    // Invoke dynamic post creator with advanced types
    store.addCommunityPost(
      newPostText,
      postCategory,
      imagePayload || undefined,
      postType
    );

    setNewPostText("");
    setImagePayload(null);
    setPostType('text');
  };

  const handleTriggerShare = (postId: string) => {
    alert("Shareable story link generated! Copied to clip path.");
  };

  // Filter & Search matching rules
  const filteredPosts = community.filter(post => {
    // General reported hide rule
    if (post.reported) return false;

    const textMatch = 
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!textMatch) return false;

    if (selectedFilter === "all") return true;
    if (selectedFilter === "saved") return post.saved === true;
    return post.category.toLowerCase() === selectedFilter;
  });

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;
    onPostCommunity(newPostText);
    setNewPostText("");
  };

  const handleCommentSubmit = (postId: string) => {
    const text = commentInput[postId];
    if (!text || !text.trim()) return;
    onAddComment(postId, text);
    setCommentInput({ ...commentInput, [postId]: "" });
  };

  // Dynamic Leaderboards user generation with real-time recalculations based on your real XP
  const allOtherUsers = [
    { name: "Nora R 18", xp: 2450, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100", type: "global", isMe: false },
    { name: "Mr. Jaw", xp: 2300, avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100", type: "global-local", isMe: false },
    { name: "Felix 84", xp: 2100, avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100", type: "global-friends", isMe: false },
    { name: "Mike the Vike", xp: 1100, avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100", type: "global-friends-local", isMe: false },
    { name: "Aanya Sharma", xp: 950, avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100", type: "friends", isMe: false },
    { name: "Rohan Patel", xp: 600, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100", type: "local", isMe: false }
  ];

  const getLeaderboardList = () => {
    const me = {
      name: `${profile.name} (You)`,
      xp: totalXP,
      avatar: profile.profileImage || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100",
      isMe: true,
      type: "all"
    };

    let filtered = [...allOtherUsers];
    if (leaderboardFilter === "friends") {
      filtered = allOtherUsers.filter(u => u.type.includes("friends"));
    } else if (leaderboardFilter === "local") {
      filtered = allOtherUsers.filter(u => u.type.includes("local"));
    }

    // Combine & Sort descending by XP
    const combined = [...filtered, me].sort((a, b) => b.xp - a.xp);

    // Map ranks based on ordered list
    return combined.map((user, index) => ({
      rank: index + 1,
      name: user.name,
      xp: `${user.xp.toLocaleString()} XP`,
      isMe: !!user.isMe,
      avatar: user.avatar
    }));
  };

  const leaderboardUsers = getLeaderboardList();

  return (
    <div className="w-full pb-24">
      {/* Sub tabs navigation */}
      <div className="flex border-b border-slate-100 bg-white rounded-2xl p-1 shadow-sm mb-6 sticky top-0 z-20">
        {[
          { id: "active", label: "Challenges", icon: Trophy },
          { id: "gamification", label: "Levels & Badges", icon: Award },
          { id: "leaderboard", label: "Leaderboard", icon: Star },
          { id: "community", label: "Community", icon: Users }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id as any)}
              className={`flex-grow py-3 px-2 rounded-xl text-[11px] md:text-xs font-bold transition-all flex flex-col items-center gap-1.5 ${
                subTab === tab.id ? 'bg-brand-600 text-white shadow-md shadow-emerald-600/15' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4.5 h-4.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* SUBTAB 1: Active challenges */}
        {subTab === "active" && (
          <motion.div
            key="tab-active"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* ACTIVE SEASON CAMPAIGN DYNAMIC DASHBOARD */}
            <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-emerald-950 rounded-3xl p-6 text-white shadow-lg space-y-5 relative overflow-hidden border border-indigo-700/30" id="seasonal-campaign-dashboard">
              {/* Abs decoration light circles */}
              <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

              <div className="flex justify-between items-start">
                <div>
                  <span className="bg-emerald-500/25 text-emerald-300 text-[9px] uppercase tracking-widest font-black px-2.5 py-1 rounded-md border border-emerald-500/30">
                    Active Campaign Season
                  </span>
                  <h3 className="text-xl font-black mt-2 font-display">June Sustainability Marathon</h3>
                  <p className="text-[11px] text-slate-300 font-medium leading-normal mt-1">
                    Timeline: June 1st - June 30th, 2026. Focus: domestic waste reduction, climate HVAC settings, and organic regional foods.
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-bold text-slate-400">Streak: {currentStreak} Days</span>
                </div>
              </div>

              {/* Progress Bar Gauge */}
              {(() => {
                const JUNE_SEASONAL_CHALLENGES = [
                  { id: "sc-june-1", title: "Zero Single-Use Plastics Marathon", description: "Use only 100% biodegradable packaging containers and refuse any plastic flatware today.", xpReward: 180, pointsReward: 400, category: "waste", difficulty: "Medium" },
                  { id: "sc-june-2", title: "Power Down HVAC Standby Load", description: "Set household temperature controls to 25°C and disable redundant idle wall-power drains.", xpReward: 150, pointsReward: 350, category: "energy", difficulty: "Easy" },
                  { id: "sc-june-3", title: "Local Organic Harvest Feast", description: "Prepare a breakfast or dinner consisting solely of local community farm-grown produce.", xpReward: 220, pointsReward: 500, category: "food", difficulty: "Hard" }
                ];

                const completedSeasonalIds = (() => {
                  try {
                    const saved = localStorage.getItem("ecosphere_seasonal_completed_v4");
                    return saved ? JSON.parse(saved) : [];
                  } catch { return []; }
                })();

                const setCompletedSeasonalIds = (ids: string[]) => {
                  localStorage.setItem("ecosphere_seasonal_completed_v4", JSON.stringify(ids));
                  window.dispatchEvent(new Event("storage"));
                };

                const claimedMilestones = (() => {
                  try {
                    const saved = localStorage.getItem("ecosphere_seasonal_milestones_claimed_v4");
                    return saved ? JSON.parse(saved) : {};
                  } catch { return {}; }
                })();

                const setClaimedMilestones = (items: any) => {
                  localStorage.setItem("ecosphere_seasonal_milestones_claimed_v4", JSON.stringify(items));
                  window.dispatchEvent(new Event("storage"));
                };

                const completedCount = JUNE_SEASONAL_CHALLENGES.filter(sc => completedSeasonalIds.includes(sc.id)).length;
                const progressPct = Math.round((completedCount / JUNE_SEASONAL_CHALLENGES.length) * 100);

                const handleCompleteSeasonal = async (ch: any) => {
                  if (completedSeasonalIds.includes(ch.id)) return;
                  const nextComps = [...completedSeasonalIds, ch.id];
                  setCompletedSeasonalIds(nextComps);

                  await store.addRewardTransaction(`Seasonal Challenge: ${ch.title}`, ch.pointsReward, ch.xpReward, "challenge");
                  await store.addNotification(
                    "Seasonal Quest Cleared!",
                    `Successfully resolved "${ch.title}" campaign quest! Unlocked +${ch.pointsReward} Points & +${ch.xpReward} XP. Daily streak expanded!`,
                    "challenge"
                  );
                  // Refresh component render triggering local hooks
                  setSubTab("gamification");
                  setTimeout(() => setSubTab("active"), 20);
                };

                const handleClaimMilestone = async (mKey: string, pts: number, isBadge?: boolean) => {
                  if (claimedMilestones[mKey]) return;
                  const nextMilestones = { ...claimedMilestones, [mKey]: true };
                  setClaimedMilestones(nextMilestones);

                  await store.addRewardTransaction(`Campaign Milestone: ${mKey}`, pts, isBadge ? 300 : 0, "challenge");
                  await store.addNotification(
                    "Season Milestone Achieved!",
                    `Splendid! Claimed Standard +${pts} Points for "${mKey}" milestones!`,
                    "challenge"
                  );

                  if (isBadge) {
                    await store.addNotification(
                      "EXCLUSIVE REWARD UNLOCKED!",
                      "CONGRATULATIONS: You have been awarded the elite 'June Biosphere Guardian' Badge & Trophy!",
                      "achievement"
                    );
                  }
                  // Force state refresh
                  setSubTab("gamification");
                  setTimeout(() => setSubTab("active"), 20);
                };

                return (
                  <div className="space-y-4">
                    <div className="bg-white/10 rounded-2xl p-4 border border-white/5">
                      <div className="flex justify-between items-center text-xs font-bold font-mono">
                        <span>Campaign Progress</span>
                        <span>{completedCount} / {JUNE_SEASONAL_CHALLENGES.length} Completed ({progressPct}%)</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2.5 mt-2 overflow-hidden">
                        <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
                      </div>
                    </div>

                    {/* Challenges List */}
                    <div className="space-y-2.5">
                      <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-[#a7f3d0]">
                        Seasonal Campaign Quests
                      </h4>
                      {JUNE_SEASONAL_CHALLENGES.map(sc => {
                        const isDone = completedSeasonalIds.includes(sc.id);
                        return (
                          <div key={sc.id} className="p-3.5 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`text-[8px] font-mono leading-none tracking-wider font-extrabold px-1.5 py-0.5 rounded ${
                                  sc.difficulty === "Easy" ? "bg-emerald-400/20 text-emerald-300" :
                                  sc.difficulty === "Medium" ? "bg-brand-400/20 text-brand-300" : "bg-red-400/20 text-red-300"
                                }`}>
                                  {sc.difficulty}
                                </span>
                                <span className="text-[9px] text-slate-400 font-bold uppercase">{sc.category}</span>
                              </div>
                              <p className="text-xs font-bold text-white mt-1">{sc.title}</p>
                              <p className="text-[10px] text-slate-300 mt-0.5">{sc.description}</p>
                              <span className="text-[9px] font-mono font-extrabold text-emerald-300 mt-2 block animate-pulse">
                                +{sc.pointsReward} Points | +{sc.xpReward} XP
                              </span>
                            </div>

                            <button
                              onClick={() => handleCompleteSeasonal(sc)}
                              disabled={isDone}
                              className={`px-3 py-2 rounded-xl text-[10px] font-bold shrink-0 transition-all ${
                                isDone 
                                  ? "bg-emerald-500/25 text-emerald-400 border border-emerald-500/40" 
                                  : "bg-emerald-400 hover:bg-emerald-300 text-slate-950 cursor-pointer"
                              }`}
                            >
                              {isDone ? "Completed" : "Complete"}
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Milestones Claims Panel */}
                    <div className="bg-slate-900/40 p-4 border border-white/5 rounded-2xl space-y-3">
                      <h5 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                        Seasonal Milestones & Badge Unlocks
                      </h5>
                      <div className="grid grid-cols-3 gap-2.5">
                        {[
                          { key: "1 Quest Complete", req: 1, rewardStr: "+100 Pts", pts: 100 },
                          { key: "2 Quests Complete", req: 2, rewardStr: "+150 Pts", pts: 150 },
                          { key: "All 3 Complete", req: 3, rewardStr: "june_badge_title", pts: 500, isBadge: true }
                        ].map((m) => {
                          const isClaimable = completedCount >= m.req;
                          const isClaimed = claimedMilestones[m.key];
                          return (
                            <button
                              key={m.key}
                              disabled={!isClaimable || isClaimed}
                              onClick={() => handleClaimMilestone(m.key, m.pts, m.isBadge)}
                              className={`p-2 rounded-xl text-center flex flex-col justify-between min-h-[68px] border transition-all ${
                                isClaimed 
                                  ? "bg-slate-800/50 border-slate-700 text-slate-500 cursor-not-allowed" 
                                  : isClaimable 
                                    ? "bg-emerald-500/10 border-emerald-500 hover:bg-emerald-500/20 text-emerald-300 cursor-pointer" 
                                    : "bg-slate-900/40 border-white/5 text-slate-400 cursor-not-allowed opacity-55"
                              }`}
                            >
                              <p className="text-[8px] font-extrabold uppercase tracking-wide leading-tight">{m.key}</p>
                              <p className="text-[10px] font-bold mt-1">
                                {m.isBadge ? (isClaimed ? "👑 Claimed" : "👑 June Badge") : m.rewardStr}
                              </p>
                              <span className="text-[8px] font-mono leading-none font-semibold block mt-1">
                                {isClaimed ? "Unlocked" : isClaimable ? "Claim Now!" : "Locked"}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Browse Past Campaigns Accordion */}
              <div className="border-t border-white/10 pt-4" id="view-seasonal-campaigns-timeline">
                <button
                  onClick={() => setShowArchives(!showArchives)}
                  className="w-full text-left py-2 flex items-center justify-between text-xs font-bold font-mono text-emerald-300 hover:text-emerald-200 transition-colors"
                >
                  <span>📜 View Seasonal Archives & Timelines</span>
                  <span>{showArchives ? "Hide Archives [▲]" : "Show Archives [▼]"}</span>
                </button>

                <AnimatePresence>
                  {showArchives && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 space-y-3 overflow-hidden text-left"
                    >
                      {[
                        { id: "s-march", title: "Spring Biosphere Kickoff", period: "March 2026", xp: "420 XP", badge: "Spring Scout", status: "Completed", color: "border-slate-800 bg-[#a7f3d0]/10" },
                        { id: "s-april", title: "Earth Day Action Month", period: "April 2026", xp: "500 XP", badge: "Eco Warrior Badge", status: "Completed", color: "border-slate-800 bg-[#a7f3d0]/10" },
                        { id: "s-july", title: "July Green Mobility Challenge", period: "July 2026", xp: "Upcoming", badge: "Mobility Champion Badge", status: "Preregister Selection", color: "border-slate-800 bg-[#a5b4fc]/5" }
                      ].map((h) => (
                        <div key={h.id} className={`p-3 rounded-2xl border text-xs flex justify-between items-center ${h.color}`}>
                          <div>
                            <p className="font-bold text-white">{h.title} ({h.period})</p>
                            <p className="text-[10px] text-slate-300 mt-1">Reward earned: {h.xp} | Badge unlocked: {h.badge}</p>
                          </div>
                          {h.id === "s-july" ? (
                            <button
                              onClick={async () => {
                                if (preRegisteredJuly) return;
                                setPreRegisteredJuly(true);
                                localStorage.setItem("ecosphere_prereg_july", "true");
                                await store.addNotification(
                                  "Pre-registered Unlocked",
                                  "Successfully opted in for July Green Mobility Challenge. Dynamic campaign starts in 20 days!",
                                  "system"
                                );
                              }}
                              disabled={preRegisteredJuly}
                              className={`px-2.5 py-1.5 rounded-lg text-[9px] font-bold font-mono ${
                                preRegisteredJuly 
                                  ? "bg-indigo-300/20 text-indigo-300 border border-indigo-400/30" 
                                  : "bg-indigo-500 hover:bg-slate-200 text-white cursor-pointer"
                              }`}
                            >
                              {preRegisteredJuly ? "✔ Registered" : "Pre-register"}
                            </button>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-400 font-mono">✔ {h.status}</span>
                          )}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Daily, Weekly, Special Filter Buttons (S7) */}
            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl" id="filter-challenges">
              {[
                { id: "daily", label: "Daily" },
                { id: "weekly", label: "Weekly" },
                { id: "special", label: "Special" }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setChallengeFilter(opt.id as any)}
                  className={`flex-grow py-3 rounded-lg font-bold text-xs transition-all ${
                    challengeFilter === opt.id ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* List of filtered challenges */}
            <div className="space-y-3" id="challenges-list">
              {challenges.filter(c => c.type === challengeFilter).map((item) => (
                <div key={item.id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        item.difficulty === 'Easy' ? 'bg-blue-50 text-blue-700' :
                        item.difficulty === 'Medium' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {item.difficulty}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">{item.category}</span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-800 mt-1.5">{item.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{item.description}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-[10px] font-bold text-emerald-600">+{item.xpReward} XP</span>
                      <span className="text-[10px] font-bold text-amber-600">+{item.pointsReward} Points</span>
                    </div>
                  </div>

                  <div>
                    {!item.completed ? (
                      <button
                        onClick={() => {
                          onCompleteChallenge(item.id);
                          onAddCustomActivity({
                            id: "challenge-act-" + Date.now(),
                            title: `Challenge Success: ${item.title}`,
                            category: item.category,
                            co2Value: -2.0, // standard offset value for success
                            date: "2026-06-09",
                            pointsEarned: item.pointsReward
                          });
                        }}
                        className="bg-brand-50 hover:bg-brand-100 active:scale-95 text-brand-700 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1 shrink-0 select-none"
                      >
                        Complete
                      </button>
                    ) : (
                      <div className="bg-emerald-50 border border-emerald-100 p-1.5 rounded-full text-emerald-600">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* SUBTAB 2: Gamification (S8 Level stats / Achievements list) */}
        {subTab === "gamification" && (
          <motion.div
            key="tab-gamification"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Level & XP Overview */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex gap-4 items-center">
                <div className="w-14 h-14 bg-brand-100 rounded-2xl flex items-center justify-center text-3xl shadow-inner shadow-brand-500/10">
                  🌱
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
                    Level {profile.level}
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {profile.levelRank}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400 font-medium mt-1">XP Progress to next milestone</p>
                </div>
              </div>

              {/* Achievements XP Bar Progress */}
              <div className="flex-grow max-w-sm">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1.5">
                  <span>{totalXP.toLocaleString()} XP</span>
                  <span className="text-slate-400">{(profile.xpNeeded ?? 500).toLocaleString()} XP</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-500 rounded-full" style={{ width: `${Math.min(100, Math.max(0, (totalXP / (profile.xpNeeded || 500)) * 100))}%` }} />
                </div>
              </div>
            </div>

            {/* Streak & Global Rank indicators */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col justify-between">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Streak</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-3xl">🔥</span>
                  <span className="text-2xl font-black text-slate-800 leading-none">{currentStreak}</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-2">Days active in a row</p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col justify-between">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Global Profile Rank</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-3xl">📊</span>
                  <span className="text-2xl font-black text-slate-800 leading-none">
                    Rank #{getLeaderboardList().find(u => u.isMe)?.rank || 1}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-2">Active climate warriors</p>
              </div>
            </div>

            {/* S16 Achievements Collection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Achievements Collection</h3>
                <span className="text-xs text-brand-600 font-bold select-none">{badges.filter(b => b.unlocked).length} of {badges.length} Unlocked</span>
              </div>

              <div className="grid grid-cols-2 gap-3" id="achievements-grid">
                {badges.map((badge) => (
                  <div 
                    key={badge.id}
                    className={`bg-white rounded-2xl border p-4 shadow-sm flex flex-col justify-between transition-all relative ${
                      badge.unlocked ? 'border-brand-100' : 'border-slate-100 opacity-60'
                    }`}
                  >
                    {!badge.unlocked && (
                      <div className="absolute top-3 right-3 text-slate-300">
                        <Lock className="w-4 h-4" />
                      </div>
                    )}
                    <div>
                      <span className="text-3xl">{badge.icon}</span>
                      <h4 className="font-bold text-slate-800 text-sm mt-3">{badge.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-1 leading-snug">{badge.description}</p>
                    </div>
                    <div className="border-t border-slate-50 mt-3 pt-3 flex items-center justify-between gap-2 flex-wrap">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Requirement</p>
                        <p className="text-[10px] font-semibold text-slate-600 mt-0.5">{badge.requirement}</p>
                      </div>
                      {badge.unlocked && (
                        <button
                          onClick={() => {
                            setSharingBadge(badge);
                            setShareSuccess("");
                          }}
                          className="px-2.5 py-1.5 bg-indigo-50 hover:bg-slate-200 text-indigo-700 font-extrabold rounded-lg text-[9px] font-mono leading-none border border-indigo-100 select-none cursor-pointer flex items-center gap-1.5"
                        >
                          <Share2 className="w-3 h-3" /> Share
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* SUBTAB 3: Leaderboard (S10 rankings list) */}
        {subTab === "leaderboard" && (
          <motion.div
            key="tab-leaderboard"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-4"
          >
            {/* Global, Friends, Local Subtabs */}
            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl" id="filter-leaderboard">
              {[
                { id: "global", label: "Global" },
                { id: "friends", label: "Friends" },
                { id: "local", label: "Local" }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setLeaderboardFilter(opt.id as any)}
                  className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${
                    leaderboardFilter === opt.id ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Ranks list */}
            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
              {leaderboardUsers.map((user) => (
                <div 
                  key={user.rank}
                  className={`flex items-center justify-between p-4 border-b border-slate-100 last:border-0 ${
                    user.isMe ? 'bg-brand-50/50 font-bold' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 text-center font-bold text-xs ${
                      user.rank === 1 ? 'text-amber-500 text-lg' :
                      user.rank === 2 ? 'text-slate-400' :
                      user.rank === 3 ? 'text-amber-700' : 'text-slate-400'
                    }`}>
                      {user.rank === 1 ? "🥇" : user.rank === 2 ? "🥈" : user.rank === 3 ? "🥉" : user.rank}
                    </span>
                    <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover border border-slate-100" />
                    <span className="text-xs font-semibold text-slate-800">{user.name}</span>
                  </div>
                  <span className="text-xs font-bold text-brand-600 font-mono">{user.xp}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* SUBTAB 4: Community feed (S17 user blogs) */}
        {subTab === "community" && (
            <div className="space-y-6" id="community-tab-shell">
              {/* Filter controls & Search Header */}
              <div className="bg-white border border-slate-100 p-4 rounded-3xl shadow-sm space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search eco stories, users, milestones..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-brand-500"
                  />
                  <div className="absolute left-3 top-3.5 text-slate-400">
                    <Eye className="w-4 h-4 cursor-default" />
                  </div>
                </div>

                {/* Sub category filter tabs scroll */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none" id="community-category-scroller">
                  {[
                    { id: "all", label: "All Stories" },
                    { id: "transport", label: "Commute" },
                    { id: "food", label: "Food Diet" },
                    { id: "energy", label: "Energy" },
                    { id: "shopping", label: "Shopping" },
                    { id: "waste", label: "Waste" },
                    { id: "saved", label: "Bookmarks 🔖" }
                  ].map((filterItem) => (
                    <button
                      key={filterItem.id}
                      onClick={() => setSelectedFilter(filterItem.id)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase shrink-0 transition-all ${
                        selectedFilter === filterItem.id 
                          ? 'bg-brand-50 text-brand-700 border border-brand-100' 
                          : 'bg-slate-50 text-slate-400 border border-transparent hover:text-slate-600'
                      }`}
                    >
                      {filterItem.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Create community story */}
              <form onSubmit={handleCommunityPostSubmit} className="bg-white border border-slate-100 p-4 rounded-3xl shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-widest flex-grow">
                    Publish Eco Story
                  </span>
                  
                  {/* Select Post Type Button Set */}
                  <div className="flex gap-1">
                    {(['text', 'image', 'achievement', 'milestone'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setPostType(t)}
                        className={`px-2 py-0.5 rounded text-[9px] font-bold capitalize transition-all ${
                          postType === t ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form Input elements */}
                <textarea
                  placeholder={
                    postType === 'achievement' ? "Showcase your sustainable level milestones or carbon breakthroughs..." :
                    postType === 'milestone' ? "Describe your carbon savings breakthrough for today..." :
                    "What sustainable action did you take today? Describe the carbon saved..."
                  }
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-slate-800 font-medium focus:outline-none focus:border-brand-500 text-xs min-h-[75px] resize-none"
                />

                {/* Optional Image attachment preview container */}
                {imagePayload && (
                  <div className="mt-2.5 relative border border-slate-100 rounded-xl overflow-hidden max-h-[140px] w-full">
                    <img src={imagePayload} alt="Post preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImagePayload(null)}
                      className="absolute top-2 right-2 bg-slate-900/70 hover:bg-slate-950 text-white p-1 rounded-full text-xs font-bold leading-none select-none"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* Lower Action Row inputs */}
                <div className="flex items-center justify-between mt-3.5 pt-3.5 border-t border-slate-50">
                  <div className="flex items-center gap-2.5">
                    {/* Native File Selector with camera toggle */}
                    <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 leading-none select-none">
                      <Compass className="w-4 h-4" />
                      <span>{isCompactingImage ? "Processing..." : "Add Picture"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileSelected}
                        disabled={isCompactingImage}
                      />
                    </label>

                    {/* Category selectors */}
                    <select
                      value={postCategory}
                      onChange={(e) => setPostCategory(e.target.value)}
                      className="bg-slate-50 border border-slate-100 rounded-lg py-1 px-2 text-[10px] font-bold text-slate-600 focus:outline-none"
                    >
                      <option value="General">General</option>
                      <option value="Transport">Transport</option>
                      <option value="Food">Food</option>
                      <option value="Energy">Energy</option>
                      <option value="Shopping">Shopping</option>
                      <option value="Waste">Waste</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1 shadow shadow-emerald-400/15"
                  >
                    <Plus className="w-4 h-4" /> Publish
                  </button>
                </div>
              </form>

              {/* Feed Display list */}
              <div className="space-y-4" id="community-feed">
                {filteredPosts.length === 0 ? (
                  <div className="bg-white border border-slate-100 p-8 rounded-3xl text-center text-slate-400">
                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-2 animate-bounce" />
                    <p className="text-xs font-semibold">No active community stories match.</p>
                    <p className="text-[10px] text-slate-400 mt-1">Be the first to publish your daily milestone story!</p>
                  </div>
                ) : (
                  filteredPosts.map((post) => {
                    // Pull User identities dynamically from store if post is created locally
                    const isUserPost = post.authorId === "user" || (post as any).isMe === true;
                    
                    const dynamicAuthorName = isUserPost ? pName : post.author;
                    const dynamicAvatar = isUserPost ? (pImage || post.avatar) : post.avatar;
                    const dynamicLevel = isUserPost ? pLevel : (post.authorLevel || 1);
                    const dynamicRank = isUserPost ? pRank : (post.authorRank || "Novice");
                    const dynamicBadge = isUserPost ? (currentStreak >= 5 ? "👑 Master" : "🌱 Active") : "🌿 Allied";

                    const isExpanded = expandedPostId === post.id;

                    return (
                      <div key={post.id} className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-4 relative overflow-hidden transition-all">
                        {/* Highlight Badge tags if custom types */}
                        {post.postType && post.postType !== 'text' && (
                          <div className="absolute top-0 right-0 bg-brand-50 text-brand-700 font-extrabold uppercase text-[7px] tracking-widest px-2.5 py-1 rounded-bl-xl border-l border-b border-brand-100">
                            ★ {post.postType}
                          </div>
                        )}

                        {/* Author Meta Details header card */}
                        <div className="flex items-center gap-3">
                          <img 
                            src={dynamicAvatar} 
                            alt={dynamicAuthorName} 
                            className="w-10 h-10 rounded-full object-cover border-2 border-slate-50 shrink-0" 
                          />
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="font-extrabold text-xs text-slate-800">{dynamicAuthorName}</h4>
                              <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded leading-none">
                                Lvl {dynamicLevel} • {dynamicRank}
                              </span>
                              <span className="text-[8px] font-bold text-emerald-600 border border-emerald-100 bg-emerald-50 px-1.5 py-0.5 rounded-full leading-none">
                                {dynamicBadge}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[9px] text-slate-400 font-medium">{post.timeString}</span>
                              <span className="w-1 h-1 rounded-full bg-slate-300" />
                              <span className="text-[9px] font-extrabold text-brand-600 uppercase tracking-wider">{post.category}</span>
                              {post.isEdited && (
                                <span className="text-[8px] text-slate-400 italic">(edited)</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Content Block */}
                        {editingId === post.id ? (
                          <div className="space-y-2">
                            <textarea
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs text-slate-800 font-medium leading-normal"
                            />
                            <div className="flex justify-end gap-1.5">
                              <button 
                                type="button" 
                                onClick={() => setEditingId(null)}
                                className="px-2.5 py-1 bg-slate-100 font-bold text-slate-500 rounded text-[10px]"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  store.editCommunityPost(post.id, editingText);
                                  setEditingId(null);
                                }}
                                className="px-2.5 py-1 bg-brand-600 font-bold text-white rounded text-[10px]"
                              >
                                Save Changes
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-600 leading-relaxed font-normal">{post.content}</p>
                        )}

                        {/* Post image graphics */}
                        {post.image && (
                          <div className="w-full max-h-[180px] rounded-2xl overflow-hidden border border-slate-50">
                            <img src={post.image} alt="Eco media" className="w-full h-full object-cover" />
                          </div>
                        )}

                        {/* Lower interactive engagement tools */}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                          <div className="flex items-center gap-4">
                            {/* Like block */}
                            <button 
                              onClick={() => store.likeCommunityPost(post.id)}
                              className={`flex items-center gap-1 text-xs font-bold transition-all ${
                                post.liked ? 'text-red-500 hover:text-red-600' : 'text-slate-400 hover:text-slate-600'
                              }`}
                            >
                              <Heart className={`w-4 h-4 ${post.liked ? 'fill-red-500' : ''}`} />
                              <span>{post.likes}</span>
                            </button>

                            {/* Comment toggler */}
                            <button
                              onClick={() => setExpandedPostId(isExpanded ? null : post.id)}
                              className={`flex items-center gap-1 text-xs font-bold transition-all ${
                                isExpanded ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'
                              }`}
                            >
                              <MessageSquare className="w-4 h-4" />
                              <span>{post.commentsCount}</span>
                            </button>

                            {/* Share link generate */}
                            <button
                              onClick={() => handleTriggerShare(post.id)}
                              className="text-slate-400 hover:text-slate-600 transition-all text-xs font-bold flex items-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Share</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Save bookmark action */}
                            <button
                              onClick={() => store.saveCommunityPost(post.id)}
                              className={`p-1 rounded-lg transition-all ${
                                post.saved ? 'text-amber-500 hover:text-amber-600 bg-amber-50' : 'text-slate-400 hover:text-slate-600'
                              }`}
                              title={post.saved ? "Unsave Post" : "Bookmark Post"}
                            >
                              <Star className="w-4 h-4" />
                            </button>

                            {/* Edit options for self posts */}
                            {isUserPost && (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingId(post.id);
                                    setEditingText(post.content);
                                  }}
                                  className="p-1 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"
                                  title="Edit Post"
                                >
                                  <Lock className="w-4 h-4 shrink-0" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm("Are you sure you want to delete this story?")) {
                                      store.deleteCommunityPost(post.id);
                                    }
                                  }}
                                  className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                  title="Delete Post"
                                >
                                  <Check className="w-4 h-4 shrink-0" />
                                </button>
                              </>
                            )}

                            {/* Report option for others posts */}
                            {!isUserPost && (
                              <button
                                onClick={() => {
                                  if (confirm("Report this post for inappropriate/irrelevant content? This hides the post immediately.")) {
                                    store.reportCommunityPost(post.id);
                                    alert("Post has been reported and hidden from your feed.");
                                  }
                                }}
                                className="p-1 text-slate-300 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                                title="Report Post"
                              >
                                <Lock className="w-4 h-4 shrink-0" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Expandable Comment Feed Module */}
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-slate-50 space-y-3.5 transition-all" id={`comments-${post.id}`}>
                            <h5 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Comments list</h5>
                            
                            {/* Inner Comment Feed lists */}
                            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                              {(!post.commentsList || post.commentsList.length === 0) ? (
                                <p className="text-[10px] text-slate-400 italic text-center py-2">No comments published yet. Be the first to express organic thoughts!</p>
                              ) : (
                                post.commentsList.map((comm) => {
                                  const cUser = comm.authorId === "user";
                                  const cName = cUser ? pName : comm.author;
                                  const cAvatar = cUser ? (pImage || comm.avatar) : comm.avatar;

                                  return (
                                    <div key={comm.id} className="space-y-2">
                                      <div className="bg-slate-50/70 p-3 rounded-2xl space-y-1">
                                        <div className="flex items-center gap-2">
                                          <img src={cAvatar} alt={cName} className="w-6 h-6 rounded-full object-cover border" />
                                          <div className="flex-grow flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-slate-800">{cName}</span>
                                            <span className="text-[8px] text-slate-400">{comm.timeString}</span>
                                          </div>
                                        </div>
                                        <p className="text-[11px] text-slate-600 pl-8 leading-snug">{comm.content}</p>
                                        
                                        {/* Inline toggler for reply comment */}
                                        <div className="pl-8 pt-1">
                                          <button
                                            onClick={() => setNestedReplyTarget(
                                              nestedReplyTarget?.commentId === comm.id 
                                                ? null 
                                                : { postId: post.id, commentId: comm.id }
                                            )}
                                            className="text-[9px] font-extrabold text-brand-600 hover:underline leading-none flex items-center gap-0.5 select-none"
                                          >
                                            Reply Thread
                                          </button>
                                        </div>
                                      </div>

                                      {/* Nested Reply thread layout listings */}
                                      {comm.replies && comm.replies.length > 0 && (
                                        <div className="my-1.5 pl-6 space-y-2">
                                          {comm.replies.map((rep) => {
                                            const rUser = rep.authorId === "user";
                                            const rName = rUser ? pName : rep.author;
                                            const rAvatar = rUser ? (pImage || rep.avatar) : rep.avatar;

                                            return (
                                              <div key={rep.id} className="bg-emerald-50/30 p-2.5 rounded-xl border border-emerald-100 flex gap-2">
                                                <img src={rAvatar} alt={rName} className="w-5 h-5 rounded-full object-cover shrink-0" />
                                                <div className="flex-1">
                                                  <div className="flex items-center justify-between gap-2">
                                                    <span className="text-[9px] font-bold text-slate-800">{rName} <span className="text-[8px] font-medium text-slate-400 bg-white border border-slate-100 px-1 py-0.2 rounded-full">Replied</span></span>
                                                    <span className="text-[8px] text-slate-400">{rep.timeString}</span>
                                                  </div>
                                                  <p className="text-[10px] text-slate-600 mt-1 leading-snug">{rep.content}</p>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}

                                      {/* Expanded Inline reply input text */}
                                      {nestedReplyTarget?.commentId === comm.id && (
                                        <div className="ml-6 flex items-center gap-2 pt-1 border-l pl-2 border-emerald-200">
                                          <input
                                            type="text"
                                            placeholder={`Reply to ${cName}...`}
                                            value={nestedReplyText}
                                            onChange={(e) => setNestedReplyText(e.target.value)}
                                            className="flex-grow bg-slate-50 border rounded-lg py-1 px-2.5 text-[10px] text-slate-800 outline-none focus:border-brand-500"
                                            onKeyDown={(e) => {
                                              if (e.key === "Enter" && nestedReplyText.trim()) {
                                                store.replyCommentCommunityPost(post.id, comm.id, nestedReplyText);
                                                setNestedReplyText("");
                                                setNestedReplyTarget(null);
                                              }
                                            }}
                                          />
                                          <button
                                            onClick={() => {
                                              if (nestedReplyText.trim()) {
                                                store.replyCommentCommunityPost(post.id, comm.id, nestedReplyText);
                                                setNestedReplyText("");
                                                setNestedReplyTarget(null);
                                              }
                                            }}
                                            className="px-2 py-1 bg-brand-600 hover:bg-brand-700 text-white text-[9px] font-bold rounded-lg"
                                          >
                                            Send
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })
                              )}
                            </div>

                            {/* Write a comment prompt input fields */}
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                              <input
                                type="text"
                                placeholder="Add your ecological thought commentary..."
                                className="flex-1 bg-slate-50 border rounded-xl py-2 px-3 text-xs text-slate-800 outline-none focus:border-brand-500 font-medium"
                                value={commentInput[post.id] || ""}
                                onChange={(e) => setCommentInput({ ...commentInput, [post.id]: e.target.value })}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleCommentSubmit(post.id);
                                  }
                                }}
                              />
                              <button
                                onClick={() => handleCommentSubmit(post.id)}
                                className="p-2 bg-slate-100 hover:bg-slate-200 text-brand-600 rounded-xl transition-all"
                              >
                                <Eye className="w-4 h-4 cursor-pointer" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
        )}
      </AnimatePresence>

      {/* ACHIEVEMENT SHARING DYNAMIC DIALOG MODAL */}
      <AnimatePresence>
        {sharingBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-slate-800 text-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-5"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[9px] uppercase tracking-widest font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Showcase Generator</span>
                </div>
                <button
                  onClick={() => setSharingBadge(null)}
                  className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Polaroid Styled Dynamic Card */}
              <div className="bg-gradient-to-b from-[#111c16] to-[#0d0d1b] rounded-2xl border border-emerald-500/20 p-5 relative overflow-hidden text-center shadow-xl space-y-4">
                {/* Decorative glowing backdrops */}
                <div className="absolute -top-10 -left-10 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl" />

                <div className="flex justify-between items-center text-[8px] font-mono tracking-widest text-emerald-500 font-extrabold uppercase mb-2">
                  <span>● BIOSPHERE CREDENTIAL</span>
                  <span>ECOSPHERE AI</span>
                </div>

                <div className="flex justify-center">
                  <div className="w-14 h-14 rounded-full bg-slate-800 border-2 border-emerald-400 flex items-center justify-center text-4xl shadow-md">
                    {sharingBadge.icon}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-mono tracking-widest font-bold text-indigo-400 uppercase">UNLOCKED ACHIEVEMENT</span>
                  <h3 className="text-base font-black text-white">{sharingBadge.title}</h3>
                  <p className="text-[10px] text-slate-400 font-bold max-w-[210px] mx-auto leading-normal">{sharingBadge.description}</p>
                </div>

                {/* Polaroid User Info Block */}
                <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center gap-2.5 text-left">
                  <img
                    src={profile.profileImage || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(profile.name)}`}
                    alt="user"
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full border border-emerald-500/30 object-cover shrink-0"
                  />
                  <div className="space-y-0.5">
                    <p className="text-xs font-black text-white leading-none">{profile.name}</p>
                    <p className="text-[9px] font-mono text-emerald-400 font-extrabold uppercase leading-none">Level {profile.level} {profile.levelRank}</p>
                  </div>
                  <span className="ml-auto text-[8px] font-mono text-slate-500 font-bold border border-slate-800 px-1 py-0.5 rounded">VERIFIED</span>
                </div>

                {/* Dynamic Eco-Motto Box */}
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/15 rounded-xl">
                  <p className="text-[10px] font-display italic text-emerald-300 leading-normal">
                    "{ecoMotto}"
                  </p>
                </div>
              </div>

              {/* Motto Selector Dropdown */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
                  Select Custom Eco-Motto
                </label>
                <select
                  value={ecoMotto}
                  onChange={(e) => setEcoMotto(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Small acts multiplied by millions can transform our planet.">🌱 Small acts multiply, planet heals</option>
                  <option value="Conserving power today safeguards the carbon metrics of tomorrow.">⚡ Save energy today, protect tomorrow</option>
                  <option value="Pedal power saves fuel, preserves nature, and strengthens lungs!">🚴 Cycling drives clean atmospheric loops</option>
                  <option value="Plant-based diets keep carbon emissions low and biosphere balance high.">🧁 Plant eating preserves forest environments</option>
                </select>
              </div>

              {/* Share Choices Menu Buttons */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
                  Publish Showcase Card To:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {/* Feed sharing */}
                  <button
                    onClick={async () => {
                      try {
                        await store.addCommunityPost(
                          `⭐ I just earned the exclusive [${sharingBadge.title}] Achievement! "${sharingBadge.description}". Motto: ${ecoMotto}`,
                          "General",
                          "", // no image payload required since custom achievement cards render natively
                          "achievement"
                        );
                        setShareSuccess("Shared to Community Feed!");
                        await store.addNotification(
                          "Showcase Published",
                          `Successfully shared your "${sharingBadge.title}" badge card to the Community Feed!`,
                          "system"
                        );
                      } catch (err) {
                        console.error("Feed share failed", err);
                      }
                    }}
                    className="p-2.5 bg-brand-600 hover:bg-brand-750 text-white rounded-xl text-center text-[10px] font-bold font-mono transition-colors border border-brand-500/30 flex flex-col items-center gap-1 cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5" /> Community
                  </button>

                  {/* Leaderboard feed sharing */}
                  <button
                    onClick={async () => {
                      setShareSuccess("Card broadcasted to Leaderboard!");
                      await store.addNotification(
                        "Leaderboard Update",
                        `Showcase card for "${sharingBadge.title}" broadcasted to live Leaderboard! Your rank is highly visible.`,
                        "challenge"
                      );
                    }}
                    className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-center text-[10px] font-bold font-mono transition-colors border border-indigo-500/30 flex flex-col items-center gap-1 cursor-pointer"
                  >
                    <Star className="w-3.5 h-3.5" /> Leaderboard
                  </button>

                  {/* Profile action timeline sharing */}
                  <button
                    onClick={async () => {
                      try {
                        await onAddCustomActivity({
                          id: "ach-post-" + Date.now(),
                          title: `Showcased: [${sharingBadge.title}] Achievement`,
                          category: "shopping",
                          co2Value: 0,
                          date: new Date().toISOString().split('T')[0],
                          pointsEarned: 0
                        });
                        setShareSuccess("Added to Profile Timeline!");
                        await store.addNotification(
                          "Timeline Updated",
                          `Successfully appended "${sharingBadge.title}" achievement showcase to your Profile Activity history log.`,
                          "system"
                        );
                      } catch (err) {
                        console.error("Timeline share failed", err);
                      }
                    }}
                    className="p-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-center text-[10px] font-bold font-mono transition-colors border border-slate-700 flex flex-col items-center gap-1 cursor-pointer"
                  >
                    <Flame className="w-3.5 h-3.5" /> Timeline
                  </button>
                </div>
              </div>

              {/* Inline successfully shared alert indicator */}
              {shareSuccess && (
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-center font-bold text-emerald-400 font-mono animate-pulse"
                >
                  ✔ {shareSuccess}
                </motion.p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
