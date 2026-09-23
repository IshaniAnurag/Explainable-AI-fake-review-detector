import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ReviewInput from './components/ReviewInput';
import VerdictGauge from './components/VerdictGauge';
import ShapHighlighter from './components/ShapHighlighter';
import AboutView from './components/AboutView';
import { AlertCircle, History, Clock } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
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

            {error && (
              <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-sm flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {result && (
              <div className="space-y-6">
                <VerdictGauge result={result} />
                <ShapHighlighter tokens={result.tokens} verdict={result.verdict} />
              </div>
            )}

            {/* History Table */}
            {history.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center space-x-2 mb-4 text-slate-200 font-semibold text-base">
                  <History className="w-5 h-5 text-indigo-400" />
                  <span>Recent Analysis History (SQLite Logged)</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 uppercase border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-2.5">Review Text</th>
                        <th className="px-4 py-2.5">Verdict</th>
                        <th className="px-4 py-2.5">Confidence</th>
                        <th className="px-4 py-2.5">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-mono">
                      {history.slice(0, 5).map((item, i) => (
                        <tr key={i} className="hover:bg-slate-800/40">
                          <td className="px-4 py-2.5 max-w-xs truncate font-sans text-slate-200">{item.reviewText}</td>
                          <td className="px-4 py-2.5">
                            <span className={`px-2 py-0.5 rounded font-bold ${
                              item.verdict === 'Fake' ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                            }`}>
                              {item.verdict}
                            </span>
                          </td>
                          <td className="px-4 py-2.5">{Math.round(item.confidence * 100)}%</td>
                          <td className="px-4 py-2.5 text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : (
          <AboutView />
        )}
      </main>

      <footer className="border-t border-slate-800 bg-slate-900 py-6 text-center text-xs text-slate-500">
        <p>Explainable AI Framework for Detecting Fake E-Commerce Reviews — Phase 1 (Zero AWS)</p>
      </footer>
    </div>
  );
}
