import React from 'react';
import { Send, Sparkles, RefreshCw, AlertOctagon, CheckCircle2, HelpCircle, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

const SAMPLES = [
  {
    label: "Synthetic / Fake Review (CG)",
    text: "Really nice case. The clear plastic has a nice feel and it works very well. I will definitely keep this item and recommend it.",
    type: "fake",
    icon: AlertOctagon,
    color: "from-rose-500/20 to-orange-500/20 border-rose-500/30 text-rose-300 hover:border-rose-400"
  },
  {
    label: "Authentic / Genuine Review (OR)",
    text: "I bought this pair of shoes 3 months ago. The leather feels durable and fits well, though the heel rubbed slightly for the first two days.",
    type: "genuine",
    icon: CheckCircle2,
    color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-300 hover:border-emerald-400"
  },
  {
    label: "Ambiguous Review (Mixed)",
    text: "Product is fine for the price. Not terrible but definitely not high quality either.",
    type: "ambiguous",
    icon: HelpCircle,
    color: "from-amber-500/20 to-yellow-500/20 border-amber-500/30 text-amber-300 hover:border-amber-400"
  }
];

export default function ReviewInput({ reviewText, setReviewText, onAnalyze, loading }) {
  const wordCount = reviewText.trim() ? reviewText.trim().split(/\s+/).length : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-panel glass-panel-glow rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
    >
      {/* Glow background accent */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <span>Input Review Text for XAI Audit</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Paste an e-commerce review below or select a sample dataset preset.</p>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono text-slate-400 bg-slate-900/80 px-3.5 py-1.5 rounded-xl border border-white/5">
          <span>{wordCount} words</span>
          <span className="text-slate-600">•</span>
          <span>{reviewText.length} chars</span>
        </div>
      </div>

      <div className="relative">
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Paste e-commerce review text here (e.g. 'THIS IS ABSOLUTELY AMAZING! Best purchase ever...')."
          className="w-full h-40 bg-[#06080d]/90 border border-white/10 rounded-2xl p-4 sm:p-5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition text-sm leading-relaxed resize-none font-sans"
        />

        {reviewText.length > 0 && (
          <button
            onClick={() => setReviewText('')}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition"
            title="Clear text"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Preset Chips & Action Button */}
      <div className="mt-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-4 border-t border-white/5">
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">Quick Preset Samples:</span>
          <div className="flex flex-wrap gap-2">
            {SAMPLES.map((sample, i) => {
              const Icon = sample.icon;
              return (
                <button
                  key={i}
                  onClick={() => setReviewText(sample.text)}
                  className={`flex items-center space-x-2 text-xs px-3.5 py-2 rounded-xl bg-gradient-to-r ${sample.color} border transition duration-200 font-medium`}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{sample.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={onAnalyze}
          disabled={loading || !reviewText.trim()}
          className="relative group overflow-hidden flex items-center justify-center space-x-2.5 px-8 py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-pos-0 hover:bg-pos-100 bg-[length:200%_auto] disabled:opacity-50 text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/30 transition-all duration-300 text-sm flex-shrink-0 cursor-pointer"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-200" />
              <span>Analyzing with SHAP...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              <span>Analyze & Explain Review</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
