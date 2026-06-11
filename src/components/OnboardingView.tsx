import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User, Globe, Car, Utensils, Zap, ShoppingBag, Plane, CheckCircle } from "lucide-react";
import { UserProfile } from "../types";

interface OnboardingViewProps {
  onComplete: (profile: UserProfile) => void;
}

export default function OnboardingView({ onComplete }: OnboardingViewProps) {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    country: "United States",
    city: "",
    transportHabit: "car",
    foodHabit: "balanced",
    electricityHabit: "normal",
    shoppingHabit: "average",
    travelHabit: "rare-flights"
  });

  const nextStep = () => {
    if (step === 1 && (!formData.name || !formData.city)) {
      alert("Please fill in all profile fields to continue.");
      return;
    }
    setStep(step + 1);
  };
  const prevStep = () => setStep(step - 1);

  const handleSubmit = () => {
    // Generate initial carbon score and store locally
    const profile: UserProfile = {
      name: formData.name,
      age: parseInt(formData.age) || 25,
      country: formData.country,
      city: formData.city,
      level: 1,
      xp: 0,
      totalXP: 0,
      xpNeeded: 500,
      ecoPoints: 0,
      streak: 0, // Starting streak as per realism mandates: Day 0
      currentStreak: 0,
      levelRank: "Seedling Planter",
      hasCompletedOnboarding: true,
      transportHabit: formData.transportHabit,
      foodHabit: formData.foodHabit,
      electricityHabit: formData.electricityHabit,
      shoppingHabit: formData.shoppingHabit,
      travelHabit: formData.travelHabit
    };
    onComplete(profile);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-6 relative overflow-hidden flex flex-col justify-between min-h-[580px]">
        {/* Step dots header */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs font-semibold text-slate-400">Step {step} of 6</span>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${i === step ? "w-6 bg-brand-600" : "w-2 bg-slate-200"}`}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-grow flex flex-col justify-start"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-brand-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Tell us about yourself</h3>
              </div>
              <p className="text-sm text-slate-500 mb-6">
                Help us personalize calculations for your geographical climate sector.
              </p>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="onboarding-name"
                    className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5"
                  >
                    Your Name
                  </label>
                  <input
                    id="onboarding-name"
                    name="name"
                    aria-required="true"
                    type="text"
                    placeholder="e.g. Vivek"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 font-medium text-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="onboarding-age"
                    className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5"
                  >
                    Your Age
                  </label>
                  <input
                    id="onboarding-age"
                    name="age"
                    aria-required="true"
                    type="number"
                    placeholder="e.g. 24"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 font-medium text-slate-800 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="onboarding-country"
                      className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5"
                    >
                      Country
                    </label>
                    <input
                      id="onboarding-country"
                      name="country"
                      aria-required="true"
                      type="text"
                      placeholder="e.g. USA"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 font-medium text-slate-800 text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="onboarding-city"
                      className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5"
                    >
                      City
                    </label>
                    <input
                      id="onboarding-city"
                      name="city"
                      aria-required="true"
                      type="text"
                      placeholder="e.g. Boston"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 font-medium text-slate-800 text-sm"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-grow flex flex-col justify-start"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
                  <Car className="w-5 h-5 text-brand-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Transport Habits</h3>
              </div>
              <p className="text-sm text-slate-500 mb-6">
                How do you usually commute or travel locally?
              </p>

              <div className="space-y-3">
                {[
                  {
                    id: "car",
                    title: "Single Passenger Car / SUV",
                    desc: "Standard fossil combustion vehicle commute.",
                    value: "Sizable emissions"
                  },
                  {
                    id: "ev",
                    title: "Electric Vehicle (EV)",
                    desc: "Battery charged vehicle transit with cleaner footprint.",
                    value: "Moderate electrical impact"
                  },
                  {
                    id: "public",
                    title: "Public Transport (Bus/Train)",
                    desc: "Co-shared transit infrastructure.",
                    value: "Low carbon allocation"
                  },
                  {
                    id: "bike",
                    title: "Bicycle / Electric Scooter",
                    desc: "Micro-mobility clean transport habit.",
                    value: "Zero emissions, +XP multiplier"
                  },
                  {
                    id: "walking",
                    title: "Walking / Hybrid Foot travel",
                    desc: "No vehicles, purely healthy self-propelling.",
                    value: "100% sustainable"
                  }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setFormData({ ...formData, transportHabit: opt.id })}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between ${formData.transportHabit === opt.id ? "border-brand-500 bg-brand-50/50 text-brand-900 ring-2 ring-brand-400/20" : "border-slate-100 hover:bg-slate-50 text-slate-700"}`}
                  >
                    <div>
                      <p className="font-semibold text-sm">{opt.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{opt.desc}</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-white border border-slate-100 px-2 py-1 rounded-md shadow-sm text-emerald-600">
                      {opt.value}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-grow flex flex-col justify-start"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
                  <Utensils className="w-5 h-5 text-brand-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Diet & Nutrition Habits</h3>
              </div>
              <p className="text-sm text-slate-500 mb-6 font-medium">
                Diet forms over 20% of individual carbon footprint weights.
              </p>

              <div className="space-y-3">
                {[
                  {
                    id: "meat-heavy",
                    title: "Meat-Intensive Diet",
                    desc: "Consume red meat, lamb or dairy most days.",
                    co2: "High impact (~6.2kg CO2e / meal)"
                  },
                  {
                    id: "balanced",
                    title: "Balanced Diet",
                    desc: "Poultry, fish, occasional meat and vegetables.",
                    co2: "Medium impact (~3.6kg CO2e / meal)"
                  },
                  {
                    id: "vegetarian",
                    title: "Vegetarian Diet",
                    desc: "No meat or seafood, includes dairy and eggs.",
                    co2: "Lower impact (~2.1kg CO2e / meal)"
                  },
                  {
                    id: "vegan",
                    title: "Vegan Diet",
                    desc: "Strictly organic plants, grains and legume products.",
                    co2: "Zero direct lifecycle burden (~1.5kg)"
                  }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setFormData({ ...formData, foodHabit: opt.id })}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between ${formData.foodHabit === opt.id ? "border-brand-500 bg-brand-50/50 text-brand-900 ring-2 ring-brand-400/20" : "border-slate-100 hover:bg-slate-50 text-slate-700"}`}
                  >
                    <div>
                      <p className="font-semibold text-sm">{opt.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{opt.desc}</p>
                    </div>
                    <span className="text-[10px] font-bold bg-white border border-slate-100 px-2 py-1 rounded-md text-slate-500 shadow-sm">
                      {opt.co2}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-grow flex flex-col justify-start"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-brand-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Electricity & Utility Profiles</h3>
              </div>
              <p className="text-sm text-slate-500 mb-6">
                How do you manage domestic heating, cooling and appliances?
              </p>

              <div className="space-y-3">
                {[
                  {
                    id: "high-ac",
                    title: "High Cooling/AC Intensive",
                    desc: "Keep AC/heater on continuously throughout peak days.",
                    value: "High kWh"
                  },
                  {
                    id: "normal",
                    title: "Average Appliance Consumer",
                    desc: "Standard energy controls and thermostat values.",
                    value: "Normal load"
                  },
                  {
                    id: "saving",
                    title: "Active Energy Saver",
                    desc: "Switch off idle devices and utilize high-efficiency LEDs.",
                    value: "Very low load"
                  },
                  {
                    id: "solar",
                    title: "Solar Installed Homeowner",
                    desc: "Zero grid footprint, offsets standard neighborhood electricity usage.",
                    value: "+Offset active"
                  }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setFormData({ ...formData, electricityHabit: opt.id })}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between ${formData.electricityHabit === opt.id ? "border-brand-500 bg-brand-50/50 text-brand-900 ring-2 ring-brand-400/20" : "border-slate-100 hover:bg-slate-50 text-slate-700"}`}
                  >
                    <div>
                      <p className="font-semibold text-sm">{opt.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{opt.desc}</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase bg-white border border-slate-100 px-2 py-1 rounded-md shadow-sm text-emerald-600">
                      {opt.value}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="step-5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-grow flex flex-col justify-start"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
                  <Plane className="w-5 h-5 text-brand-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Flight & Vacation Travel</h3>
              </div>
              <p className="text-sm text-slate-500 mb-6">
                How frequently do you make medium or long-haul flight journeys per year?
              </p>

              <div className="space-y-3">
                {[
                  {
                    id: "frequent-flights",
                    title: "Frequent Business Flier",
                    desc: "Take more than 10 regional/intercontinental flights per year.",
                    factor: "+2500 kg CO2"
                  },
                  {
                    id: "occasional-flights",
                    title: "Occasional Vacation Flier",
                    desc: "Take 2 to 5 regional flights annually.",
                    factor: "+650 kg CO2"
                  },
                  {
                    id: "rare-flights",
                    title: "Rare Flier",
                    desc: "Take less than 2 regional flights annually.",
                    factor: "Minimal air impact"
                  },
                  {
                    id: "local-only",
                    title: "Local Staycations Only",
                    desc: "Travel entirely by trains, bus or local carpooling.",
                    factor: "Sustainable traveller"
                  }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setFormData({ ...formData, travelHabit: opt.id })}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between ${formData.travelHabit === opt.id ? "border-brand-500 bg-brand-50/50 text-brand-900 ring-2 ring-brand-400/20" : "border-slate-100 hover:bg-slate-50 text-slate-700"}`}
                  >
                    <div>
                      <p className="font-semibold text-sm">{opt.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{opt.desc}</p>
                    </div>
                    <span className="text-[10px] font-bold bg-white border border-slate-100 px-2 py-1 rounded-md text-slate-500 shadow-sm">
                      {opt.factor}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 6 && (
            <motion.div
              key="step-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-grow flex flex-col justify-center items-center text-center py-6"
            >
              <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-12 h-12 text-brand-600 animate-bounce" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800">Initializing Carbon Twin</h3>
              <p className="text-sm text-slate-500 mt-2 max-w-xs leading-relaxed">
                Thank you, <span className="font-bold text-slate-700">{formData.name}</span>. We've
                assessed your electricity, meals, and flight habits. EcoSphere AI is creating your
                localized baseline digital twin at **243 kg CO₂e / month**.
              </p>

              <div className="mt-8 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 w-full text-left">
                <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest text-center">
                  Starting Profile Bonuses
                </p>
                <div className="grid grid-cols-2 gap-2 mt-3 text-center">
                  <div className="bg-white p-2.5 rounded-xl border border-emerald-100 shadow-sm">
                    <p className="text-xs text-slate-400 font-semibold font-mono">ECO POINTS</p>
                    <p className="text-lg font-bold text-emerald-600 font-display">1,250 PTS</p>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-emerald-100 shadow-sm">
                    <p className="text-xs text-slate-400 font-semibold font-mono">LEVEL</p>
                    <p className="text-lg font-bold text-slate-800 font-display">LEVEL 8</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Controls */}
        <div className="flex gap-3 mt-8 pt-4 border-t border-slate-100">
          {step > 1 && (
            <button
              onClick={prevStep}
              className="px-5 py-3.5 bg-slate-100 text-slate-600 font-semibold rounded-2xl hover:bg-slate-200 transition-all font-mono text-sm"
            >
              Back
            </button>
          )}
          {step < 6 ? (
            <button
              onClick={nextStep}
              className="flex-grow py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-emerald-600/10 flex items-center justify-center gap-2"
            >
              <span>Continue</span>
              <span>→</span>
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex-grow py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-emerald-600/20 text-center"
            >
              Enter EcoSphere Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
