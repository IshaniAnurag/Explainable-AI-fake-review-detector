import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, HelpCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function ShapHighlighter({ tokens, verdict }) {
  const [hoveredToken, setHoveredToken] = useState(null);

  if (!tokens || tokens.length === 0) return null;

  const getTokenStyle = (val) => {
    if (val > 0.1) {
      return {
        bg: 'bg-rose-500/25 border-rose-500/40 text-rose-200',
        badge: 'bg-rose-500 text-white',
        label: 'Pushes towards Fake'
      };
    } else if (val < -0.1) {
      return {
        bg: 'bg-emerald-500/25 border-emerald-500/40 text-emerald-200',
        badge: 'bg-emerald-500 text-white',
        label: 'Pushes towards Genuine'
      };
    } else {
      return {
        bg: 'bg-slate-800/40 border-slate-700/30 text-slate-300',
        badge: 'bg-slate-700 text-slate-300',
        label: 'Neutral'
      };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-semibold text-slate-200 flex items-center gap-2">
            <Eye className="w-5 h-5 text-indigo-400" />
            <span>Token-Level SHAP Explainability</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Hover over tokens to inspect exact Shapley feature importance attributions.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-rose-500/20 border border-rose-500/30 text-rose-300">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>Fake Indicator (+SHAP)</span>
          </div>
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Genuine Indicator (-SHAP)</span>
          </div>
        </div>
      </div>

      {/* Interactive Token Highlighting Area */}
      <div className="p-5 bg-slate-950/80 border border-slate-800/80 rounded-xl leading-relaxed flex flex-wrap gap-1.5 items-center">
        {tokens.map((item, idx) => {
          const style = getTokenStyle(item.shap_value);
          const isHovered = hoveredToken === idx;

          return (
            <div
              key={idx}
              onMouseEnter={() => setHoveredToken(idx)}
              onMouseLeave={() => setHoveredToken(null)}
              className="relative inline-block group cursor-pointer"
            >
              <span
                className={`px-2 py-0.5 rounded-md border text-sm font-medium transition duration-150 ${style.bg} ${
                  isHovered ? 'ring-2 ring-indigo-400 scale-105 z-10' : ''
                }`}
              >
                {item.token}
              </span>

              {/* Tooltip Popup */}
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2.5 bg-slate-900 border border-slate-700 text-xs rounded-xl shadow-2xl z-50 pointer-events-none"
                >
                  <div className="font-bold text-slate-200 border-b border-slate-800 pb-1 mb-1 flex justify-between">
                    <span>"{item.token}"</span>
                    <span className="font-mono text-indigo-400">{item.shap_value > 0 ? `+${item.shap_value}` : item.shap_value}</span>
                  </div>
                  <div className="flex items-center text-slate-300 text-[11px] gap-1">
                    {item.shap_value > 0 ? (
                      <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                    <span>{style.label}</span>
                  </div>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
