import React from 'react';
import { Send, Sparkles, RefreshCw } from 'lucide-react';

const SAMPLES = [
  {
    label: "Fake Review Sample (Spam Praise)",
    text: "THIS IS ABSOLUTELY AMAZING! Best product ever created! 10/10 must buy right now! Incredible quality!",
    type: "fake"
  },
  {
    label: "Genuine Review Sample (Grounded)",
    text: "I bought this pair of shoes 3 months ago. The leather feels durable and fits well, though the box arrived slightly dented.",
    type: "genuine"
  },
  {
    label: "Ambiguous Sample (Mixed Signals)",
    text: "Product is fine for the price. Not terrible but definitely not the highest quality either.",
    type: "ambiguous"
  }
];

export default function ReviewInput({ reviewText, setReviewText, onAnalyze, loading }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <span>Input Review Text</span>
        </h2>
        <span className="text-xs text-slate-500">{reviewText.length} characters</span>
      </div>

      <textarea
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
        placeholder="Paste or type an e-commerce review here to analyze..."
        className="w-full h-36 bg-slate-950/70 border border-slate-800 rounded-xl p-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition text-sm resize-none"
      />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-400 mr-1">Presets:</span>
          {SAMPLES.map((sample, i) => (
            <button
              key={i}
              onClick={() => setReviewText(sample.text)}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              {sample.label}
            </button>
          ))}
        </div>

        <button
          onClick={onAnalyze}
          disabled={loading || !reviewText.trim()}
          className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-medium rounded-xl shadow-lg shadow-indigo-600/30 transition text-sm"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Analyzing with SHAP...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Analyze & Explain</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
