import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ReviewInput from './components/ReviewInput';
import VerdictGauge from './components/VerdictGauge';
import ShapHighlighter from './components/ShapHighlighter';
import AboutView from './components/AboutView';
import { AlertCircle, History, Clock, ArrowUpRight, Sparkles, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export default function App() {
  const [activeTab, setActiveTab] = useState('detector');
  const [reviewText, setReviewText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/history`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (e) {
      console.warn("Backend connection pending or offline.");
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleAnalyze = async () => {
    if (!reviewText.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${BACKEND_URL}/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewText })
      });

      if (!res.ok) {
        throw new Error(`API error (${res.status}): ${res.statusText}`);
      }

      const data = await res.json();
      setResult(data);
      fetchHistory();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to reach backend API. Ensure FastAPI server is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080b11] text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {activeTab === 'detector' ? (
          <>
            <ReviewInput
              reviewText={reviewText}
              setReviewText={setReviewText}
              onAnalyze={handleAnalyze}
              loading={loading}
            />

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800/60 text-rose-200 text-sm flex items-center gap-3 shadow-xl backdrop-blur-lg"
                >
                  <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <VerdictGauge result={result} />
                  <ShapHighlighter tokens={result.tokens} verdict={result.verdict} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* History Table Card */}
            {history.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="glass-panel glass-panel-glow rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                      <History className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-100">Analysis History Audit Log</h3>
                      <p className="text-xs text-slate-400">Submissions logged in SQLite (`backend/submissions.db`)</p>
                    </div>
                  </div>

                  <span className="text-xs font-mono px-3 py-1 rounded-xl bg-slate-950 border border-white/10 text-slate-400">
                    {history.length} logged records
                  </span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-white/5 bg-[#06080d]/80">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950/90 text-slate-400 uppercase font-mono border-b border-white/10">
                      <tr>
                        <th className="px-5 py-3.5">Review Sample Text</th>
                        <th className="px-5 py-3.5">Verdict</th>
                        <th className="px-5 py-3.5">Confidence</th>
                        <th className="px-5 py-3.5">Logged Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono">
                      {history.slice(0, 5).map((item, i) => (
                        <tr key={i} className="hover:bg-white/[0.03] transition duration-150">
                          <td className="px-5 py-3.5 max-w-sm truncate font-sans text-slate-200 font-medium">{item.reviewText}</td>
                          <td className="px-5 py-3.5">
                            <span className={`px-2.5 py-1 rounded-full font-bold border text-[11px] ${
                              item.verdict === 'Fake' 
                                ? 'bg-rose-500/20 border-rose-500/30 text-rose-300' 
                                : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                            }`}>
                              {item.verdict}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-slate-200 font-semibold">{Math.round(item.confidence * 100)}%</td>
                          <td className="px-5 py-3.5 text-slate-400 font-sans text-[11px] flex items-center gap-1.5 mt-1">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </>
        ) : (
          <AboutView />
        )}
      </main>

      <footer className="border-t border-white/5 bg-[#06080d] py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 TrustLens XAI — An Explainable AI Framework for Detecting Fake E-Commerce Reviews</p>
          <span className="text-[11px] font-mono text-emerald-500/80">Production Ready • Zero-Spend Cloud Architecture</span>
        </div>
      </footer>
    </div>
  );
}
