import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, ArrowUpRight, ArrowDownRight, Filter, HelpCircle, Layers } from 'lucide-react';

export default function ShapHighlighter({ tokens, verdict }) {
  const [hoveredToken, setHoveredToken] = useState(null);
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'fake', 'genuine'

  if (!tokens || tokens.length === 0) return null;

  const filteredTokens = tokens.filter(item => {
    if (filterMode === 'fake') return item.shap_value > 0.05;
    if (filterMode === 'genuine') return item.shap_value < -0.05;
    return true;
  });

  const getTokenStyle = (val) => {
    if (val > 0.1) {
      return {
        bg: 'bg-gradient-to-r from-rose-500/25 to-rose-600/20 border-rose-500/50 text-rose-200 shadow-rose-950/40',
        badge: 'bg-rose-500 text-white',
        label: 'Pushes towards Fake',
        glow: 'hover:shadow-rose-500/30'
      };
    } else if (val < -0.1) {
      return {
        bg: 'bg-gradient-to-r from-emerald-500/25 to-teal-600/20 border-emerald-500/50 text-emerald-200 shadow-emerald-950/40',
        badge: 'bg-emerald-500 text-white',
        label: 'Pushes towards Genuine',
        glow: 'hover:shadow-emerald-500/30'
      };
    } else {
      return {
        bg: 'bg-slate-800/50 border-slate-700/40 text-slate-300',
        badge: 'bg-slate-700 text-slate-300',
        label: 'Neutral Context',
        glow: 'hover:shadow-slate-700/30'
      };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-panel glass-panel-glow rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
    >
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6 pb-5 border-b border-white/5">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Eye className="w-5 h-5" />
            </div>
            <span>Token-Level SHAP Feature Attribution</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Word-by-word Shapley value attributions explaining model decision boundaries. Hover any token for details.
          </p>
        </div>

        {/* Filters & Legend */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                filterMode === 'all' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Tokens ({tokens.length})
            </button>
            <button
              onClick={() => setFilterMode('fake')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                filterMode === 'fake' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Fake (+SHAP)
            </button>
            <button
              onClick={() => setFilterMode('genuine')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                filterMode === 'genuine' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Genuine (-SHAP)
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Token Highlight Grid */}
      <div className="p-6 bg-[#06080d]/90 border border-white/10 rounded-2xl leading-relaxed flex flex-wrap gap-2 items-center min-h-[140px]">
        <AnimatePresence>
          {filteredTokens.map((item, idx) => {
            const style = getTokenStyle(item.shap_value);
            const isHovered = hoveredToken === idx;

            return (
              <motion.div
                key={idx}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onMouseEnter={() => setHoveredToken(idx)}
                onMouseLeave={() => setHoveredToken(null)}
                className="relative inline-block group cursor-pointer"
              >
                <span
                  className={`px-3 py-1.5 rounded-xl border text-sm font-medium transition-all duration-200 shadow-md ${style.bg} ${style.glow} ${
                    isHovered ? 'scale-105 ring-2 ring-indigo-400 z-20' : ''
                  }`}
                >
                  {item.token}
                </span>

                {/* Floating Glass Tooltip */}
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 w-52 p-3 bg-slate-900/95 backdrop-blur-xl border border-white/20 text-xs rounded-2xl shadow-2xl z-50 pointer-events-none"
                  >
                    <div className="font-bold text-slate-100 border-b border-white/10 pb-1.5 mb-1.5 flex justify-between items-center">
                      <span className="truncate max-w-[120px]">"{item.token}"</span>
                      <span className={`font-mono px-2 py-0.5 rounded-md font-bold ${
                        item.shap_value > 0 ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {item.shap_value > 0 ? `+${item.shap_value}` : item.shap_value}
                      </span>
                    </div>
                    <div className="flex items-center text-slate-300 text-[11px] gap-1.5">
                      {item.shap_value > 0 ? (
                        <ArrowUpRight className="w-4 h-4 text-rose-400 flex-shrink-0" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      )}
                      <span>{style.label}</span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Legend Footer */}
      <div className="mt-5 flex flex-wrap items-center justify-between text-xs text-slate-400 pt-4 border-t border-white/5">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50"></span>
            <span>Fake Attribution (+SHAP)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
            <span>Genuine Attribution (-SHAP)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span>
            <span>Neutral</span>
          </div>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">Shapley Values Sum = Log-Odds Output</span>
      </div>
    </motion.div>
  );
}
