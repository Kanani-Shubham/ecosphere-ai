import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, Target, Bell, Settings, ShieldCheck, ChevronRight, HelpCircle, LogOut,
  Plus, Check, Trash2, Shield, Eye, Globe, Database, ToggleLeft, ToggleRight,
  Camera, RotateCw, ZoomIn, Info, AlertCircle
} from "lucide-react";
import { UserProfile, Goal } from "../types";
import { useStore } from "../lib/store";

interface ProfileViewProps {
  profile: UserProfile;
  goals: Goal[];
  onAddGoal: (goal: Goal) => void;
  onToggleGoalComplete: (id: string) => void;
  onClearGoals: () => void;
  onResetApp: () => void;
}

export default function ProfileView({
  profile,
  goals,
  onAddGoal,
  onToggleGoalComplete,
  onClearGoals,
  onResetApp
}: ProfileViewProps) {
  // Navigation: 'main' | 'goals' | 'notifications' | 'settings' | 'admin' | 'edit_profile'
  const [panelMode, setPanelMode] = useState<'main' | 'goals' | 'notifications' | 'settings' | 'admin' | 'edit_profile'>('main');

  // Read streak and totalXP reactively from the central Zustand user store for consistency
  const currentStreak = useStore((state) => state.user?.currentStreak) ?? useStore.getState().user?.currentStreak ?? profile.currentStreak ?? profile.streak ?? 0;
  const totalXP = useStore((state) => state.user?.totalXP) ?? useStore.getState().user?.totalXP ?? profile.totalXP ?? profile.xp ?? 0;

  const updateProfile = useStore((state) => state.updateProfile);

  // Profile Edit temporary states
  const [editName, setEditName] = useState(profile.name || "");
  const [editUsername, setEditUsername] = useState(profile.username || "");
  const [editEmail, setEditEmail] = useState(profile.email || "");
  const [editPhone, setEditPhone] = useState(profile.phone || "");
  const [editBio, setEditBio] = useState(profile.bio || "");
  const [editCity, setEditCity] = useState(profile.city || "");
  const [editCountry, setEditCountry] = useState(profile.country || "");
  const [editLifestyle, setEditLifestyle] = useState(profile.lifestyleType || "Standard");
  const [editDiet, setEditDiet] = useState(profile.dietPreference || "Balanced");
  const [editTransport, setEditTransport] = useState(profile.transportationPreference || "Gasoline Car");
  const [editGoals, setEditGoals] = useState(profile.sustainabilityGoals || "");
  const [editImage, setEditImage] = useState<string | null>(profile.profileImage || null);

  // Cropper states
  const [cropZoom, setCropZoom] = useState(1);
  const [cropRotation, setCropRotation] = useState(0); // 0, 90, 180, 270
  const [validationError, setValidationError] = useState<string | null>(null);

  // Canvas element ref for scale, rotate, compression preview
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sync state with parent profile prop when opening edit panel
  useEffect(() => {
    if (panelMode === 'edit_profile') {
      setEditName(profile.name || "");
      setEditUsername(profile.username || "");
      setEditEmail(profile.email || "");
      setEditPhone(profile.phone || "");
      setEditBio(profile.bio || "");
      setEditCity(profile.city || "");
      setEditCountry(profile.country || "");
      setEditLifestyle(profile.lifestyleType || "Standard");
      setEditDiet(profile.dietPreference || "Balanced");
      setEditTransport(profile.transportationPreference || "Gasoline Car");
      setEditGoals(profile.sustainabilityGoals || "");
      setEditImage(profile.profileImage || null);
      setValidationError(null);
    }
  }, [panelMode, profile]);

  // Canvas real-time generator based on Zoom and Rotation sliders
  useEffect(() => {
    if (!editImage || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      const size = 160;
      canvas.width = size;
      canvas.height = size;
      ctx.clearRect(0, 0, size, size);

      ctx.save();
      ctx.translate(size / 2, size / 2);
      ctx.rotate((cropRotation * Math.PI) / 180);
      
      const drawWidth = size * cropZoom;
      const drawHeight = size * cropZoom;
      ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
      ctx.restore();
    };
    img.src = editImage;
  }, [editImage, cropZoom, cropRotation]);

  // Detect unsaved changes
  const hasUnsavedChanges = 
    editName !== (profile.name || "") ||
    editUsername !== (profile.username || "") ||
    editEmail !== (profile.email || "") ||
    editPhone !== (profile.phone || "") ||
    editBio !== (profile.bio || "") ||
    editCity !== (profile.city || "") ||
    editCountry !== (profile.country || "") ||
    editLifestyle !== (profile.lifestyleType || "Standard") ||
    editDiet !== (profile.dietPreference || "Balanced") ||
    editTransport !== (profile.transportationPreference || "Gasoline Car") ||
    editGoals !== (profile.sustainabilityGoals || "") ||
    editImage !== (profile.profileImage || null);

  // Handle Photo Selector
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setEditImage(event.target?.result as string);
      setCropZoom(1);
      setCropRotation(0);
    };
    reader.readAsDataURL(file);
  };

  // Generate cropped jpeg string & save
  const handleApplyCrop = () => {
    if (!canvasRef.current) return;
    const croppedBase64 = canvasRef.current.toDataURL("image/jpeg", 0.7);
    setEditImage(croppedBase64);
    alert("Profile image cropped and optimized successfully! Save Profile to persist.");
  };

  // Save the full profile fields
  const handleProfileSave = async () => {
    // Validation
    if (editName.trim().length < 3) {
      setValidationError("Name must be at least 3 characters long.");
      return;
    }
    if (editUsername.trim().length < 3) {
      setValidationError("Username must be at least 3 characters long.");
      return;
    }
    if (editUsername.includes(" ")) {
      setValidationError("Username cannot contain spaces.");
      return;
    }
    if (editEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editEmail)) {
      setValidationError("Please specify a valid email address.");
      return;
    }

    try {
      await updateProfile({
        name: editName,
        username: editUsername,
        email: editEmail,
        phone: editPhone,
        bio: editBio,
        city: editCity,
        country: editCountry,
        lifestyleType: editLifestyle as any,
        dietPreference: editDiet as any,
        transportationPreference: editTransport as any,
        sustainabilityGoals: editGoals,
        profileImage: editImage || undefined
      });
      setValidationError(null);
      setPanelMode("main");
      alert("Climate Profile updated successfully! Changes saved to persistent IndexedDB.");
    } catch (err) {
      setValidationError("Failed to save changes. IndexedDB commit failed.");
    }
  };

  // Input states for generating goals
  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalCategory, setNewGoalCategory] = useState<any>("transport");
  const [newGoalTarget, setNewGoalTarget] = useState("");

  // Bind settings directly to external Zustand state with persistent indices
  const settings = useStore((state) => state.settings);
  const saveSettings = useStore((state) => state.saveSettings);

  // Handle adding custom goal
  const handleAddGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalName.trim() || !newGoalTarget) return;

    onAddGoal({
      id: "goal-" + Date.now(),
      title: newGoalName,
      category: newGoalCategory,
      targetValue: parseFloat(newGoalTarget),
      currentValue: 0,
      deadline: "2026-12-31",
      completed: false
    });

    setNewGoalName("");
    setNewGoalTarget("");
  };

  return (
    <div className="w-full pb-24">
      <AnimatePresence mode="wait">
        
        {/* VIEW 1: Main Profile Center (S12) */}
        {panelMode === "main" && (
          <motion.div
            key="panel-main"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Upper Avatar card (S12 style) */}
            <div className="bg-gradient-to-tr from-brand-600 to-emerald-500 rounded-3xl p-6 text-white shadow-md text-center flex flex-col items-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-24 h-24 bg-white/5 rounded-full pointer-events-none -translate-x-6 -translate-y-6" />
              
              <div className="w-18 h-18 rounded-full border-4 border-white bg-brand-100 flex items-center justify-center overflow-hidden font-black text-brand-800 text-2.5xl shadow-sm shrink-0">
                {profile.profileImage ? (
                  <img src={profile.profileImage} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  profile.name[0]?.toUpperCase()
                )}
              </div>
              <h3 className="text-xl font-bold mt-3 font-display">{profile.name}</h3>
              <p className="text-xs text-emerald-100 font-semibold mt-0.5 uppercase tracking-wider">{profile.levelRank} • Level {profile.level}</p>

              {/* Achievements banner summary */}
              <div className="grid grid-cols-3 gap-2 bg-white/10 rounded-2xl p-3.5 w-full mt-5 text-center text-xs">
                <div>
                  <p className="font-extrabold text-sm">{totalXP}</p>
                  <p className="text-[10px] text-emerald-100/90 mt-0.5 leading-none">XP</p>
                </div>
                <div className="border-x border-white/15">
                  <p className="font-extrabold text-sm">{useStore.getState().badges.filter(b => b.unlocked).length}</p>
                  <p className="text-[10px] text-emerald-100/90 mt-0.5 leading-none">Badges</p>
                </div>
                <div>
                  <p className="font-extrabold text-sm">{currentStreak}</p>
                  <p className="text-[10px] text-emerald-100/90 mt-0.5 leading-none">Streak</p>
                </div>
              </div>
            </div>

            {/* List links section (S12) */}
            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
              {[
                { label: "Edit Profile Info", desc: "Change name, contact, lifestyle preferences", icon: User, action: () => setPanelMode("edit_profile") },
                { label: "My Goals", desc: "Manage personal climate targets", icon: Target, action: () => setPanelMode("goals") },
                { label: "Notification Center", desc: "Alerts, streaks, milestone logs", icon: Bell, action: () => setPanelMode("notifications") },
                { label: "App Settings", desc: "Change language, theme, system logs", icon: Settings, action: () => setPanelMode("settings") },
                { label: "Local DB Diagnostics", desc: "Monitor localized IndexedDB telemetry", icon: ShieldCheck, action: () => setPanelMode("admin") }
              ].map((link, i) => {
                const Icon = link.icon;
                return (
                  <div 
                    key={i} 
                    onClick={link.action}
                    className="flex justify-between items-center p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-all cursor-pointer"
                  >
                    <div className="flex gap-3.5 items-center">
                      <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-850">{link.label}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-none">{link.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-350 shrink-0" />
                  </div>
                );
              })}
            </div>

            {/* Help & Logout / Reset Area */}
            <div className="flex gap-3">
              <button
                onClick={() => alert("Frequently asked questions & carbon manuals can be requested at help@ecosphere-ai.com.")}
                className="flex-1 py-3.5 border border-slate-250 hover:bg-slate-50 rounded-xl font-bold text-xs text-slate-600 transition-all flex items-center justify-center gap-1.5 leading-none select-none"
              >
                <HelpCircle className="w-4.5 h-4.5" /> Help Support
              </button>
              <button
                onClick={onResetApp}
                className="flex-1 py-3.5 border border-rose-200 hover:bg-rose-50 rounded-xl font-bold text-xs text-rose-600 transition-all flex items-center justify-center gap-1.5 leading-none select-none"
              >
                <LogOut className="w-4.5 h-4.5" /> Reset Profile
              </button>
            </div>
          </motion.div>
        )}

        {/* VIEW 2: Goal Center (S18) */}
        {panelMode === "goals" && (
          <motion.div
            key="panel-goals"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* Header control */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setPanelMode("main")}
                className="bg-slate-100 p-2.5 rounded-xl hover:bg-slate-200 transition-all font-bold text-xs text-slate-600"
              >
                ← Profile
              </button>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Goal Center</h3>
                <p className="text-[11px] text-slate-400 font-medium leading-none">Configure custom carbon benchmarks</p>
              </div>
            </div>

            {/* Add Custom Goal form (S18) */}
            <form onSubmit={handleAddGoalSubmit} className="bg-white border rounded-3xl p-5 shadow-sm space-y-4">
              <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-widest">Create New Goal</h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Goal Metric Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Save 30 kg transport emissions"
                    value={newGoalName}
                    onChange={(e) => setNewGoalName(e.target.value)}
                    className="w-full bg-slate-50 border p-3 rounded-xl focus:outline-none focus:border-brand-500 text-xs font-semibold text-slate-850"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Category</label>
                  <select
                    value={newGoalCategory}
                    onChange={(e) => setNewGoalCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border p-3 rounded-xl text-xs font-bold text-slate-700"
                  >
                    <option value="transport">Transport</option>
                    <option value="food">Food</option>
                    <option value="energy">Energy</option>
                    <option value="shopping">Shopping</option>
                    <option value="waste">Waste</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Target Reduction (kg)</label>
                  <input
                    type="number"
                    placeholder="e.g. 30"
                    value={newGoalTarget}
                    onChange={(e) => setNewGoalTarget(e.target.value)}
                    className="w-full bg-slate-50 border p-3 rounded-xl focus:outline-none focus:border-brand-500 text-xs font-semibold text-slate-850"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-extrabold py-3.5 rounded-xl text-xs shadow shadow-emerald-600/10 transition-all select-none"
              >
                + Add Goal Target
              </button>
            </form>

            {/* List active/completed goals (S18) */}
            <div className="bg-white rounded-3xl border p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">Active Goals Progress</h4>
                <button 
                  onClick={onClearGoals}
                  className="text-[10px] font-bold text-rose-600"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-4">
                {goals.map((g) => {
                  const percent = Math.min(100, Math.round((g.currentValue / g.targetValue) * 100));
                  return (
                    <div key={g.id} className="p-3.5 bg-slate-50/50 rounded-2xl border border-slate-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-wide bg-brand-50 text-brand-700 px-2 py-0.5 rounded-md">{g.category}</span>
                          <h5 className="font-bold text-xs text-slate-850 mt-1.5">{g.title}</h5>
                        </div>
                        
                        {!g.completed ? (
                          <button
                            onClick={() => onToggleGoalComplete(g.id)}
                            className="bg-brand-50 hover:bg-brand-100 text-brand-700 p-1.5 rounded-xl text-xs font-bold flex items-center shrink-0"
                          >
                            Complete
                          </button>
                        ) : (
                          <span className="text-emerald-700 text-xs font-extrabold flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-xl">
                            <Check className="w-3.5 h-3.5" /> Done
                          </span>
                        )}
                      </div>

                      <div className="mt-3.5 space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold text-slate-400 font-mono">
                          <span>Progress: {percent}%</span>
                          <span>{g.currentValue} / {g.targetValue} kg CO₂</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-500 rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* VIEW 3: Updates & Notifications Center (S21) */}
        {panelMode === "notifications" && (
          <motion.div
            key="panel-notifications"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setPanelMode("main")}
                className="bg-slate-100 p-2.5 rounded-xl hover:bg-slate-200 transition-all font-bold text-xs text-slate-600"
              >
                ← Profile
              </button>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Notification Center</h3>
                <p className="text-[11px] text-slate-400 font-medium leading-none font-mono">Smart notifications triggers</p>
              </div>
            </div>

            {/* List historic alerts */}
            <div className="space-y-3" id="notifications-feed">
              {[
                { title: "Mission Completed!", detail: "You completed active green transit, earning +25 XP & 100 Points.", time: "10m ago" },
                { title: "Streak Milestone Achieved", detail: "Congratulations on logging your active green commute for 12 days straight!", time: "1h ago" },
                { title: "New Achievement Unlocked", detail: "EcoSphere created your profile and unlocked 'Green Starter' badge collection.", time: "2h ago" },
                { title: "Weekly Report Ready", detail: "June Carbon audit is formulated and ready for PDF generation on Stats tab.", time: "4h ago" }
              ].map((notif, idx) => (
                <div key={idx} className="bg-white border rounded-2xl p-4 shadow-sm flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800 text-xs">{notif.title}</h5>
                    <p className="text-xs text-slate-500 mt-1 leading-normal">{notif.detail}</p>
                    <span className="text-[9px] text-slate-400 font-bold uppercase mt-2 block">{notif.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* VIEW 4: App Configuration / Settings (S23) */}
        {panelMode === "settings" && (
          <motion.div
            key="panel-settings"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setPanelMode("main")}
                className="bg-slate-100 p-2.5 rounded-xl hover:bg-slate-200 transition-all font-bold text-xs text-slate-600"
              >
                ← Profile
              </button>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Application Settings</h3>
                <p className="text-[11px] text-slate-400 font-medium leading-none">Formulate system values</p>
              </div>
            </div>

            {/* Form list elements (S23) */}
            <div className="bg-white border rounded-3xl overflow-hidden shadow-sm divide-y">
              
              <div className="p-4 flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-slate-800">Carbon Units</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Measurement scale metrics</p>
                </div>
                <span className="text-xs font-bold text-slate-600 font-mono bg-slate-100 py-1 px-2.5 rounded-lg">kg CO₂e</span>
              </div>

              <div className="p-4 flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-slate-800">Interface Theme</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Optimized light mode display</p>
                </div>
                <span className="text-xs font-bold text-emerald-700 font-mono bg-emerald-50 py-1 px-2.5 rounded-lg border border-emerald-100">Light Mode</span>
              </div>

              <div className="p-4 flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-slate-800">Smart Notifications</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Weekly stats and active streak alerts</p>
                </div>
                <button onClick={() => saveSettings({ dailyReminder: !settings?.dailyReminder })}>
                  {settings?.dailyReminder ? <ToggleRight className="w-8 h-8 text-emerald-600 cursor-pointer" /> : <ToggleLeft className="w-8 h-8 text-slate-350 cursor-pointer" />}
                </button>
              </div>

              <div className="p-4 flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-slate-800">AI Personalization</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Unlock Gemini custom suggestions</p>
                </div>
                <button onClick={() => saveSettings({ achievementAlerts: !settings?.achievementAlerts })}>
                  {settings?.achievementAlerts ? <ToggleRight className="w-8 h-8 text-emerald-600 cursor-pointer" /> : <ToggleLeft className="w-8 h-8 text-slate-350 cursor-pointer" />}
                </button>
              </div>

              <div className="p-4 flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-slate-800">Interface Language</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Internationalization systems</p>
                </div>
                <select 
                  value={settings?.language || "en"} 
                  onChange={(e) => saveSettings({ language: e.target.value as any })}
                  className="bg-slate-50 border p-2 rounded-xl text-xs font-bold text-slate-700 font-sans"
                >
                  <option value="en">English</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                  <option value="gu">ગુજરાતી (Gujarati)</option>
                  <option value="es">Español (Spanish)</option>
                  <option value="fr">Français (French)</option>
                  <option value="de">Deutsch (German)</option>
                  <option value="ar">العربية (Arabic)</option>
                  <option value="zh">中文 (Chinese)</option>
                </select>
              </div>

            </div>
          </motion.div>
        )}

        {/* VIEW 5: Local DB Diagnostics Portal (No dummy numbers) */}
        {panelMode === "admin" && (
          <motion.div
            key="panel-admin"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setPanelMode("main")}
                className="bg-slate-100 p-2.5 rounded-xl hover:bg-slate-200 transition-all font-bold text-xs text-slate-600"
              >
                ← Profile
              </button>
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-1.5 font-display">
                  Local DB Diagnostics <span className="text-[9px] bg-emerald-50 border border-emerald-100 text-emerald-700 font-mono px-2 py-0.5 rounded-md select-none uppercase">Persistent Registry</span>
                </h3>
                <p className="text-[11px] text-slate-400 font-medium leading-none">Internal IndexedDB metadata structures</p>
              </div>
            </div>

            {/* Telemetry Metrics Row (Dynamic counts from database) */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white border rounded-2xl p-3 shadow-sm select-none text-slate-800">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Logged Actions</p>
                <p className="text-lg font-extrabold text-slate-800 mt-1">{(goals?.length || 0) + (useStore.getState().activities?.length || 0)}</p>
                <p className="text-[8px] text-emerald-600 mt-0.5 font-semibold">● Active State</p>
              </div>

              <div className="bg-white border rounded-2xl p-3 shadow-sm select-none text-slate-800">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Eco Activities</p>
                <p className="text-lg font-extrabold text-slate-800 mt-1">{useStore.getState().activities?.length || 0}</p>
                <p className="text-[8px] text-slate-400 mt-0.5">Stored local records</p>
              </div>

              <div className="bg-white border rounded-2xl p-3 shadow-sm select-none text-slate-800">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Badges Unleased</p>
                <p className="text-lg font-extrabold text-emerald-600 mt-1">{useStore.getState().badges.filter(b => b.unlocked).length}</p>
                <p className="text-[8px] text-emerald-650 mt-0.5 font-semibold">Earned milestone unlocks</p>
              </div>
            </div>

            {/* Quick telemetry logs of activities */}
            <div className="bg-white border rounded-3xl p-5 shadow-sm space-y-4 text-slate-800">
              <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">Local IndexedDB Storage Schema</h4>
              
              <div className="space-y-2.5">
                {[
                  { label: "Active Climate Goals persistent rows", value: `${goals?.length || 0} items` },
                  { label: "Social community feed elements", value: `${useStore.getState().community?.length || 0} verified posts` },
                  { label: "Client notifications registry count", value: `${useStore.getState().notifications?.length || 0} logged rows` },
                  { label: "User eco XP rating", value: `${totalXP} total XP` }
                ].map((item, id) => (
                  <div key={id} className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[11px] text-slate-600 font-semibold">{item.label}</span>
                    <span className="text-xs font-bold text-slate-800 font-mono text-right">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* VIEW 6: Editable Profile Complete Rebuild (S12 custom fields) */}
        {panelMode === "edit_profile" && (
          <motion.div
            key="panel-edit-profile"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 text-slate-800"
          >
            {/* Header control */}
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {
                    if (hasUnsavedChanges) {
                      if (!confirm("Discard unsaved changes? Your inputs will be lost.")) return;
                    }
                    setPanelMode("main");
                  }}
                  className="bg-slate-100 p-2 text-slate-600 rounded-xl hover:bg-slate-200 text-xs font-bold transition-all"
                >
                  ← Discard
                </button>
                <div>
                  <h3 className="text-sm font-bold">Edit Climate Profile</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Verify credentials & lifestyle indicators</p>
                </div>
              </div>

              {hasUnsavedChanges && (
                <span className="bg-amber-50 text-amber-700 text-[9px] font-extrabold uppercase px-2 py-1 rounded-full border border-amber-200 animate-pulse">
                  ⚠️ Unsaved Changes
                </span>
              )}
            </div>

            {validationError && (
              <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl flex items-center gap-2 text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="text-[11px] font-semibold">{validationError}</span>
              </div>
            )}

            {/* Profile Avatar Crop / Rotate section */}
            <div className="bg-white border rounded-3xl p-5 shadow-sm space-y-4">
              <h4 className="font-extrabold text-[11px] text-slate-400 uppercase tracking-widest">Profile Picture Optimizer</h4>
              
              <div className="flex flex-col sm:flex-row gap-5 items-center">
                {/* Real-time scaled canvas cropper view wrapper */}
                <div className="relative w-40 h-40 rounded-full border-2 border-slate-150 overflow-hidden bg-slate-50 flex items-center justify-center">
                  {editImage ? (
                    <canvas ref={canvasRef} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-slate-400">
                      <Camera className="w-10 h-10 mx-auto" />
                      <span className="text-[10px] uppercase font-bold tracking-wider mt-1 block">No Image</span>
                    </div>
                  )}
                </div>

                {/* Optimizing controls */}
                <div className="flex-1 space-y-3.5 w-full">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                      1. Upload Source Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-extrabold file:uppercase file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                    />
                  </div>

                  {editImage && (
                    <>
                      {/* Zoom control slider range */}
                      <div>
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                          <span>ZOOM SCALE</span>
                          <span>{cropZoom.toFixed(1)}x</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="3"
                          step="0.1"
                          value={cropZoom}
                          onChange={(e) => setCropZoom(parseFloat(e.target.value))}
                          className="w-full accent-emerald-500 h-1 bg-slate-100 rounded-full cursor-pointer mt-1"
                        />
                      </div>

                      {/* Rotate triggers */}
                      <div className="flex justify-between items-center bg-slate-50 p-2 rounded-xl border border-slate-100 font-sans">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Rotation Control</span>
                        <button
                          type="button"
                          onClick={() => setCropRotation((prev) => (prev + 90) % 360)}
                          className="p-1 text-slate-600 hover:text-brand-600 flex items-center gap-1 text-[10px] font-bold uppercase transition-all"
                        >
                          <RotateCw className="w-3.5 h-3.5" /> {cropRotation}°
                        </button>
                      </div>

                      {/* Compress trigger */}
                      <button
                        type="button"
                        onClick={handleApplyCrop}
                        className="w-full py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-[10px] font-extrabold uppercase border border-emerald-100 transition-all select-none leading-none"
                      >
                        Apply crop & Compression (Optimized JPEG)
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Profile fields form */}
            <div className="bg-white border rounded-3xl p-5 shadow-sm space-y-4">
              <h4 className="font-extrabold text-[11px] text-slate-400 uppercase tracking-widest">Personal Identification</h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Display Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full bg-slate-50 border p-2.5 rounded-xl focus:outline-none focus:border-brand-500 text-xs font-semibold text-slate-800"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Username</label>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    placeholder="janedoe"
                    className="w-full bg-slate-50 border p-2.5 rounded-xl focus:outline-none focus:border-brand-500 text-xs font-semibold text-slate-800"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Email ID</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="jane@eco.com"
                    className="w-full bg-slate-50 border p-2.5 rounded-xl focus:outline-none focus:border-brand-500 text-xs font-semibold text-slate-800"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="+1 (555) 010-2834"
                    className="w-full bg-slate-50 border p-2.5 rounded-xl focus:outline-none focus:border-brand-500 text-xs font-semibold text-slate-800"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">City</label>
                  <input
                    type="text"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    placeholder="San Francisco"
                    className="w-full bg-slate-50 border p-2.5 rounded-xl focus:outline-none focus:border-brand-500 text-xs font-semibold text-slate-800"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Country</label>
                  <input
                    type="text"
                    value={editCountry}
                    onChange={(e) => setEditCountry(e.target.value)}
                    placeholder="United States"
                    className="w-full bg-slate-50 border p-2.5 rounded-xl focus:outline-none focus:border-brand-500 text-xs font-semibold text-slate-800"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Bio Description</label>
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Tell the climate community about your green energy passions..."
                    className="w-full bg-slate-50 border p-2.5 rounded-xl focus:outline-none focus:border-brand-500 text-xs font-semibold text-slate-800 h-16 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Lifestyle preferences section */}
            <div className="bg-white border rounded-3xl p-5 shadow-sm space-y-4">
              <h4 className="font-extrabold text-[11px] text-slate-400 uppercase tracking-widest">Habit Preferences</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Lifestyle Type</label>
                  <select
                    value={editLifestyle}
                    onChange={(e) => setEditLifestyle(e.target.value)}
                    className="w-full bg-slate-50 border p-2.5 rounded-xl text-xs font-bold text-slate-700 font-sans"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Low Carbon">Low Carbon</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Dietary Preference</label>
                  <select
                    value={editDiet}
                    onChange={(e) => setEditDiet(e.target.value)}
                    className="w-full bg-slate-50 border p-2.5 rounded-xl text-xs font-bold text-slate-700 font-sans"
                  >
                    <option value="Balanced">Balanced</option>
                    <option value="Plant-Based">Plant-Based</option>
                    <option value="Meat-Reduced">Meat-Reduced</option>
                    <option value="High Protein">High Protein</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Main Transport</label>
                  <select
                    value={editTransport}
                    onChange={(e) => setEditTransport(e.target.value)}
                    className="w-full bg-slate-50 border p-2.5 rounded-xl text-xs font-bold text-slate-700 font-sans"
                  >
                    <option value="Gasoline Car">Gasoline Car</option>
                    <option value="Electric Vehicle">Electric Vehicle</option>
                    <option value="Public Transit">Public Transit</option>
                    <option value="Bicycle">Bicycle</option>
                  </select>
                </div>

                <div className="col-span-1 sm:col-span-3">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Personal Sustainability Goals</label>
                  <input
                    type="text"
                    value={editGoals}
                    onChange={(e) => setEditGoals(e.target.value)}
                    placeholder="Compost daily, walk commute twice a week..."
                    className="w-full bg-slate-50 border p-2.5 rounded-xl focus:outline-none focus:border-brand-500 text-xs font-semibold text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Sticky Action buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  if (hasUnsavedChanges) {
                    if (!confirm("Discard unsaved edits?")) return;
                  }
                  setPanelMode("main");
                }}
                className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProfileSave}
                disabled={!hasUnsavedChanges}
                className={`flex-1 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                  hasUnsavedChanges 
                    ? 'bg-brand-600 hover:bg-brand-700 text-white shadow shadow-emerald-400/10' 
                    : 'bg-slate-150 text-slate-400 cursor-not-allowed'
                }`}
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
