import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VerdictGauge({ result }) {
  if (!result) return null;

  const isFake = result.verdict === 'Fake';
  const confidencePct = Math.round((result.confidence || 0) * 100);
  const fakeProbPct = Math.round((result.fake_probability || 0) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`border rounded-2xl p-6 shadow-xl ${
        isFake
          ? 'bg-rose-950/20 border-rose-800/40'
          : 'bg-emerald-950/20 border-emerald-800/40'
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div
            className={`p-3.5 rounded-2xl border ${
              isFake
                ? 'bg-rose-500/20 border-rose-500/30 text-rose-400'
                : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
            }`}
          >
            {isFake ? <ShieldAlert className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Classification Verdict</span>
              <span className="text-xs text-slate-500">• DistilBERT Model</span>
            </div>
            <h3
              className={`text-2xl font-black ${
                isFake ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {isFake ? 'FAKE REVIEW DETECTIVE' : 'GENUINE REVIEW'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Confidence Score: <strong className="text-slate-200">{confidencePct}%</strong>
            </p>
          </div>
        </div>

        <div className="w-full sm:w-64 bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <div className="flex justify-between items-center text-xs text-slate-400 mb-1.5">
            <span>Fake Risk Index</span>
            <span className="font-semibold text-slate-200">{fakeProbPct}%</span>
          </div>
          <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${fakeProbPct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`h-full rounded-full ${
                fakeProbPct > 60
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-400'
              }`}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
