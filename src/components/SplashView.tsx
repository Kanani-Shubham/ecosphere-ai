import React from "react";
import { motion } from "motion/react";
import { Leaf, Globe, Shield, Sparkles, TrendingDown } from "lucide-react";

interface SplashViewProps {
  onStart: () => void;
}

export default function SplashView({ onStart }: SplashViewProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 via-emerald-50 to-brand-100 flex flex-col items-center justify-between p-6 overflow-hidden">
      {/* Decorative top lights */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-72 h-72 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none" />

      {/* Top Section: Logo & Branding */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="flex flex-col items-center text-center mt-12 z-10"
        id="splash-header"
      >
        <div className="w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/20 mb-4">
          <Leaf className="w-9 h-9 text-white" />
        </div>
        <h1 className="text-4xl font-bold font-display tracking-tight text-neutral-900 flex items-center gap-1">
          EcoSphere <span className="text-brand-600">AI</span>
        </h1>
        <p className="text-sm font-medium text-emerald-800 tracking-widest uppercase mt-1">
          Pioneering Human Ecology
        </p>
      </motion.div>

      {/* Center Section: Earth Orbit Animation */}
      <div className="relative w-72 h-72 flex items-center justify-center my-6 z-10" id="splash-globe">
        {/* Orbit paths */}
        <div className="absolute inset-0 border border-emerald-200/50 rounded-full animate-[spin_12s_linear_infinite]" />
        <div className="absolute w-56 h-56 border border-emerald-300/30 rounded-full -rotate-45" />

        {/* Floating eco items */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-4 left-1/2 -translate-x-1/2 p-2.5 bg-white shadow-md rounded-full border border-emerald-100"
        >
          <Leaf className="w-5 h-5 text-emerald-600" />
        </motion.div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-6 right-10 p-2.5 bg-white shadow-md rounded-full border border-emerald-100"
        >
          <TrendingDown className="w-5 h-5 text-emerald-500" />
        </motion.div>

        <motion.div
          animate={{ x: [0, -8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute left-6 top-1/3 p-2.5 bg-white shadow-md rounded-full border border-emerald-100"
        >
          <Sparkles className="w-5 h-5 text-amber-500" />
        </motion.div>

        {/* Glowing Central Earth Component */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, delay: 0.3 }}
          className="w-48 h-48 bg-radial from-emerald-400 to-emerald-700 rounded-full shadow-2xl flex items-center justify-center p-3 overflow-hidden animate-pulse-slow border-4 border-white/60 relative"
        >
          {/* Custom vector styling mimicking visual map continents */}
          <Globe className="w-full h-full text-brand-100/30 absolute stroke-[1.2]" />
          <div className="absolute w-12 h-6 bg-brand-200/30 rounded-full blur-sm top-8 left-10 transform -rotate-12" />
          <div className="absolute w-14 h-8 bg-brand-300/20 rounded-full blur-sm bottom-12 right-6 transform rotate-45" />
          
          <div className="z-10 text-center flex flex-col items-center">
            <span className="text-3xl font-bold text-white drop-shadow">243</span>
            <span className="text-xs font-semibold text-emerald-100 uppercase tracking-wider drop-shadow-sm">kg CO₂e</span>
          </div>
        </motion.div>
      </div>

      {/* Bottom Section: Tagline & Onboarding triggers */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="w-full max-w-sm flex flex-col items-center text-center mt-auto mb-6 z-10"
        id="splash-footer"
      >
        <h2 className="text-xl font-bold text-neutral-800 tracking-tight">
          Understand. Track. Reduce.
        </h2>
        <p className="text-sm text-neutral-600 mt-2 max-w-xs leading-relaxed">
          Unlock personalized eco plans and step on your automated journey to save carbon impact.
        </p>

        <button
          onClick={onStart}
          className="mt-8 w-full py-4 px-6 bg-brand-600 hover:bg-brand-700 active:transform active:scale-[0.98] transition-all text-white font-semibold rounded-2xl shadow-xl shadow-brand-600/35 flex items-center justify-center gap-3"
          id="btn-start-journey"
        >
          <span>Start Journey</span>
          <motion.span
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            →
          </motion.span>
        </button>

        <p className="text-xs text-neutral-500 mt-4 font-medium">
          Already have an account? <span className="text-brand-600 hover:underline cursor-pointer" onClick={onStart}>Login</span>
        </p>
      </motion.div>
    </div>
  );
}
