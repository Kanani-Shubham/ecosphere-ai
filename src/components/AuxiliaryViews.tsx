import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, Leaf, Award, Flame, Navigation, Cpu, ArrowRight, Zap, ListCollapse,
  Activity as ActIcon, Check, Calendar, Globe, Compass, Wallet, BookOpen, Users,
  Building, Map, AlertTriangle, AlertCircle, MessageSquare, Send, Mic, Play, ArrowUpRight,
  Shield, Volume2, Landmark
} from "lucide-react";
import { UserProfile, Activity, ChatMessage, ApplianceUsage, RewardTransaction } from "../types";
import { useStore } from "../lib/store";

const getClientChatFallbackReply = (messages: any[], userProfile: any) => {
  const lastMessage = messages[messages.length - 1]?.text || "";
  const name = userProfile?.name || "Eco Warrior";
  let reply = `Hello ${name}! I am your AI Eco Coach. I'm currently routing you through local backup assistance because our primary Gemini server is experiencing temporary high demand.\n\nHere is a personalized sustainable recommendation: try reducing AC usage by 1 hour daily, which lowers your direct footprint by ~2.4 kg CO₂e and earns you significant Eco Points!`;
  if (lastMessage.toLowerCase().includes("eating") || lastMessage.toLowerCase().includes("food")) {
    reply = `Hi ${name}! Serving plant-based meals is one of the most effective ways to lower your food footprint. Switching to a vegetarian or vegan lunch can reduce daily grocery carbon load by up to 4.7 kg CO₂e! Try dynamic grain and legume-based bowls today!`;
  } else if (lastMessage.toLowerCase().includes("transport") || lastMessage.toLowerCase().includes("car")) {
    reply = `Taking public transit or electric commuting vehicles protects the climate, reduces regional emissions by 60%, and expands high reward points! For commutes under 3 kilometers, walk or bike to achieve zero emission footprint.`;
  }
  return reply;
};

const getClientInsightsFallback = (activities: any[], userProfile: any) => {
  let userCategoryBreakdown = "Transport & Energy";
  if (userProfile?.foodHabit?.toLowerCase().includes("meat")) {
    userCategoryBreakdown += " and Meat Intensive Food consumption";
  }
  return {
    personalizedInsight: `Your customized profile points to high emission sources from **${userCategoryBreakdown}**. Swapping 2 standard car trips with cycling of 5km weekly can lessen your annual load by 48 kg CO₂e while expanding EcoPoints! (Resilient Backup Mode: serving local analytics forecast)`,
    suggestions: [
      { item: "Use public transport", impact: "High Impact", co2Saved: 12, reason: "Reduces transport emissions by 40% immediately." },
      { item: "Reduce AC usage", impact: "Medium Impact", co2Saved: 8, reason: "Warms up room 1°C to optimize compressor load." },
      { item: "Eat more plant-based meals", impact: "Medium Impact", co2Saved: 6, reason: "Bypasses animal farming lifecycle emissions." },
      { item: "Avoid single-use plastic", impact: "Low Impact", co2Saved: 4, reason: "Reduces municipal solid waste burden." }
    ],
    planner: [
      { day: "Mon", title: "Use public transport", reward: "+15 XP" },
      { day: "Tue", title: "Eat plant-based meal", reward: "+20 XP" },
      { day: "Wed", title: "Save 1 kWh electricity", reward: "+15 XP" },
      { day: "Thu", title: "Avoid single-use plastic", reward: "+20 XP" },
      { day: "Fri", title: "Walk or cycle 3km", reward: "+25 XP" },
      { day: "Sat", title: "Plant a virtual or real tree", reward: "+30 XP" },
      { day: "Sun", title: "Review achievements", reward: "+10 XP" }
    ],
    forecasting: {
      currentPath: [243, 220, 210, 205, 198, 185],
      greenPath: [243, 180, 150, 125, 98, 80]
    },
    isDemo: true,
    isFallback: true
  };
};

interface AuxiliaryViewsProps {
  viewName: string;
  onBack: () => void;
  profile: UserProfile;
  onAddCustomActivity: (act: Activity) => void;
}

export default function AuxiliaryViews({ viewName, onBack, profile, onAddCustomActivity }: AuxiliaryViewsProps) {
  return (
    <div className="w-full pb-24">
      <AnimatePresence mode="wait">
        {/* VIEW: S5 AI Eco Coach (Chat Interface with actual/simulated Gemini backend) */}
        {viewName === "ai-coach" && <AICoachView profile={profile} onBack={onBack} />}

        {/* VIEW: S13 AI Insights & S33 AI Planner */}
        {viewName === "ai-insights" && <AIInsightsView profile={profile} onBack={onBack} />}

        {/* VIEW: S14 What If Simulator */}
        {viewName === "what-if" && <WhatIfView onBack={onBack} onAddCustomActivity={onAddCustomActivity} />}

        {/* VIEW: S19 Carbon Offset */}
        {viewName === "offset" && <CarbonOffsetView onBack={onBack} onAddCustomActivity={onAddCustomActivity} />}

        {/* VIEW: S20 Learning Hub */}
        {viewName === "learning-hub" && <LearningHubView onBack={onBack} />}

        {/* VIEW: S25 Digital Twin & S34 Earth Simulator */}
        {viewName === "digital-twin" && <DigitalTwinView onBack={onBack} />}

        {/* VIEW: S28 Energy Usage Analyzer */}
        {viewName === "energy-analyzer" && <EnergyUsageAnalyzerView onBack={onBack} onAddCustomActivity={onAddCustomActivity} />}

        {/* VIEW: S29 Travel Impact comparison */}
        {viewName === "travel-impact" && <TravelImpactView onBack={onBack} onAddCustomActivity={onAddCustomActivity} />}

        {/* VIEW: S31 Family Dashboard */}
        {viewName === "family-dashboard" && <FamilyDashboardView onBack={onBack} />}

        {/* VIEW: S32 Organization Dashboard */}
        {viewName === "org-dashboard" && <OrganizationDashboardView onBack={onBack} />}

        {/* VIEW: S35 Carbon Timeline */}
        {viewName === "timeline" && <CarbonTimelineView onBack={onBack} />}

        {/* VIEW: S36 Carbon Heatmap */}
        {viewName === "heatmap" && <CarbonHeatmapView onBack={onBack} />}

        {/* VIEW: S37 Eco Wallet */}
        {viewName === "wallet" && <EcoWalletView onBack={onBack} onAddCustomActivity={onAddCustomActivity} />}
      </AnimatePresence>
    </div>
  );
}

