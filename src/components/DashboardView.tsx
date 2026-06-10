import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Sparkles, Leaf, Award, Flame, Navigation, Cpu, ArrowRight, Zap, ListCollapse,
  Activity as ActIcon, Check, Calendar, Globe, Compass, Wallet, BookOpen, Users,
  Building, Map, AlertTriangle, AlertCircle
} from "lucide-react";
import { UserProfile, Activity, Challenge } from "../types";
import { useStore } from "../lib/store";

interface DashboardViewProps {
  profile: UserProfile;
  activities: Activity[];
  onNavigate: (viewName: string) => void;
  onAddCustomActivity: (act: Activity) => void;
}

export default function DashboardView({ profile, activities, onNavigate, onAddCustomActivity }: DashboardViewProps) {
  // Read streak and ecoPoints from the central Zustand user store for consistency
  const currentStreak = useStore((state) => state.user?.currentStreak) ?? useStore.getState().user?.currentStreak ?? 0;
  const userEcoPoints = useStore((state) => state.user?.ecoPoints) ?? useStore.getState().user?.ecoPoints ?? profile.ecoPoints ?? 0;

  // Today's mission completion trigger calculated dynamically (anti-exploit, persists on refresh/redirect)
  const todayStr = new Date().toISOString().split('T')[0];
  const missionClaimed = profile.dailyMissionClaimedDate === todayStr || profile.lastClaimDate === todayStr || profile.lastRewardClaimDate === todayStr || useStore((state) => state.user?.lastRewardClaimDate) === todayStr;

  // Quick helper to categorize recent activities
  const recentActivities = activities.slice(-3).reverse();

  // Dynamic calculations from persistent IndexedDB activities
  const loggedEmissions = activities.filter(a => a.co2Value > 0).reduce((sum, a) => sum + a.co2Value, 0);
  const loggedSavings = activities.filter(a => a.co2Value < 0).reduce((sum, a) => sum + Math.abs(a.co2Value), 0);
  
  // Clean offset score representing player footprint
  const netCarbon = Math.max(0, Number((loggedEmissions - loggedSavings).toFixed(1)));
  const totalTreesSaved = Math.max(0, Number((loggedSavings / 22).toFixed(1)));

  // Draw custom high-contrast radial carbon gauge
  const radius = 64;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const carbonGoal = 400; // standard maximum
  const currentCarbonPercent = Math.min(100, Math.round((netCarbon / carbonGoal) * 100));
  const strokeDashoffset = circumference - (currentCarbonPercent / 100) * circumference;

  return (
    <div className="w-full space-y-6 pb-24">
      {/* Upper greetings & User Profile Card */}
      <div className="flex items-center justify-between" id="dashboard-header">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-1.5 font-display">
            Hi, {profile.name}! 👋
          </h2>
          <p className="text-xs text-slate-500 font-semibold uppercase mt-0.5 tracking-wider">
            Here's your eco impact today
          </p>
        </div>
        <div 
          onClick={() => onNavigate("profile")}
          className="w-10 h-10 rounded-full border-2 border-brand-500 bg-brand-100 flex items-center justify-center overflow-hidden font-bold text-brand-800 cursor-pointer shadow-sm hover:scale-105 transition-all shrink-0"
        >
          {profile.profileImage ? (
            <img src={profile.profileImage} alt={profile.name} className="w-full h-full object-cover" />
          ) : (
            <span>{profile.name[0]?.toUpperCase()}</span>
          )}
        </div>
      </div>

      {/* Main Carbon Arc radial scorecard */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col items-center relative overflow-hidden" id="carbon-circle-card">
        {/* Background visual graphics */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full pointer-events-none opacity-60" />
        
        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              stroke="#f1f5f9"
              fill="transparent"
              strokeWidth={stroke}
              r={normalizedRadius}
              cx={radius + stroke}
              cy={radius + stroke}
            />
            <circle
              stroke="#22c55e"
              fill="transparent"
              strokeWidth={stroke}
              strokeDasharray={circumference + ' ' + circumference}
              style={{ strokeDashoffset }}
              strokeLinecap="round"
              r={normalizedRadius}
              cx={radius + stroke}
              cy={radius + stroke}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-3.5xl font-extrabold text-slate-800 font-display">{netCarbon}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">kg CO₂e</span>
            <span className="mt-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              {netCarbon === 0 ? "Zero Footprint" : netCarbon <= 150 ? "Excellent Impact" : netCarbon <= 300 ? "Good Impact" : "High Footprint"}
            </span>
          </div>
        </div>

        {/* Highlight Stats subcards (S3 Trees saved, Eco points) */}
        <div className="grid grid-cols-2 gap-3 w-full mt-6">
          <div 
            onClick={() => onNavigate("offset")}
            className="bg-slate-50/50 hover:bg-slate-50 transition-all cursor-pointer border border-slate-100 rounded-2xl p-3 flex gap-2.5 items-center"
          >
            <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Leaf className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Trees Saved</p>
              <p className="text-base font-bold text-slate-800 mt-1">{totalTreesSaved}</p>
              <p className="text-[9px] text-slate-400 mt-0.5 leading-none">From Reductions</p>
            </div>
          </div>

          <div 
            onClick={() => onNavigate("wallet")}
            className="bg-slate-50/50 hover:bg-slate-50 transition-all cursor-pointer border border-slate-100 rounded-2xl p-3 flex gap-2.5 items-center"
          >
            <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center">
              <Award className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Eco Points</p>
              <p className="text-base font-bold text-slate-800 mt-1">{userEcoPoints.toLocaleString()}</p>
              <p className="text-[9px] text-slate-400 mt-0.5 leading-none">Total Points</p>
            </div>
          </div>
        </div>
      </div>

      {/* S15 Today's Mission & Streak Banner */}
      <div className="bg-emerald-600 rounded-3xl p-5 text-white shadow-md relative overflow-hidden" id="todays-mission-card">
        {/* Abstract orbits */}
        <div className="absolute right-0 bottom-0 top-0 w-36 bg-emerald-500/30 rounded-l-full pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex gap-3">
            <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0 animate-pulse">
              <Flame className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded">Active Streak</span>
                <span className="text-xs font-semibold text-emerald-100">🔥 Day {currentStreak}</span>
              </div>
              <h4 className="font-bold text-base mt-1">Walk instead of drive today</h4>
              <p className="text-xs text-emerald-100 mt-0.5">Estimated Savings: <span className="font-bold text-white">2.5 kg CO₂e</span></p>
            </div>
          </div>
          <div>
            {!missionClaimed ? (
              <button
                onClick={() => {
                  useStore.getState().claimDailyMission();
                }}
                className="bg-white text-emerald-700 font-bold px-4 py-2 rounded-xl text-xs shadow-md shadow-emerald-800/10 hover:bg-emerald-50 transition-all w-full sm:w-auto animate-bounce"
              >
                Claim +250 Points
              </button>
            ) : (
              <span className="bg-emerald-700/60 inline-flex items-center gap-1 text-white font-bold px-3 py-1.5 rounded-xl text-xs border border-white/25">
                <Check className="w-3.5 h-3.5" /> Claimed Today
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Feature Navigation Sections Quick Actions Grid */}
      <div>
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Quick Eco Tools</h3>
        <div className="grid grid-cols-2 gap-3" id="actions-grid">
          
          <div 
            onClick={() => onNavigate("ai-coach")}
            className="bg-white hover:border-brand-300 border border-slate-100 p-4 rounded-2xl shadow-sm transition-all cursor-pointer flex flex-col justify-between min-h-[110px]"
          >
            <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-800 mt-2">AI Eco Coach</p>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">Chat live with Gemini for custom eco reduction tips</p>
            </div>
          </div>

          <div 
            onClick={() => onNavigate("ai-insights")}
            className="bg-white hover:border-brand-300 border border-slate-100 p-4 rounded-2xl shadow-sm transition-all cursor-pointer flex flex-col justify-between min-h-[110px]"
          >
            <div className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-800 mt-2">AI Insights</p>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">Personalized feedback, analysis, and custom goals</p>
            </div>
          </div>

          <div 
            onClick={() => onNavigate("what-if")}
            className="bg-white hover:border-brand-300 border border-slate-100 p-4 rounded-2xl shadow-sm transition-all cursor-pointer flex flex-col justify-between min-h-[110px]"
          >
            <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-800 mt-2">Carbon What-If</p>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">Hypothesize EV, Vegan, solar changes in real time</p>
            </div>
          </div>

          <div 
            onClick={() => onNavigate("digital-twin")}
            className="bg-white hover:border-brand-300 border border-slate-100 p-4 rounded-2xl shadow-sm transition-all cursor-pointer flex flex-col justify-between min-h-[110px]"
          >
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-800 mt-2">Digital Twin</p>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">Carbon projections on Current Self vs 2050 Earth</p>
            </div>
          </div>

          <div 
            onClick={() => onNavigate("energy-analyzer")}
            className="bg-white hover:border-brand-300 border border-slate-100 p-4 rounded-2xl shadow-sm transition-all cursor-pointer flex flex-col justify-between min-h-[110px]"
          >
            <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-800 mt-2">Energy Analyzer</p>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">Log appliances and audit household grid draw</p>
            </div>
          </div>

          <div 
            onClick={() => onNavigate("travel-impact")}
            className="bg-white hover:border-brand-300 border border-slate-100 p-4 rounded-2xl shadow-sm transition-all cursor-pointer flex flex-col justify-between min-h-[110px]"
          >
            <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-800 mt-2">Travel Impact</p>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">Route comparisons of Car vs Train, EV & Walk</p>
            </div>
          </div>

          <div 
            onClick={() => onNavigate("offset")}
            className="bg-white hover:border-brand-300 border border-slate-100 p-4 rounded-2xl shadow-sm transition-all cursor-pointer flex flex-col justify-between min-h-[110px]"
          >
            <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-800 mt-2">Carbon Offset</p>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">Fund certified solar and plantation initiatives</p>
            </div>
          </div>

          <div 
            onClick={() => onNavigate("learning-hub")}
            className="bg-white hover:border-brand-300 border border-slate-100 p-4 rounded-2xl shadow-sm transition-all cursor-pointer flex flex-col justify-between min-h-[110px]"
          >
            <div className="w-9 h-9 bg-sky-50 rounded-xl flex items-center justify-center text-sky-600">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-800 mt-2">Learning Hub</p>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">Sustaining education lessons, quizzes & metrics</p>
            </div>
          </div>

        </div>
      </div>

      {/* S35, S36 Supplemental Timelines, Planner, Heatmaps, Org grids */}
      <div className="grid grid-cols-2 gap-3">
        <div 
          onClick={() => onNavigate("timeline")}
          className="bg-white hover:border-brand-300 border border-slate-100 p-4 rounded-2xl shadow-sm transition-all cursor-pointer flex items-center gap-3"
        >
          <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-600">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-xs text-slate-800 select-none">Eco Timeline</p>
            <p className="text-[9px] text-slate-400 select-none">Historic logs timeline</p>
          </div>
        </div>

        <div 
          onClick={() => onNavigate("heatmap")}
          className="bg-white hover:border-brand-300 border border-slate-100 p-4 rounded-2xl shadow-sm transition-all cursor-pointer flex items-center gap-3"
        >
          <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-600">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-xs text-slate-800 select-none">Emissions Grid</p>
            <p className="text-[9px] text-slate-400 select-none">Category heat map</p>
          </div>
        </div>

        <div 
          onClick={() => onNavigate("family-dashboard")}
          className="bg-white hover:border-brand-300 border border-slate-100 p-4 rounded-2xl shadow-sm transition-all cursor-pointer flex items-center gap-3"
        >
          <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-600">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-xs text-slate-800 select-none">Family Dashboard</p>
            <p className="text-[9px] text-slate-400 select-none">Co-track family impact</p>
          </div>
        </div>

        <div 
          onClick={() => onNavigate("org-dashboard")}
          className="bg-white hover:border-brand-300 border border-slate-100 p-4 rounded-2xl shadow-sm transition-all cursor-pointer flex items-center gap-3"
        >
          <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-600">
            <Building className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-xs text-slate-800 select-none">Organization</p>
            <p className="text-[9px] text-slate-400 select-none">Group carbon score</p>
          </div>
        </div>
      </div>

      {/* S3 Recent Activities & Empty/Populated State */}
      <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm text-slate-800">Recent Activities</h3>
          <span 
            className="text-[11px] font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 px-2.5 py-1 rounded-lg cursor-pointer transform hover:translate-x-0.5 transition-all select-none"
            onClick={() => onNavigate("stats")}
          >
            See All
          </span>
        </div>

        {recentActivities.length === 0 ? (
          <div className="py-6 text-center text-slate-400 flex flex-col items-center justify-center">
            <ActIcon className="w-10 h-10 text-slate-300 stroke-[1.25] mb-2" />
            <p className="text-sm font-semibold select-all">No activity recorded yet.</p>
            <p className="text-xs text-slate-400 max-w-xs mt-1">Scan a grocery receipt, log device electricity, or record daily challenge travel on the scan tab to populate scores.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivities.map((act) => (
              <div key={act.id} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    act.co2Value < 0 ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                  }`}>
                    <Leaf className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-xs text-slate-800">{act.title}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{act.date} • {act.category.toUpperCase()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-xs ${act.co2Value < 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {act.co2Value > 0 ? '+' : ''}{act.co2Value} kg
                  </p>
                  <p className="text-[9px] text-slate-400 font-semibold font-mono">+{act.pointsEarned} Pts</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
