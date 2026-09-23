import React from 'react';
import { Cpu, ShieldCheck, Database, Server, Zap, CheckCircle2, ArrowRight } from 'lucide-react';

export default function AboutView() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      {/* Overview Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-xl font-bold text-slate-100 mb-2 flex items-center gap-2">
          <Zap className="w-5 h-5 text-indigo-400" />
          <span>Project Overview & Architecture</span>
        </h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          This system addresses e-commerce review spam through an end-to-end **Explainable AI (XAI)** pipeline.
          Instead of operating as a black box classifier, it couples sequence-level transformer classification with 
          **SHAP (SHapley Additive exPlanations)** token attributions to highlight *why* a review is flagged as genuine or fake.
        </p>
      </div>

      {/* Model Benchmark Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-base font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-indigo-400" />
          <span>Empirical Model Performance Benchmarks</span>
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Model Architecture</th>
                <th className="px-4 py-3">Accuracy</th>
                <th className="px-4 py-3">Precision</th>
                <th className="px-4 py-3">Recall</th>
                <th className="px-4 py-3">F1 Score</th>
                <th className="px-4 py-3">ROC-AUC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono text-xs">
              <tr className="bg-slate-900/50 hover:bg-slate-800/40 transition">
                <td className="px-4 py-3 font-sans font-medium text-slate-300">Baseline (TF-IDF + LogReg)</td>
                <td className="px-4 py-3 text-indigo-300">86.40%</td>
                <td className="px-4 py-3">85.90%</td>
                <td className="px-4 py-3">87.10%</td>
                <td className="px-4 py-3">86.49%</td>
                <td className="px-4 py-3">0.9340</td>
              </tr>
              <tr className="bg-indigo-950/20 font-semibold border-l-4 border-indigo-500 hover:bg-indigo-950/30 transition">
                <td className="px-4 py-3 font-sans text-indigo-300 flex items-center gap-1.5">
                  <span>DistilBERT (Fine-Tuned)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">MAIN</span>
                </td>
                <td className="px-4 py-3 text-emerald-400 font-bold">96.80%</td>
                <td className="px-4 py-3 text-emerald-400">96.50%</td>
                <td className="px-4 py-3 text-emerald-400">97.10%</td>
                <td className="px-4 py-3 text-emerald-400 font-bold">96.80%</td>
                <td className="px-4 py-3 text-emerald-400 font-bold">0.9940</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Phase 1 vs Phase 2 Architecture Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <Server className="w-5 h-5 text-emerald-400" />
            <h4 className="text-base font-semibold text-slate-200">Phase 1 Architecture (Active)</h4>
          </div>
          <ul className="space-y-2 text-xs text-slate-400">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span><strong>Backend:</strong> FastAPI framework with Uvicorn server</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span><strong>Data Store:</strong> Local SQLite database (`submissions.db`)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span><strong>Hosting:</strong> Local FastAPI execution / Vercel Frontend</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span><strong>Cost Surface:</strong> Strictly $0.00 (Zero AWS Involvement)</span>
            </li>
          </ul>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl opacity-80">
          <div className="flex items-center gap-2 mb-3">
            <Database className="w-5 h-5 text-amber-400" />
            <h4 className="text-base font-semibold text-slate-200">Phase 2 AWS Migration (Planned)</h4>
          </div>
          <ul className="space-y-2 text-xs text-slate-400">
            <li className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span><strong>Compute:</strong> AWS Lambda Function URL (Always Free)</span>
            </li>
            <li className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span><strong>Data Store:</strong> AWS DynamoDB `ReviewSubmissions` table</span>
            </li>
            <li className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span><strong>Logging:</strong> AWS CloudWatch Structured Logs</span>
            </li>
            <li className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span><strong>Zero-Billing Safeguard:</strong> $0.01 SNS Budget Hard-Stop Alert</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
