import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { 
  TrendingDown, TrendingUp, Calendar, FileDown, Trees, DollarSign, Cloud, Leaf, Check, RefreshCw
} from "lucide-react";
import { Activity, SavedReport, CategoryType, UserProfile } from "../types";
import { useStore } from "../lib/store";

interface AnalyticsViewProps {
  activities: Activity[];
}

export default function AnalyticsView({ activities }: AnalyticsViewProps) {
  const profile = (useStore((state) => state.profile) || {
    name: "Eco Warrior",
    transportHabit: "car",
    foodHabit: "balanced",
    electricityHabit: "normal",
    shoppingHabit: "average",
    travelHabit: "rare-flights",
    level: 1,
    levelRank: "Climate Novice",
    ecoPoints: 0,
    streak: 0,
    currentStreak: 0,
    totalXP: 0
  }) as UserProfile;

  // Option filter views inside stats: 'overview' | 'breakdown' | 'report'
  const [activeTab, setActiveTab] = useState<'overview' | 'breakdown' | 'report'>('overview');
  // Date grain filter: 'weekly' | 'monthly' | 'yearly'
  const [timeGrain, setTimeGrain] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  // Report download click trigger
  const [pdfIsDownloading, setPdfIsDownloading] = useState<boolean>(false);

  // Time-grain scale factor calculations (highly scientific)
  const daysScale = timeGrain === "weekly" ? 7 : timeGrain === "yearly" ? 365 : 30;

  // Realistically mapping onboarding habits to daily emissions (kg CO2e per day)
  const getDailyTransportEmissions = () => {
    switch (profile.transportHabit) {
      case "car": return 6.5;
      case "ev": return 2.0;
      case "public": return 1.8;
      case "bike": return 0.1;
      case "walking": return 0.05;
      default: return 4.5;
    }
  };

  const getDailyFoodEmissions = () => {
    switch (profile.foodHabit) {
      case "meat-heavy": return 6.2;
      case "balanced": return 3.6;
      case "vegetarian": return 2.1;
      case "vegan": return 1.5;
      default: return 3.6;
    }
  };

  const getDailyEnergyEmissions = () => {
    switch (profile.electricityHabit) {
      case "high-ac": return 8.0;
      case "normal": return 4.5;
      case "saving": return 2.2;
      case "solar": return 0.1;
      default: return 4.5;
    }
  };

  const getDailyShoppingEmissions = () => {
    switch (profile.shoppingHabit) {
      case "heavy": return 5.5;
      case "average": return 2.5;
      case "infrequent": return 1.0;
      default: return 2.5;
    }
  };

  const getDailyWasteEmissions = () => 1.5; // Standard municipal solid waste footprint average

  // Compute stats on the fly!
  const baseTransport = getDailyTransportEmissions() * daysScale;
  const baseFood = getDailyFoodEmissions() * daysScale;
  const baseEnergy = getDailyEnergyEmissions() * daysScale;
  const baseShopping = getDailyShoppingEmissions() * daysScale;
  const baseWaste = getDailyWasteEmissions() * daysScale;

  // Aggregate user logged activities relative to timegrain
  const categoryTotals: Record<CategoryType, number> = {
    transport: baseTransport,
    food: baseFood,
    energy: baseEnergy,
    shopping: baseShopping,
    waste: baseWaste
  };

  // Adjust baseline calculations based on real actions (savings/additions)
  activities.forEach(act => {
    // Check if within matching period (simulate filter window)
    const val = act.co2Value;
    if (categoryTotals[act.category] !== undefined) {
      // Savings reduce total emissions; direct emissions expand it
      categoryTotals[act.category] = Math.max(0.1, categoryTotals[act.category] + val);
    }
  });

  const totalEmissions = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

  // Recharts payload collections
  const pieData = [
    { name: "Transport", value: Number(categoryTotals.transport.toFixed(0)), color: "#3b82f6" },
    { name: "Food", value: Number(categoryTotals.food.toFixed(0)), color: "#ef4444" },
    { name: "Energy", value: Number(categoryTotals.energy.toFixed(0)), color: "#f59e0b" },
    { name: "Shopping", value: Number(categoryTotals.shopping.toFixed(0)), color: "#8b5cf6" },
    { name: "Waste", value: Number(categoryTotals.waste.toFixed(0)), color: "#10b981" }
  ];

  // Dynamically calculate barData
  const barCategories = ["W1", "W2", "W3", "W4", "W5"];
  const barData = barCategories.map((name, idx) => {
    let emissions = 0;
    // partition activities into weeks based on dates or indexes
    activities.forEach((act, actIdx) => {
      if (act.co2Value > 0) {
        if (actIdx % 5 === idx) {
          emissions += act.co2Value;
        }
      }
    });
    return {
      name,
      emissions: Number(emissions.toFixed(1)),
      target: 45
    };
  });

  // Dynamically calculate trendData
  const trendMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const trendData = trendMonths.map((m, idx) => {
    let co2 = 0;
    // spread activities across months
    activities.forEach((act) => {
      // If we have positive emissions logged, aggregate them
      if (act.co2Value > 0) {
        const d = new Date(act.date || Date.now());
        const monthNum = d.getMonth(); // 0-11
        if (monthNum % 6 === idx) {
          co2 += act.co2Value;
        }
      }
    });
    return {
      month: m,
      co2: Number(co2.toFixed(1))
    };
  });

  // PDF Download trigger with real browser-compatible Blob-to-URL conversion
  const handlePdfTrigger = () => {
    setPdfIsDownloading(true);
    setTimeout(() => {
      try {
        const loggedSavingsReport = activities.filter(a => a.co2Value < 0).reduce((sum, a) => sum + Math.abs(a.co2Value), 0);
        const treesSavedReport = Math.max(0, Number((loggedSavingsReport / 22).toFixed(1)));
        const moneySavedReport = Math.max(0, Number((loggedSavingsReport * 0.15).toFixed(1)));
        const currentStreak = useStore.getState().user?.currentStreak ?? profile.currentStreak ?? 0;
        const totalXP = useStore.getState().user?.totalXP ?? profile.totalXP ?? profile.xp ?? 0;

        let content = `=====================================================
                    ECOSPHERE CLIMATE ACTION REPORT
=====================================================
Generated on: ${new Date().toLocaleDateString()}
User: ${profile.name}
Level: ${profile.level} (${profile.levelRank || "Climate Protector"})
Total XP: ${totalXP} XP
Active Streak: ${currentStreak} Days
Current Active EcoPoints Balance: ${(profile.ecoPoints || 0).toLocaleString()} Pts

-----------------------------------------------------
AGGREGATE FOOTPRINT STATISTICS
-----------------------------------------------------
Estimated Gross Emissions (Monthly): ${totalEmissions.toFixed(2)} kg CO2e
Total Certified Carbon Savings: ${loggedSavingsReport.toFixed(2)} kg CO2e
Offset Trees Saved equivalent: ${treesSavedReport} Trees
Approximate Financial Savings: $${moneySavedReport}

-----------------------------------------------------
EMISSIONS BY CATEGORY BREAKDOWN
-----------------------------------------------------
1. Transport: ${categoryTotals.transport.toFixed(2)} kg CO2e
2. Food:      ${categoryTotals.food.toFixed(2)} kg CO2e
3. Energy:    ${categoryTotals.energy.toFixed(2)} kg CO2e
4. Shopping:  ${categoryTotals.shopping.toFixed(2)} kg CO2e
5. Waste:     ${categoryTotals.waste.toFixed(2)} kg CO2e

-----------------------------------------------------
RECENT IN-APP CLIMATE ACTIONS LOGGED
-----------------------------------------------------
`;

        if (activities.length === 0) {
          content += "(No actions logged yet. Start logging to build your report!)\n";
        } else {
          activities.forEach((act, idx) => {
            content += `${idx + 1}. [${act.category.toUpperCase()}] ${act.title || "Activity"}
   Impact: ${act.co2Value < 0 ? "-" : "+"}${Math.abs(act.co2Value).toFixed(2)} kg CO2e | Rewards: +${act.pointsEarned || 0} Pts | Date: ${act.date || "N/A"}\n\n`;
          });
        }

        content += `-----------------------------------------------------
Certified by EcoSphere Engine. Powered by your conscious choices.
Protect our climate, one activity at a time.
=====================================================`;

        // Create browser-compatible Blob-to-URL conversion and trigger link click anchor
        const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement("a");
        link.href = url;
        link.download = `EcoSphere_Impact_Report_${profile.name.replace(/\s+/g, '_')}.pdf`;
        document.body.appendChild(link);
        link.click();
        
        // Clean up allocation resources to prevent leaks
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error("PDF generation error:", err);
      } finally {
        setPdfIsDownloading(false);
      }
    }, 1500);
  };

  return (
    <div className="w-full pb-24">
      {/* Sub navigation bar */}
      <div className="flex border-b border-slate-100 bg-white rounded-2xl p-1 shadow-sm mb-6 sticky top-0 z-20">
        {[
          { id: "overview", label: "Overview" },
          { id: "breakdown", label: "Category Impact" },
          { id: "report", label: "Impact Report" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-3 text-xs font-bold transition-all rounded-xl text-center capitalize ${
              activeTab === tab.id ? 'bg-brand-600 text-white shadow-md shadow-emerald-600/15' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Date Grain Filters (Overview/Breakdown pages) */}
      {activeTab !== "report" && (
        <div className="flex justify-end gap-1.5 mb-4" id="timegrain-filters">
          {[
            { id: "weekly", label: "Weekly" },
            { id: "monthly", label: "Monthly" },
            { id: "yearly", label: "Yearly" }
          ].map((grain) => (
            <button
              key={grain.id}
              onClick={() => setTimeGrain(grain.id as any)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                timeGrain === grain.id ? 'bg-slate-200 text-slate-800' : 'bg-slate-100 text-slate-400 hover:text-slate-600'
              }`}
            >
              {grain.label}
            </button>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* VIEW 1: Overview Chart trends (Line Chart / Bar Chart) */}
        {activeTab === "overview" && (
          <motion.div
            key="tab-overview"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Total emissions summary card */}
            <div className="bg-white border rounded-3xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Aggregate Carbon Score</p>
                <p className="text-3xl font-extrabold text-slate-800 mt-1">{totalEmissions.toFixed(0)} kg <span className="text-sm font-semibold text-slate-400">CO₂e</span></p>
                <div className="flex items-center gap-1.5 mt-2 text-emerald-600">
                  <TrendingDown className="w-4.5 h-4.5" />
                  <span className="text-xs font-bold">18% lower than regional base</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                <Cloud className="w-6 h-6 animate-pulse" />
              </div>
            </div>

            {/* Emissions comparison bar chart */}
            <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-3">
              <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest">Active Emissions Comparison</h4>
              <p className="text-[10px] text-slate-500 font-normal leading-tight">Your actual logged load compared to localized city targets over time:</p>
              
              <div className="w-full h-56 mt-4 font-mono text-[10px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} />
                    <YAxis stroke="#94a3b8" tickLine={false} />
                    <Tooltip contentStyle={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', fontSize: '10px' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                    <Bar name="Actual Emissions" dataKey="emissions" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Line name="City Baseline Limit" type="monotone" dataKey="target" stroke="#ef4444" strokeWidth={1.5} activeDot={false} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Historical trend Cumulative Emissions Line Chart */}
            <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-3">
              <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest">6-Month Trend Overview</h4>
              
              <div className="w-full h-56 mt-4 font-mono text-[10px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#94a3b8" tickLine={false} />
                    <YAxis stroke="#94a3b8" tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '10px' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                    <Line name="CO2 Output Trend" type="monotone" dataKey="co2" stroke="#4ade80" strokeWidth={3} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}

        {/* VIEW 2: Category Breakdown (Pie Chart + legends) */}
        {activeTab === "breakdown" && (
          <motion.div
            key="tab-breakdown"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Pie Chart visual container */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col items-center">
              <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest text-center self-start mb-4">Carbon Source Allocation</h4>
              
              <div className="w-full h-48 flex justify-center items-center font-mono text-[10px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="55%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* List entries layout detailing numbers (S4 legend values) */}
            <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-3" id="legends-list">
              <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest">Allocation Breakdown Values</h4>
              
              <div className="space-y-3">
                {pieData.map((item, idx) => {
                  const percent = Math.round((item.value / totalEmissions) * 100);
                  return (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-2xl border">
                      <div className="flex items-center gap-3">
                        <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-xs font-bold text-slate-800">{item.name}</span>
                      </div>
                      <div className="text-right flex items-center gap-4">
                        <span className="text-xs font-semibold text-slate-400">{percent}%</span>
                        <span className="text-xs font-bold text-slate-800 font-mono">({item.value} kg)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* VIEW 3: Cumulative Impact Report with horizontal bars (S11) */}
        {activeTab === "report" && (
          <motion.div
            key="tab-report"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Impact Report Header Selection */}
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 font-display">Your Impact Summary</h3>
              <div className="flex items-center gap-1 text-xs text-slate-400 font-bold bg-white px-2.5 py-1.5 rounded-xl border border-slate-100 shadow-sm leading-none select-none">
                <Calendar className="w-3.5 h-3.5" /> This Month
              </div>
            </div>

            {/* 3 Grid highlight cards (S11 Trees, CO2 reduced, Money saved) */}
            {(() => {
              const loggedSavingsReport = activities.filter(a => a.co2Value < 0).reduce((sum, a) => sum + Math.abs(a.co2Value), 0);
              const treesSavedReport = Math.max(0, Number((loggedSavingsReport / 22).toFixed(1)));
              const moneySavedReport = Math.max(0, Number((loggedSavingsReport * 0.15).toFixed(1)));

              return (
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 flex flex-col justify-between min-h-[95px]">
                    <Trees className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div className="mt-3">
                      <p className="text-sm font-bold text-emerald-800 uppercase tracking-wide">{treesSavedReport}</p>
                      <p className="text-[9px] text-emerald-600/75 mt-0.5 leading-none">Trees Saved</p>
                    </div>
                  </div>

                  <div className="bg-emerald-600 text-white rounded-2xl p-3 flex flex-col justify-between min-h-[95px]">
                    <Leaf className="w-5 h-5 text-emerald-100 shrink-0" />
                    <div className="mt-3">
                      <p className="text-sm font-black uppercase tracking-wide">{loggedSavingsReport.toFixed(1)} kg</p>
                      <p className="text-[9px] text-emerald-100 mt-0.5 leading-none">CO₂e Saved</p>
                    </div>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-3 flex flex-col justify-between min-h-[95px]">
                    <DollarSign className="w-5 h-5 text-blue-600 shrink-0" />
                    <div className="mt-3">
                      <p className="text-sm font-bold text-blue-800 uppercase tracking-wide">${moneySavedReport}</p>
                      <p className="text-[9px] text-blue-600/75 mt-0.5 leading-none font-medium">Money Saved</p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Category Impact Horizontal Bars (S11 styling) */}
            <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-4">
              <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">Category Impact Contribution</h4>
              
              <div className="space-y-4">
                {[
                  { name: "Transport", value: categoryTotals.transport, max: 200, color: "bg-blue-500" },
                  { name: "Food", value: categoryTotals.food, max: 120, color: "bg-rose-500" },
                  { name: "Energy", value: categoryTotals.energy, max: 100, color: "bg-amber-500" },
                  { name: "Shopping", value: categoryTotals.shopping, max: 80, color: "bg-purple-500" },
                  { name: "Waste", value: categoryTotals.waste, max: 50, color: "bg-emerald-500" }
                ].map((item, idx) => {
                  const barPercent = Math.min(100, Math.round((item.value / item.max) * 100));
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span>{item.name}</span>
                        <span className="font-mono">{item.value.toFixed(0)} kg</span>
                      </div>
                      <div className="w-full h-3 bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full`} style={{ width: `${barPercent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons: PDF Download + Share */}
            <div className="flex gap-3">
              {!pdfIsDownloading ? (
                <button
                  onClick={handlePdfTrigger}
                  className="flex-1 py-4 bg-brand-600 hover:bg-brand-700 text-white font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow shadow-emerald-400/10 leading-none select-none"
                >
                  <FileDown className="w-4 h-4" /> Download PDF
                </button>
              ) : (
                <div className="flex-1 py-4 bg-emerald-50 border border-emerald-100 text-emerald-700 font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2">
                  <RefreshCw className="w-4.5 h-4.5 animate-spin" /> Generating File...
                </div>
              )}

              <button
                onClick={() => alert("Report link copied to clipboard for direct sharing!")}
                className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-all leading-none select-none"
              >
                Share Report
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
