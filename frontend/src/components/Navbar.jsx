import React from 'react';
import { ShieldAlert, Cpu, Info, Activity, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar({ activeTab, setActiveTab }) {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#080b11]/80 border-b border-white/10 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('detector')}>
          <div className="relative">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 blur-sm opacity-70 animate-pulse"></div>
            <div className="relative bg-slate-950 p-2.5 rounded-2xl border border-white/10 text-indigo-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
                TrustLens<span className="text-indigo-500 font-extrabold">.XAI</span>
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                Phase 1
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Explainable Fake Review Detection System</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-3">
          <div className="bg-slate-900/90 p-1.5 rounded-2xl border border-white/10 flex space-x-1 shadow-inner">
            <button
              onClick={() => setActiveTab('detector')}
              className={`relative flex items-center space-x-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeTab === 'detector'
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {activeTab === 'detector' && (
                <motion.div
                  layoutId="activeTabBadge"
                  className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/30"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                <span>Detector & Explainability</span>
              </span>
            </button>

            <button
              onClick={() => setActiveTab('about')}
              className={`relative flex items-center space-x-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeTab === 'about'
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {activeTab === 'about' && (
                <motion.div
                  layoutId="activeTabBadge"
                  className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/30"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Info className="w-4 h-4" />
                <span>About & Architecture</span>
              </span>
            </button>
          </div>

          {/* Live Status Beacon */}
          <div className="hidden lg:flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>DistilBERT API Active</span>
          </div>
        </div>

      </div>
    </header>
  );
}
