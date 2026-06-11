import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Home, Trophy, Camera, BarChart2, User, Leaf, RefreshCw
} from "lucide-react";

// Views imports
import SplashView from "./components/SplashView";
import OnboardingView from "./components/OnboardingView";
import DashboardView from "./components/DashboardView";
import ChallengesView from "./components/ChallengesView";
import ScanView from "./components/ScanView";
import AnalyticsView from "./components/AnalyticsView";
import ProfileView from "./components/ProfileView";
import AuxiliaryViews from "./components/AuxiliaryViews";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Zustand State Store
import { useStore } from "./lib/store";
import { getLocalized } from "./lib/translations";

export default function App() {
  const {
    profile,
    activities,
    goals,
    challenges,
    community,
    badges,
    settings,
    isLoadingStore,
    dbInitStatus,
    dbStatusMessage,
    initStore,
    updateProfile,
    resetAll,
    addActivity,
    addGoal,
    toggleGoalComplete,
    clearGoals,
    completeChallenge,
    addCommunityPost,
    likeCommunityPost,
    commentCommunityPost,
  } = useStore();

  // Navigation Screens: "splash" | "onboarding" | "app"
  const [currentScreen, setCurrentScreen] = useState<"splash" | "onboarding" | "app">("splash");

  // Active Bottom Tab: "home" | "challenges" | "scan" | "stats" | "profile"
  const [activeTab, setActiveTab ] = useState<"home" | "challenges" | "scan" | "stats" | "profile">("home");

  // Active Auxiliary View (if any): null | "ai-coach" | "ai-insights" | "what-if" | "offset" etc...
  const [activeAuxView, setActiveAuxView] = useState<string | null>(null);

  // Load Dexie data on mount
  useEffect(() => {
    initStore();
  }, [initStore]);

  // Handle routing based on profile load
  useEffect(() => {
    if (!isLoadingStore) {
      if (profile && profile.hasCompletedOnboarding) {
        setCurrentScreen("app");
      } else {
        setCurrentScreen("splash");
      }
    }
  }, [profile, isLoadingStore]);

  // Update profile callback from Onboarding
  const handleSetProfile = async (newProfile: any) => {
    await updateProfile(newProfile);
    // Dynamic welcome reward transaction trigger
    await useStore.getState().addRewardTransaction(
      "Account Signup Bonus: Welcome Reward",
      1250, // EcoPoints
      150,  // XP
      "onboarding-bonus"
    );
    setCurrentScreen("app");
  };

  // Profile-specific reset logic
  const handleResetApp = async () => {
    if (confirm("Are you sure you want to reset all progress, XP, and profile info permanently?")) {
      await resetAll();
      setActiveTab("home");
      setActiveAuxView(null);
      setCurrentScreen("splash");
      window.location.reload();
    }
  };

  // Route Navigator helper
  const handleNavigateView = (viewName: string) => {
    if (["home", "challenges", "scan", "stats", "profile"].includes(viewName)) {
      setActiveTab(viewName as any);
      setActiveAuxView(null);
    } else {
      setActiveAuxView(viewName);
    }
  };

  if (isLoadingStore) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center" id="app-loading-screen">
        <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mb-4 text-brand-600 animate-pulse">
          <Leaf className="w-8 h-8 animate-spin-slow" />
        </div>
        <p className="text-sm font-semibold text-slate-800 uppercase tracking-widest font-mono">
          Synchronizing Carbon Twin
        </p>
        <p className="text-xs font-semibold text-slate-400 mt-2 font-mono">
          Status: <span className="text-brand-600">{dbInitStatus.toUpperCase()}</span>
        </p>
        <p className="text-xs text-slate-500 mt-2 px-6 max-w-xs">{dbStatusMessage}</p>
        
        {(dbInitStatus === 'corrupted' || dbInitStatus === 'recovered') && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl max-w-xs">
            <p className="text-[10px] text-amber-700 font-semibold uppercase tracking-wider">Storage Repair Protocol</p>
            <p className="text-[10px] text-slate-600 mt-1 leading-snug">
              Indices corrected successfully. No user data were affected.
            </p>
          </div>
        )}
      </div>
    );
  }

  const lang = settings?.language || 'en';

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex justify-center items-stretch" id="app-container">
        
        {/* Absolute Mobile-Framed Width bounds constraint to preserve design aesthetics */}
        <div className="w-full max-w-md bg-slate-50 flex flex-col justify-between border-x border-slate-100 shadow-2xl relative min-h-screen">
          
          <main id="main-content" className="flex-grow p-4 md:p-6 overflow-y-auto w-full outline-none" tabIndex={-1}>
            <AnimatePresence mode="wait">
              
              {/* SCREEN 1: Splash Screen */}
              {currentScreen === "splash" && (
                <motion.div
                  key="splash"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex items-center justify-center"
                >
                  <SplashView onStart={() => setCurrentScreen("onboarding")} />
                </motion.div>
              )}

              {/* SCREEN 2: Onboarding Setup */}
              {currentScreen === "onboarding" && (
                <motion.div
                  key="onboarding"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <OnboardingView onComplete={handleSetProfile} />
                </motion.div>
              )}

              {/* MAIN APP SHELL FRAMEWORK */}
              {currentScreen === "app" && profile && (
                <motion.div
                  key="app"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {/* Upper auxiliary header view route back */}
                  {activeAuxView ? (
                    <AuxiliaryViews 
                      viewName={activeAuxView} 
                      onBack={() => setActiveAuxView(null)} 
                      profile={profile}
                      onAddCustomActivity={addActivity}
                    />
                  ) : (
                    <>
                      {/* TAB CORE RENDER LOOPS */}
                      {activeTab === "home" && (
                        <DashboardView 
                          profile={profile} 
                          activities={activities} 
                          onNavigate={handleNavigateView}
                          onAddCustomActivity={addActivity}
                        />
                      )}

                      {activeTab === "challenges" && (
                        <ChallengesView 
                          profile={profile} 
                          challenges={challenges}
                          badges={badges}
                          community={community}
                          onCompleteChallenge={completeChallenge}
                          onPostCommunity={(content) => addCommunityPost(content, "Community Contribution")}
                          onLikePost={likeCommunityPost}
                          onAddComment={commentCommunityPost}
                          onAddCustomActivity={addActivity}
                        />
                      )}

                      {activeTab === "scan" && (
                        <ScanView 
                          onAddCustomActivity={addActivity} 
                          userProfile={profile} 
                        />
                      )}

                      {activeTab === "stats" && (
                        <AnalyticsView 
                          activities={activities} 
                        />
                      )}

                      {activeTab === "profile" && (
                        <ProfileView 
                          profile={profile} 
                          goals={goals}
                          onAddGoal={addGoal}
                          onToggleGoalComplete={toggleGoalComplete}
                          onClearGoals={clearGoals}
                          onResetApp={handleResetApp}
                        />
                      )}
                    </>
                  )}
                </motion.div>
              )}

            </AnimatePresence>
          </main>

          {/* BOTTOM NAVIGATION SHELL BLOCK */}
          {currentScreen === "app" && !activeAuxView && (
            <nav aria-label="Primary Navigation" className="sticky bottom-0 bg-white border-t border-slate-100 px-4 py-3 pb-5 flex justify-between items-center z-40 rounded-t-3xl shadow-lg shadow-teal-900/10" id="bottom-navigation">
              {[
                { id: "home", label: getLocalized(lang, "nav_home"), icon: Home },
                { id: "challenges", label: getLocalized(lang, "nav_challenges"), icon: Trophy },
                { id: "scan", label: getLocalized(lang, "nav_scan"), icon: Camera },
                { id: "stats", label: getLocalized(lang, "nav_analytics"), icon: BarChart2 },
                { id: "profile", label: getLocalized(lang, "nav_profile"), icon: User }
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      setActiveAuxView(null);
                    }}
                    aria-label={`${tab.label} tab`}
                    aria-current={isSelected ? "page" : undefined}
                    title={tab.label}
                    className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all relative focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1 ${
                      isSelected ? 'text-brand-600 scale-105 font-bold' : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    <Icon className="w-5.5 h-5.5" aria-hidden="true" />
                    <span className="text-[9px] mt-1 tracking-wider uppercase font-extrabold">{tab.label}</span>
                    {isSelected && (
                      <motion.div 
                        layoutId="nav-pill" 
                        className="absolute -top-1 w-5 h-1 bg-brand-500 rounded-full" 
                        id={`nav-pill-${tab.id}`}
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          )}

        </div>
      </div>
    </ErrorBoundary>
  );
}