/* ==================== S5: AI Eco Coach ==================== */
function AICoachView({ profile, onBack }: { profile: UserProfile; onBack: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "init", sender: "ai", text: `Hi ${profile.name}! I am your AI Eco Coach. I can help you reduce your carbon footprint.\n\nHow can I help you today?`, timestamp: "11:22 AM" }
  ]);
  const [inputText, setInputText] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAiTyping]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: "usr-" + Date.now(),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsAiTyping(true);
    setWarningMessage(null);

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          userProfile: profile
        })
      });
      
      let data;
      const contentType = response.headers.get("content-type");
      if (response.ok && contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        console.warn(`[Client-side Resilience] Non-JSON or bad response received for Chat (Status: ${response.status}). Activating local chatbot fallback.`);
        data = {
          text: getClientChatFallbackReply([...messages, userMsg], profile),
          isDemo: true,
          isFallback: true,
          warning: "Temporary AI load exceeded. Serving smart local backup."
        };
      }
      
      if (data.warning || data.isFallback) {
        setWarningMessage(data.warning || "Our main AI service is packed! Providing intelligent backup assistance instead.");
      }
      
      setMessages(prev => [...prev, {
        id: "ai-" + Date.now(),
        sender: "ai",
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (e) {
      console.warn("[Client-side Resilience] Chat connection error. Activating local chatbot fallback.", e);
      const data = {
        text: getClientChatFallbackReply([...messages, userMsg], profile),
        isDemo: true,
        isFallback: true
      };
      setWarningMessage("Our main AI service is packed! Providing intelligent backup assistance instead.");
      setMessages(prev => [...prev, {
        id: "ai-" + Date.now(),
        sender: "ai",
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsAiTyping(false);
    }
  };

  return (
    <div className="bg-white border rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between min-h-[520px]">
      {/* Header */}
      <div className="bg-slate-50 border-b p-4 flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <button onClick={onBack} className="bg-white px-2.5 py-1.5 border rounded-xl font-bold text-xs text-slate-500">← Back</button>
          <div>
            <h4 className="font-bold text-xs text-slate-800">AI Eco Coach</h4>
            <p className="text-[9px] text-slate-400 font-bold uppercase">
              {warningMessage ? "Backup Offline Service" : "Gemini-3.5-flash active"}
            </p>
          </div>
        </div>
        <div className={`w-2.5 h-2.5 rounded-full animate-ping ${warningMessage ? "bg-amber-400" : "bg-emerald-500"}`} />
      </div>

      {warningMessage && (
        <div className="bg-amber-50 border-b border-amber-100 p-3 text-[10px] text-amber-700 font-medium flex items-center gap-2">
          <span className="font-extrabold uppercase bg-amber-200 text-amber-800 rounded px-1 text-[8px]">Notice</span>
          <span>{warningMessage}</span>
          <button onClick={() => setWarningMessage(null)} className="ml-auto font-black cursor-pointer hover:text-amber-900">×</button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-grow p-4 space-y-4 overflow-y-auto max-h-[350px]">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`p-3.5 rounded-2xl max-w-xs text-xs shadow-sm ${
              m.sender === "user" 
                ? "bg-brand-600 text-white rounded-tr-none" 
                : "bg-slate-100 text-slate-800 rounded-tl-none whitespace-pre-line"
            }`}>
              <p className="leading-relaxed font-medium">{m.text}</p>
              <span className={`text-[8px] mt-1.5 block text-right ${m.sender === "user" ? "text-slate-100" : "text-slate-400"}`}>{m.timestamp}</span>
            </div>
          </div>
        ))}
        {isAiTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl rounded-tl-none">
              <span className="text-xs text-slate-400 animate-pulse font-mono">My Eco Twin is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick assistance suggestion triggers (S5 list options) */}
      <div className="p-3 bg-slate-50/50 border-t flex gap-2.5 overflow-x-auto whitespace-nowrap">
        <button onClick={() => handleSend("How can I reduce my food footprint?")} className="bg-white border rounded-lg px-2.5 py-1 text-[10px] text-slate-600 font-bold">Food tips</button>
        <button onClick={() => handleSend("Give me ways to commute cleaner.")} className="bg-white border rounded-lg px-2.5 py-1 text-[10px] text-slate-600 font-bold">Commutes</button>
        <button onClick={() => handleSend("How does solar panel help?")} className="bg-white border rounded-lg px-2.5 py-1 text-[10px] text-slate-600 font-bold">Solar info</button>
      </div>

      {/* Input controls */}
      <div className="p-4 border-t flex gap-3 bg-white">
        <input
          type="text"
          placeholder="Ask me anything..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-grow bg-slate-50 border p-3 rounded-xl focus:outline-none focus:border-brand-500 text-xs text-slate-800 font-medium"
        />
        <button onClick={() => handleSend()} aria-label="Send" className="bg-brand-600 hover:bg-brand-700 text-white p-3 rounded-xl">
          <Send className="w-4.5 h-4.5" />
        </button>
      </div>
    </div>
  );
}

/* ==================== S13: AI Insights & Planner ==================== */
function AIInsightsView({ profile, onBack }: { profile: UserProfile; onBack: () => void }) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await fetch("/api/gemini/get-insights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userProfile: profile, activities: [] })
        });
        
        let details;
        const contentType = res.headers.get("content-type");
        if (res.ok && contentType && contentType.includes("application/json")) {
          details = await res.json();
        } else {
          console.warn(`[Client-side Resilience] Non-JSON or bad response received for Insights (Status: ${res.status}). Activating local backup insights engine.`);
          details = getClientInsightsFallback([], profile);
        }
        setData(details);
      } catch (e) {
        console.warn("[Client-side Resilience] Insights network connection failed. Mapping local green planner forecasts.", e);
        setData(getClientInsightsFallback([], profile));
      } finally {
        setIsLoading(false);
      }
    };
    fetchInsights();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="bg-slate-100 p-2.5 rounded-xl hover:bg-slate-200 text-slate-500 text-xs font-bold font-mono">← Back</button>
        <div>
          <h3 className="text-lg font-bold text-slate-800">AI Sustainable Advisor</h3>
          <p className="text-[11px] text-slate-400 font-medium">
            {data?.isFallback ? "Offline Backup Planner" : "Customized via daily profile logs"}
          </p>
        </div>
      </div>

      {data?.warning && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3.5 text-xs text-amber-800 font-medium flex flex-col gap-1.5 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="font-extrabold uppercase bg-amber-200 text-amber-950 rounded px-1.5 py-0.5 text-[8px]">Backup Mode</span>
            <span className="font-bold text-[11px]">Primary AI Engine Busy</span>
          </div>
          <p className="text-[10px] leading-relaxed text-amber-700/90">{data.warning}</p>
        </div>
      )}

      {isLoading ? (
        <div className="bg-white rounded-3xl p-8 border text-center text-slate-400">
          <Sparkles className="w-8 h-8 text-brand-500 animate-spin mx-auto mb-2" />
          <p className="text-xs font-bold leading-none font-mono">Syncing eco trends with Gemini...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Personalized Insight (S13) */}
          <div className="bg-white rounded-3xl border p-5 shadow-sm space-y-3">
            <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-emerald-600" /> Personalized Insight
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed font-normal bg-brand-50/20 p-4 rounded-2xl border border-brand-100 whitespace-pre-line">
              {data?.personalizedInsight}
            </p>
          </div>

          {/* Tips List (S13 list) */}
          <div className="bg-white rounded-3xl border p-5 shadow-sm space-y-4">
            <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">Top Suggestions Proposed</h4>
            <div className="space-y-3">
              {data?.suggestions?.map((item: any, id: number) => (
                <div key={id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100/50 flex justify-between items-center">
                  <div>
                    <h5 className="font-bold text-xs text-slate-800">{item.item}</h5>
                    <p className="text-[10px] text-slate-400 mt-1">{item.reason}</p>
                  </div>
                  <div className="text-right">
                    <span className="bg-emerald-50 text-emerald-700 font-black text-[9px] uppercase px-2 py-0.5 rounded border border-emerald-100 block">
                      Save {item.co2Saved} kg
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* S33: AI Weekly Planner */}
          <div className="bg-white rounded-3xl border p-5 shadow-sm space-y-4">
            <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-4 h-4 text-indigo-600" /> AI Weekly Planner
            </h4>
            <div className="divide-y">
              {data?.planner?.map((day: any, i: number) => (
                <div key={i} className="py-3 first:pt-0 last:pb-0 flex justify-between items-center">
                  <div className="flex gap-3 items-center">
                    <span className="w-8 font-black font-mono text-slate-400 text-xs uppercase text-center bg-slate-50 py-1 rounded-md">{day.day}</span>
                    <span className="text-xs font-semibold text-slate-700">{day.title}</span>
                  </div>
                  <span className="text-[9px] font-bold text-brand-600">{day.reward}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==================== S14: What-If Simulator ==================== */
function WhatIfView({ onBack, onAddCustomActivity }: { onBack: () => void; onAddCustomActivity: (act: Activity) => void }) {
  const [switches, setSwitches] = useState({
    ev: false,
    public: false,
    ac: false,
    vegan: false,
    flights: false
  });

  // Calculate simulated reduction values
  let potentialSavings = 0;
  if (switches.ev) potentialSavings += 45;
  if (switches.public) potentialSavings += 32;
  if (switches.ac) potentialSavings += 18;
  if (switches.vegan) potentialSavings += 25;
  if (switches.flights) potentialSavings += 40;

  const handleApplyScenario = () => {
    if (potentialSavings === 0) return;
    onAddCustomActivity({
      id: "what-if-" + Date.now(),
      title: "Activated Scenario: Carbon reduction choices",
      category: "energy",
      co2Value: -potentialSavings,
      date: "2026-06-09",
      pointsEarned: 250
    });
    alert(`Applied! This hypothetical choice reduces your footprint metrics by -${potentialSavings} kg CO₂e!`);
    onBack();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="bg-slate-100 p-2.5 rounded-xl hover:bg-slate-200 text-slate-500 text-xs font-bold font-mono">← Back</button>
        <div>
          <h3 className="text-lg font-bold text-slate-800">What-If Simulator</h3>
          <p className="text-[11px] text-slate-400 font-medium">Verify custom scenario carbon impact</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border p-5 shadow-sm space-y-4">
        <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-widest">Model Environmental Choices</h4>
        
        <div className="space-y-3">
          {[
            { id: "ev", title: "Buy an Electric Vehicle (EV)", reduction: "-45 kg CO₂e", detail: "Bypasses fossil engines entirely" },
            { id: "public", title: "Adopt Public Transit full-time", reduction: "-32 kg CO₂e", detail: "Share transit grid occupancy" },
            { id: "ac", title: "Reduce AC thermostat load by 2°C", reduction: "-18 kg CO₂e", detail: "Optimize compressor utility" },
            { id: "vegan", title: "Transition to fully Vegan diet", reduction: "-25 kg CO₂e", detail: "Bypass organic cattle farming life cycle emissions" },
            { id: "flights", title: "Reduce regional flights by half", reduction: "-40 kg CO₂e", detail: "Lesser aviation jet fuel logs" }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSwitches(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof switches] }))}
              className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                switches[item.id as keyof typeof switches] ? 'border-brand-500 bg-brand-50/40' : 'border-slate-100 hover:bg-slate-50'
              }`}
            >
              <div>
                <p className="font-bold text-slate-800 text-xs">{item.title}</p>
                <p className="text-[10px] text-slate-400 mt-1">{item.detail}</p>
              </div>
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${
                switches[item.id as keyof typeof switches] ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500 font-mono'
              }`}>{item.reduction}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Simulator score calculation results banner (S14) */}
      <div className="bg-emerald-600 rounded-3xl p-6 text-white shadow-md text-center space-y-4">
        <h4 className="font-extrabold text-xs text-emerald-100 uppercase tracking-widest">Aggregate Calculated Savings</h4>
        <p className="text-3xl font-black font-display">{potentialSavings} kg CO₂e <span className="text-xs font-semibold text-emerald-100">Reduction</span></p>
        <p className="text-xs text-emerald-100 leading-relaxed font-normal">If implemented today, you'll reduce your personal monthly carbon emissions by **{( (potentialSavings / 243) * 100).toFixed(0)}%**!</p>
        
        <button
          onClick={handleApplyScenario}
          className="w-full bg-white text-emerald-700 font-bold py-3 px-4 rounded-xl text-xs hover:bg-emerald-50 transition-all shadow"
        >
          Model & Apply Choices
        </button>
      </div>
    </div>
  );
}

/* ==================== S19: Carbon Offset Projects ==================== */
function CarbonOffsetView({ onBack, onAddCustomActivity }: { onBack: () => void; onAddCustomActivity: (act: Activity) => void }) {
  const [purchased, setPurchased] = useState<Record<string, boolean>>({});

  const handlePurchaseOffset = (id: string, name: string, cost: number, val: number) => {
    onAddCustomActivity({
      id: "offset-" + Date.now(),
      title: `Compensated Footprint: Purchased ${name}`,
      category: "waste",
      co2Value: -val,
      date: "2026-06-09",
      pointsEarned: 100
    });
    setPurchased(prev => ({ ...prev, [id]: true }));
    alert(`Thank you! Offset choice ${name} supported successfully. Gained +100 EcoPoints!`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="bg-slate-100 p-2.5 rounded-xl hover:bg-slate-200 text-slate-500 text-xs font-bold font-mono">← Back</button>
        <div>
          <h3 className="text-lg font-bold text-slate-800">Carbon Offset Marketplace</h3>
          <p className="text-[11px] text-slate-400 font-medium font-mono">Compensate direct localized emissions</p>
        </div>
      </div>

      <div className="bg-white border rounded-3xl p-5 shadow-sm space-y-4">
        <div className="bg-gradient-to-tr from-brand-600 to-emerald-500 rounded-2xl p-5 text-white shadow-inner">
          <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-widest leading-none">Offset Impact</p>
          <h4 className="font-extrabold text-sm mt-1.5">Neutralize Your Carbon Impact</h4>
          <p className="text-xs text-emerald-100 mt-2 font-normal leading-relaxed">Support certified international reforestation and clean hydro-electric projects to offset essential lifestyle commuting loads.</p>
        </div>

        <div className="space-y-3">
          {[
            { id: "o1", name: "Reforestation Project", cost: 15, value: 50, desc: "Plants indigenous high-canopy trees in Ecuador to absorb industrial co2 logs.", icon: "🌳" },
            { id: "o2", name: "Equator Certified Solar Energy", cost: 30, value: 120, desc: "Supports localized communities with solar microgrid infrastructure.", icon: "☀️" },
            { id: "o3", name: "Clean Water Filter Wells", cost: 20, value: 80, desc: "Bypasses fossil boiling sanitation demands in Kenya communities.", icon: "💧" }
          ].map((item) => (
            <div key={item.id} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex gap-3 leading-tight">
                <span className="text-3xl shrink-0">{item.icon}</span>
                <div>
                  <h5 className="font-bold text-slate-800 text-xs flex items-center gap-2">
                    {item.name}
                    <span className="bg-emerald-50 text-emerald-700 text-[9px] px-1.5 py-0.5 rounded border">-{item.value} kg CO₂</span>
                  </h5>
                  <p className="text-[10px] text-slate-500 mt-1 max-w-xs leading-normal">{item.desc}</p>
                </div>
              </div>
              {!purchased[item.id] ? (
                <button
                  onClick={() => handlePurchaseOffset(item.id, item.name, item.cost, item.value)}
                  className="bg-brand-600 hover:bg-brand-700 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs shrink-0 w-full sm:w-auto text-center"
                >
                  Buy (${item.cost})
                </button>
              ) : (
                <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-3 py-2 rounded-xl text-xs font-bold shrink-0 w-full sm:w-auto text-center flex items-center justify-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Funded
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ==================== S20: Learning Hub ==================== */
function LearningHubView({ onBack }: { onBack: () => void }) {
  const [activeLesson, setActiveLesson] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="bg-slate-100 p-2.5 rounded-xl hover:bg-slate-200 text-slate-500 text-xs font-bold font-mono">← Back</button>
        <div>
          <h3 className="text-lg font-bold text-slate-800">Learning Center</h3>
          <p className="text-[11px] text-slate-400 font-medium">Build Carbon awareness and climate knowledge</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border p-5 shadow-sm space-y-4">
        <div className="bg-sky-600 rounded-2xl p-5 text-white shadow-md">
          <p className="text-[10px] font-bold text-sky-100 uppercase tracking-widest leading-none">Education Hub</p>
          <h4 className="font-extrabold text-sm mt-1.5">Improve climate IQ to unlock achievements</h4>
          <p className="text-xs text-sky-100 mt-2 font-normal leading-relaxed">Read brief cards on carbon metrics, test your knowledge, of clean habits and offset multipliers.</p>
        </div>

        <div className="space-y-2.5">
          {[
            { id: 1, title: "What is Carbon Footprint?", duration: "5 mins", difficulty: "Beginner", content: "A carbon footprint represents the aggregate total volume of greenhouse gases (including carbon dioxide and methane) emitted by our industrial, agricultural, and daily commuting choices." },
            { id: 2, title: "How to Reduce Household Emissions", duration: "7 mins", difficulty: "Intermediate", content: "Optimize heating elements, wash laundry on cold off-peak schedules, clean AC ventilation systems twice annually, and switch home energy inputs to solar grids." },
            { id: 3, title: "The Meat Lifecycle Food Impact", duration: "6 mins", difficulty: "Intermediate", content: "Red meat farming accounts for over 18% of global greenhouse emissions. Transitioning to organic plant grain proteins reduces meal metrics by up to 75%!" },
            { id: 4, title: "Understanding Carbon Offsetting", duration: "8 mins", difficulty: "Advanced", content: "Offsetting allows individuals to compensate essential travel loads by purchasing equivalent credits that fund verified global clean projects like wind farms and reforestation." }
          ].map((lesson) => (
            <div key={lesson.id} className="border border-slate-100 rounded-2.5xl overflow-hidden bg-slate-50/50">
              <button
                onClick={() => setActiveLesson(activeLesson === lesson.id ? null : lesson.id)}
                className="w-full p-4 text-left flex justify-between items-center bg-white border-b hover:bg-slate-50/50 transition-all"
              >
                <div>
                  <h5 className="font-bold text-xs text-slate-800">{lesson.title}</h5>
                  <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase">{lesson.duration} • {lesson.difficulty}</p>
                </div>
                <ArrowRight className={`w-4 h-4 text-slate-350 transition-all ${activeLesson === lesson.id ? 'rotate-90' : ''}`} />
              </button>
              
              <AnimatePresence>
                {activeLesson === lesson.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="p-4 bg-slate-50/50 text-xs text-slate-600 leading-relaxed font-normal whitespace-pre-wrap"
                  >
                    {lesson.content}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ==================== S25: Digital Twin & Earth Simulator ==================== */
function DigitalTwinView({ onBack }: { onBack: () => void }) {
  const [twinOption, setTwinOption] = useState<'current' | 'future' | 'green'>('current');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="bg-slate-100 p-2.5 rounded-xl hover:bg-slate-200 text-slate-500 text-xs font-bold font-mono">← Back</button>
        <div>
          <h3 className="text-lg font-bold text-slate-800">Carbon Digital Twin</h3>
          <p className="text-[11px] text-slate-400 font-medium">Verify 2050 localized environmental paths</p>
        </div>
      </div>

      {/* Grid selector current self vs future self (S25, S26, S34) */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
        {[
          { id: "current", label: "Current Self" },
          { id: "future", label: "Future Self (Industrial Path)" },
          { id: "green", label: "Green Lifestyle Path" }
        ].map((opt) => (
          <button
            key={opt.id}
            onClick={() => setTwinOption(opt.id as any)}
            className={`flex-1 py-2.5 rounded-lg font-bold text-[10px] uppercase text-center transition-all ${
              twinOption === opt.id ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Digital Twin Interactive Core Card */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col items-center text-center space-y-6">
        
        {twinOption === "current" && (
          <div className="space-y-4">
            <div className="w-24 h-24 bg-brand-100 rounded-full flex items-center justify-center text-3xl shadow">👤</div>
            <h4 className="font-extrabold text-slate-800 text-base leading-none">Your Current Self baseline</h4>
            <div className="bg-emerald-50 text-emerald-750 font-black px-4 py-1.5 border rounded-xl text-base leading-none">
              243 kg CO₂e / month
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-normal max-w-xs">
              Based on your current logged commuting, utility, and diet habits, your sustainable Twin footprint is 18% lower than your localized neighborhood average.
            </p>
          </div>
        )}

        {twinOption === "future" && (
          <div className="space-y-4">
            <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center text-4xl shadow">🌋</div>
            <h4 className="font-extrabold text-slate-850 text-base leading-none">Your Future Self in 2050 (Unchanged)</h4>
            <div className="bg-rose-50 text-rose-700 font-bold px-4 py-1.5 border rounded-xl text-base leading-none">
              312 kg CO₂e / month (+28%)
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-normal max-w-xs">
              If your current carbon habits continue unchanged under standard city emissions escalation models, heating loads and sea level impacts will increase by 28%.
            </p>
          </div>
        )}

        {twinOption === "green" && (
          <div className="space-y-4">
             <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-4xl shadow font-display">🌎</div>
             <h4 className="font-extrabold text-slate-850 text-base leading-none">Your Future Self (Green Adaptation)</h4>
             <div className="bg-indigo-50 text-indigo-700 font-bold px-4 py-1.5 border rounded-xl text-base leading-none">
               98 kg CO₂e / month (-62%)
             </div>
             <p className="text-xs text-slate-500 leading-relaxed font-normal max-w-xs">
               Adopting clean transport choices and supporting solar microgrids will lower your Twin baseline by 62% in the long term, preventing up to 2 tons of thermal CO2 equivalents!
             </p>
          </div>
        )}

      </div>
    </div>
  );
}

/* ==================== S28: Energy Usage Analyzer ==================== */
function EnergyUsageAnalyzerView({ onBack, onAddCustomActivity }: { onBack: () => void; onAddCustomActivity: (act: Activity) => void }) {
  const [powerSaved, setPowerSaved] = useState<Record<string, boolean>>({});

  const handleActionClick = (id: string, name: string, savedco2: number) => {
    onAddCustomActivity({
      id: "energy-" + Date.now(),
      title: `Optimized Utility: ${name}`,
      category: "energy",
      co2Value: -savedco2,
      date: "2026-06-09",
      pointsEarned: 150
    });
    setPowerSaved(prev => ({ ...prev, [id]: true }));
    alert(`Optimized! Saved ${savedco2} kg grid carbon limits.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="bg-slate-100 p-2.5 rounded-xl hover:bg-slate-200 text-slate-500 text-xs font-bold font-mono">← Back</button>
        <div>
          <h3 className="text-lg font-bold text-slate-800">Energy Appliance Analyzer</h3>
          <p className="text-[11px] text-slate-400 font-medium">Log major electricity draws</p>
        </div>
      </div>

      <div className="bg-white border rounded-3xl p-5 shadow-sm space-y-4">
        <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-widest">Active Appliances Log</h4>
        
        <div className="space-y-3.5">
          {[
            { id: "app-1", name: "Domestic Air Conditioner", kwh: "12.0 kWh / day", co2: 5.4, tip: "Thermostat to 25°C" },
            { id: "app-2", name: "Compression Refrigerator", kwh: "2.4 kWh / day", co2: 1.6, tip: "Clean coils for 10% gain" },
            { id: "app-3", name: "High-voltage Boiler", kwh: "4.5 kWh / day", co2: 2.0, tip: "Reduce boiler water heat" }
          ].map((app) => (
            <div key={app.id} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex justify-between items-center">
              <div>
                <h5 className="font-bold text-slate-800 text-xs">{app.name}</h5>
                <p className="text-[10px] text-slate-400 font-medium mt-1 font-mono uppercase">{app.kwh} • {app.co2} kg CO2e / run</p>
              </div>
              {!powerSaved[app.id] ? (
                <button
                  onClick={() => handleActionClick(app.id, app.name, app.co2 * 0.25)}
                  className="bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold px-3 py-1.5 rounded-xl text-xs shrink-0 select-none"
                >
                  Apply: {app.tip}
                </button>
              ) : (
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2 py-1 rounded-xl">
                  ✓ Optimized (-25%)
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ==================== S29: Travel Impact Routes comparison ==================== */
function TravelImpactView({ onBack, onAddCustomActivity }: { onBack: () => void; onAddCustomActivity: (act: Activity) => void }) {
  const [fromLocation, setFromLocation] = useState("Home");
  const [toLocation, setToLocation] = useState("Corporate Office");
  const [addedRow, setAddedRow] = useState<string | null>(null);

  const travelModes = [
    { mode: "car", label: "Combustion SUV", time: "32 mins", co2: 6.2, color: "text-rose-500", mult: 1 },
    { mode: "ev", label: "Electric EV Sedan", time: "35 mins", co2: 1.8, color: "text-blue-500", mult: 0.3 },
    { mode: "train", label: "Clean Commuter Rail", time: "45 mins", co2: 0.8, color: "text-indigo-500", mult: 0.1 },
    { mode: "bike", label: "Electric Bicycle", time: "40 mins", co2: 0.0, color: "text-emerald-500", mult: 0 },
    { mode: "walking", label: "Walking Footpath", time: "75 mins", co2: 0.0, color: "text-emerald-500", mult: 0 }
  ];

  const handleLoggedMode = (mode: string, val: number, name: string) => {
    onAddCustomActivity({
      id: "travel-" + Date.now(),
      title: `Chose clean transport: ${name}`,
      category: "transport",
      co2Value: Number((val - 6.2).toFixed(1)), // reduction difference compared to baseline gas car
      date: "2026-06-09",
      pointsEarned: 200
    });
    setAddedRow(mode);
    alert(`Saved Choice! Gained +200 XP EcoPoints multiplier!`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="bg-slate-100 p-2.5 rounded-xl hover:bg-slate-200 text-slate-500 text-xs font-bold font-mono">← Back</button>
        <div>
          <h3 className="text-lg font-bold text-slate-800">Travel Route Impact</h3>
          <p className="text-[11px] text-slate-400 font-medium font-mono">Compare localized travel avenues</p>
        </div>
      </div>

      {/* From-to grid selection inputs (S29) */}
      <div className="bg-white border rounded-3xl p-5 shadow-sm space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Commute From</label>
            <input 
              type="text" 
              value={fromLocation}
              onChange={(e) => setFromLocation(e.target.value)}
              className="w-full bg-slate-50 p-2.5 rounded-xl border text-slate-800 font-bold text-xs"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Commute To</label>
            <input 
              type="text" 
              value={toLocation}
              onChange={(e) => setToLocation(e.target.value)}
              className="w-full bg-slate-50 p-2.5 rounded-xl border text-slate-800 font-bold text-xs"
            />
          </div>
        </div>
      </div>

      {/* Travel options list comparing modes (S29) */}
      <div className="bg-white border rounded-3xl p-5 shadow-sm space-y-3">
        <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-widest">Route carbon comparisons</h4>
        
        <div className="divide-y space-y-1">
          {travelModes.map((item) => (
            <div key={item.mode} className="py-3 flex justify-between items-center first:pt-0 last:pb-0">
              <div>
                <span className="text-xs font-black text-slate-800">{item.label}</span>
                <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wide font-mono font-medium">{item.time} commute</p>
              </div>
              <div className="flex gap-4 items-center">
                <span className="text-xs font-extrabold text-slate-800 font-mono text-center">
                  {item.co2.toFixed(1)} kg CO₂
                </span>
                {addedRow !== item.mode ? (
                  <button
                    onClick={() => handleLoggedMode(item.mode, item.co2, item.label)}
                    className="bg-brand-50 hover:bg-brand-100 text-brand-700 font-extrabold px-3 py-1.5 rounded-xl text-[10px]"
                  >
                    Choose
                  </button>
                ) : (
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-md">
                    ✓ Logged
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ==================== S31: Family Dashboard ==================== */
function FamilyDashboardView({ onBack }: { onBack: () => void }) {
  const profile = useStore((state) => state.profile);
  const activities = useStore((state) => state.activities) || [];
  const totalSavedCo2 = Math.abs(activities.reduce((sum, act) => sum + (act.co2Value < 0 ? act.co2Value : 0), 0));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="bg-slate-100 p-2.5 rounded-xl hover:bg-slate-200 text-slate-500 text-xs font-bold font-mono">← Back</button>
        <div>
          <h3 className="text-lg font-bold text-slate-800">Family Eco Board</h3>
          <p className="text-[11px] text-slate-400 font-medium font-mono">Co-track family impact</p>
        </div>
      </div>

      <div className="bg-white border rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 text-3xl shadow-sm">👨‍👩‍👧‍👦</div>
        <h4 className="font-extrabold text-slate-850 text-base leading-none">Your Family Footprint Score</h4>
        <p className="text-3xl font-black text-slate-850 font-display">
          {(300 - totalSavedCo2).toFixed(0)} kg <span className="text-xs font-semibold text-slate-400">CO₂e / month</span>
        </p>
        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider border border-emerald-100 leading-none">
          -8% vs regional average family
        </span>

        {/* Family leaderboard listing (S31) */}
        <div className="w-full text-left space-y-3 pt-4 border-t border-slate-100">
          <p className="font-extrabold text-[10px] text-slate-400 uppercase tracking-widest mb-3">Family members rankings</p>
          {[
            { name: "Anita profile (Mom)", saved: "24 kg saved", stars: "⭐⭐⭐⭐", xp: "1,450 XP" },
            { name: "Rohan profile (Father)", saved: "18 kg saved", stars: "⭐⭐⭐", xp: "1,120 XP" },
            { name: `${profile?.name || "My profile"} (You)`, saved: `${totalSavedCo2.toFixed(1)} kg saved`, stars: "⭐⭐⭐⭐⭐", xp: `${(profile?.totalXP ?? profile?.xp ?? 0).toLocaleString()} XP` }
          ].map((member, i) => (
            <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <span className="text-xs font-bold text-slate-850">{member.name}</span>
                <p className="text-[10px] text-slate-400 mt-1">{member.saved} • {member.stars}</p>
              </div>
              <span className="text-xs font-bold text-brand-600 font-mono">{member.xp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ==================== S32: Organization Dashboard ==================== */
function OrganizationDashboardView({ onBack }: { onBack: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="bg-slate-100 p-2.5 rounded-xl hover:bg-slate-200 text-slate-500 text-xs font-bold font-mono">← Back</button>
        <div>
          <h3 className="text-lg font-bold text-slate-800 font-display">Organization Corporate Board</h3>
          <p className="text-[11px] text-slate-400 font-medium">Department carbon tracking analytics</p>
        </div>
      </div>

      <div className="bg-white border rounded-3xl p-5 shadow-sm space-y-6">
        
        <div className="flex justify-between items-center p-4 bg-emerald-600 rounded-2xl text-white">
          <div>
            <p className="text-[9px] font-bold text-emerald-100 uppercase tracking-widest leading-none">Acme Corp Footprint</p>
            <p className="text-2xl font-black mt-1 font-display">2,450 kg <span className="text-xs font-semibold text-emerald-100">CO₂e</span></p>
          </div>
          <span className="text-xs font-bold bg-white/20 px-2.5 py-1 rounded">Level 3 Green Group</span>
        </div>

        {/* Corporate Breakdown */}
        <div className="space-y-4">
          <p className="font-extrabold text-[10px] text-slate-400 uppercase tracking-widest">Departmental Breakdown</p>
          {[
            { dept: "Engineering Division", co2: "620 kg emissions", percent: 35, color: "bg-blue-500" },
            { dept: "Corporate Sales", co2: "980 kg emissions", percent: 25, color: "bg-rose-500" },
            { dept: "Human Resources Support", co2: "180 kg emissions", percent: 20, color: "bg-amber-500" },
            { dept: "Logistics", co2: "670 kg emissions", percent: 20, color: "bg-indigo-500" }
          ].map((item, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>{item.dept}</span>
                <span className="font-mono text-slate-500">{item.co2}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
                <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.percent}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ==================== S35: Carbon Timeline ==================== */
function CarbonTimelineView({ onBack }: { onBack: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="bg-slate-100 p-2.5 rounded-xl hover:bg-slate-200 text-slate-500 text-xs font-bold font-mono">← Back</button>
        <div>
          <h3 className="text-lg font-bold text-slate-800">Carbon Timeline</h3>
          <p className="text-[11px] text-slate-400 font-medium">Historical milestones logs</p>
        </div>
      </div>

      <div className="bg-white border rounded-3xl p-5 shadow-sm space-y-6">
        <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-widest">Commitment Timeline</h4>
        
        <div className="relative border-l border-slate-100 pl-4 ml-2 space-y-6">
          {[
            { date: "TODAY", title: "Walked 3 km today", desc: "Earned +20 XP. Bypassed vehicle emissions.", icon: "🌱" },
            { date: "MAY 11", title: "Completed Energy Appliance Audit", desc: "Lowered AC water heating settings.", icon: "⚡" },
            { date: "MAY 10", title: "Switched to plant-based meals", desc: "Reduced groceries recipe carbon load.", icon: "🥗" },
            { date: "MAY 9", title: "Setup EcoSphere AI Profile", desc: "Locked baseline metrics and initial data.", icon: "🌎" }
          ].map((item, id) => (
            <div key={id} className="relative">
              {/* Orb indicator dot */}
              <div className="absolute -left-[25px] top-0.5 w-4 h-4 rounded-full border bg-white flex items-center justify-center text-[10px] shadow-sm">
                ●
              </div>
              <div>
                <span className="text-[10px] font-black font-mono text-slate-400 tracking-wider block leading-none">{item.date}</span>
                <h5 className="font-bold text-slate-800 text-xs mt-1.5">{item.title}</h5>
                <p className="text-xs text-slate-550 mt-1 font-normal leading-normal">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ==================== S36: Carbon Heatmap ==================== */
function CarbonHeatmapView({ onBack }: { onBack: () => void }) {
  // Grid layout representing 5 rows (transport, food, energy, shopping, waste) and 7 columns (days)
  const rows = ["Transport", "Food", "Energy", "Shopping", "Waste"];
  const matrix = [
    [4, 2, 0, 1, 3, 0, 2], // transport
    [1, 3, 2, 0, 1, 1, 2], // food
    [0, 2, 4, 3, 2, 1, 0], // energy
    [1, 1, 0, 2, 1, 0, 1], // shopping
    [0, 0, 1, 1, 0, 0, 0]  // waste
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="bg-slate-100 p-2.5 rounded-xl hover:bg-slate-200 text-slate-500 text-xs font-bold font-mono">← Back</button>
        <div>
          <h3 className="text-lg font-bold text-slate-800">Carbon Intensity Grid</h3>
          <p className="text-[11px] text-slate-400 font-medium">Lifestyles emissions heatmap</p>
        </div>
      </div>

      <div className="bg-white border rounded-3xl p-5 shadow-sm space-y-4">
        <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-widest">Ecosystem Intensity Matrix</h4>
        
        <div className="space-y-4 font-mono select-none">
          <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">
            <span>Source Category</span>
            <div className="flex gap-1.5">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>

          <div className="space-y-3.5">
            {rows.map((row, rIdx) => (
              <div key={row} className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700 w-16 truncate">{row}</span>
                <div className="flex gap-2">
                  {matrix[rIdx].map((cell, cIdx) => (
                    <div 
                      key={cIdx} 
                      className={`w-7 h-7 rounded-lg border transition-all ${
                        cell === 0 ? 'bg-emerald-50 Border-emerald-100 text-emerald-700' :
                        cell === 1 ? 'bg-emerald-200 border-emerald-300 text-emerald-800' :
                        cell === 2 ? 'bg-amber-100 border-amber-200 text-amber-800' :
                        cell === 3 ? 'bg-rose-100 border-rose-200 text-rose-800' :
                        'bg-red-200 border-red-300 text-red-900 font-black'
                      } flex items-center justify-center text-[10px]`}
                    >
                      {cell}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center text-[10px] font-semibold text-slate-400 pt-3 border-t">
          <span>Low intensity (Green)</span>
          <span>High intensity (Red)</span>
        </div>
      </div>
    </div>
  );
}

/* ==================== S37: Eco Wallet ==================== */
function EcoWalletView({ onBack, onAddCustomActivity }: { onBack: () => void; onAddCustomActivity: (act: Activity) => void }) {
  const profile = useStore((state) => state.profile);
  const dbTransactions = useStore((state) => state.transactions);
  const addRewardTransaction = useStore((state) => state.addRewardTransaction);

  const points = profile?.ecoPoints || 0;

  // Dynamically map logs to scannable render items
  const transactions = [...dbTransactions].reverse().map(t => ({
    id: t.id,
    title: t.title,
    date: new Date(t.date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    pts: `${t.type === "earn" ? "+" : "-"}${t.points.toLocaleString()} Pts`,
    type: t.type
  }));

  const handleRedeemReward = async (title: string, cost: number) => {
    if (points < cost) {
      alert("Insufficient EcoPoints. Earn more by completing active challenges!");
      return;
    }
    
    // Redeem from unified reward ledger
    await addRewardTransaction(
      `Redeemed: ${title}`,
      cost,
      0, // 0 XP
      "marketplace"
    );

    alert(`Redeemed! Your promotional code has been allocated: ECO-${Math.random().toString(36).substr(2, 6).toUpperCase()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="bg-slate-100 p-2.5 rounded-xl hover:bg-slate-200 text-slate-500 text-xs font-bold font-mono">← Back</button>
        <div>
          <h3 className="text-lg font-bold text-slate-800">Eco Wallet</h3>
          <p className="text-[11px] text-slate-400 font-medium">Verify points balances and prizes</p>
        </div>
      </div>

      <div className="bg-gradient-to-tr from-brand-600 to-emerald-500 text-white rounded-3xl p-6 shadow-md text-center space-y-3 relative overflow-hidden">
        <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-widest">Active Points Wallet</p>
        <p className="text-4xl font-black font-display">{points.toLocaleString()} <span className="text-xs font-semibold text-emerald-100">EcoPoints</span></p>
        <p className="text-xs text-emerald-100 max-w-xs mx-auto leading-normal font-normal">Spend points on planting native forest saplings or shopping organic certified sustainable options.</p>
      </div>

      {/* Rewards Catalog */}
      <div className="bg-white border rounded-3xl p-5 shadow-sm space-y-4">
        <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-widest">Rewards Catalog</h4>
        
        <div className="space-y-3">
          {[
            { title: "Plant a native Cedar tree", cost: 1000, desc: "Plants a tree sapling in Madagascar with official coordinates." },
            { title: "10% Organic Grocery voucher", cost: 500, desc: "Promotional discount supported at partner markets." },
            { title: "Support 100 watt solar hours", cost: 750, desc: "Neutralizes appliance logs on the grid database." }
          ].map((r, i) => (
            <div key={i} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center gap-4">
              <div>
                <h5 className="font-bold text-xs text-slate-800">{r.title}</h5>
                <p className="text-[10px] text-slate-400 mt-1">{r.desc}</p>
                <span className="text-[10px] font-black text-emerald-600 font-mono mt-1.5 block">{r.cost} Pts required</span>
              </div>
              <button
                onClick={() => handleRedeemReward(r.title, r.cost)}
                className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold py-2 px-3 rounded-lg shrink-0"
              >
                Redeem
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction Records */}
      <div className="bg-white border rounded-3xl p-5 shadow-sm space-y-4">
        <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-widest">Transactions Record</h4>
        
        <div className="divide-y">
          {transactions.map((tx) => (
            <div key={tx.id} className="py-3 first:pt-0 last:pb-0 flex justify-between items-center">
              <div>
                <h5 className="font-bold text-xs text-slate-850">{tx.title}</h5>
                <span className="text-[9px] text-slate-400 mt-0.5 block">{tx.date}</span>
              </div>
              <span className={`text-xs font-bold font-mono ${tx.type === "earn" ? "text-emerald-600" : "text-rose-500"}`}>
                {tx.pts}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
