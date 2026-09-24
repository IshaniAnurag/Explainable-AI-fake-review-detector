import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, Cpu, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VerdictGauge({ result }) {
  if (!result) return null;

  const isFake = result.verdict === 'Fake';
  const confidencePct = Math.round((result.confidence || 0) * 100);
  const fakeProbPct = Math.round((result.fake_probability || 0) * 100);

  // SVG Circular Gauge calculation
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (fakeProbPct / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`glass-panel glass-panel-glow rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden ${
        isFake
          ? 'bg-gradient-to-br from-rose-950/30 via-slate-900/80 to-slate-950/90 border-rose-500/30'
          : 'bg-gradient-to-br from-emerald-950/30 via-slate-900/80 to-slate-950/90 border-emerald-500/30'
      }`}
    >
      {/* Background glow circle */}
      <div
        className={`absolute -bottom-20 -left-20 w-64 h-64 rounded-full blur-3xl pointer-events-none ${
          isFake ? 'bg-rose-600/15' : 'bg-emerald-600/15'
        }`}
      />

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        
        {/* Left Side: Verdict Badge & Description */}
        <div className="flex items-center space-x-5 text-center md:text-left">
          <div className="relative">
            <div
              className={`absolute -inset-2 rounded-3xl blur-md opacity-60 animate-pulse ${
                isFake ? 'bg-rose-500' : 'bg-emerald-500'
              }`}
            />
            <div
              className={`relative p-5 rounded-3xl border shadow-xl ${
                isFake
                  ? 'bg-rose-950/80 border-rose-500/40 text-rose-400'
                  : 'bg-emerald-950/80 border-emerald-500/40 text-emerald-400'
              }`}
            >
              {isFake ? <ShieldAlert className="w-10 h-10" /> : <ShieldCheck className="w-10 h-10" />}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
              <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">Classification Audit Result</span>
              <span className="text-slate-600">•</span>
              <span className="text-[11px] font-mono text-indigo-400 flex items-center gap-1">
                <Cpu className="w-3 h-3" /> DistilBERT Model
              </span>
            </div>

            <h3
              className={`text-3xl sm:text-4xl font-black tracking-tight ${
                isFake
                  ? 'bg-gradient-to-r from-rose-400 via-rose-300 to-orange-400 bg-clip-text text-transparent'
                  : 'bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent'
              }`}
            >
              {isFake ? 'FAKE REVIEW DETECTED' : 'GENUINE REVIEW'}
            </h3>

            <div className="flex items-center justify-center md:justify-start space-x-3 mt-2">
              <span className="text-xs text-slate-300 font-medium">
                Model Confidence: <strong className="text-white font-bold">{confidencePct}%</strong>
              </span>
              <span className="text-slate-600">•</span>
              <span
                className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${
                  isFake
                    ? 'bg-rose-500/20 border-rose-500/30 text-rose-300'
                    : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                }`}
              >
                {isFake ? 'High Spam Likelihood' : 'Authentic Buyer Signals'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Circular Gauge & Risk Index */}
        <div className="flex items-center space-x-5 bg-slate-950/70 border border-white/10 rounded-2xl p-4 sm:p-5 shadow-inner">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="text-slate-800"
                strokeWidth="10"
                stroke="currentColor"
                fill="transparent"
              />
              <motion.circle
                cx="50"
                cy="50"
                r={radius}
                strokeWidth="10"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1, ease: "easeOut" }}
                strokeLinecap="round"
                stroke={isFake ? '#f43f5e' : '#10b981'}
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-lg font-black font-mono text-white">{fakeProbPct}%</span>
              <span className="text-[9px] uppercase font-bold text-slate-400">Risk</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-300 block">Deception Index</span>
            <p className="text-[11px] text-slate-400 leading-snug max-w-[140px]">
              {isFake
                ? 'High artificial patterns detected in review syntax.'
                : 'Linguistic patterns match verified organic reviews.'}
            </p>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
