import React from 'react';
import { Cpu, ShieldCheck, Database, Server, Zap, CheckCircle2, ArrowRight, Activity, Award, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AboutView() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 max-w-5xl mx-auto py-4"
    >
      {/* Overview Card */}
      <div className="glass-panel glass-panel-glow rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Project Overview & Explainability Architecture</h2>
            <p className="text-xs text-slate-400">An Explainable AI Framework for Detecting Fake E-Commerce Reviews</p>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          Online e-commerce platforms are increasingly inundated with artificial, computer-generated, or incentivized fake reviews that manipulate consumer purchasing decisions. 
          This system addresses deceptive opinion spam by coupling sequence-level transformer classification with 
          **SHAP (SHapley Additive exPlanations)** token attributions — revealing not just a binary verdict, but token-by-token evidence behind every classification.
        </p>
      </div>

      {/* Benchmark Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-panel rounded-2xl p-5 border border-indigo-500/20 shadow-xl">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <span>Kaggle Dataset Size</span>
            <Database className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono">40,432</div>
          <p className="text-xs text-slate-400 mt-1">Amazon OR (Genuine) & CG (Fake) rows split 80/10/10</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-emerald-500/20 shadow-xl">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <span>Baseline Accuracy</span>
            <BarChart3 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono">93.67%</div>
          <p className="text-xs text-slate-400 mt-1">TF-IDF + Logistic Regression (0.9842 ROC-AUC)</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-purple-500/20 shadow-xl">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <span>DistilBERT Model</span>
            <Award className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-black text-purple-300 font-mono">96.80%</div>
          <p className="text-xs text-slate-400 mt-1">Fine-tuned sequence classifier (0.9940 ROC-AUC)</p>
        </div>
      </div>

      {/* Empirical Benchmark Table */}
      <div className="glass-panel glass-panel-glow rounded-3xl p-6 sm:p-8 shadow-2xl">
        <h3 className="text-lg font-bold text-slate-100 mb-5 flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Cpu className="w-5 h-5" />
          </div>
          <span>Empirical Model Performance Benchmarks</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs text-slate-400 uppercase border-b border-white/10 font-mono">
              <tr>
                <th className="px-4 py-3.5">Model Architecture</th>
                <th className="px-4 py-3.5">Accuracy</th>
                <th className="px-4 py-3.5">Precision</th>
                <th className="px-4 py-3.5">Recall</th>
                <th className="px-4 py-3.5">F1 Score</th>
                <th className="px-4 py-3.5">ROC-AUC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-xs">
              <tr className="bg-slate-900/40 hover:bg-slate-800/40 transition">
                <td className="px-4 py-4 font-sans font-semibold text-slate-200">Baseline (TF-IDF + LogReg)</td>
                <td className="px-4 py-4 text-indigo-300 font-bold">93.67%</td>
                <td className="px-4 py-4">94.33%</td>
                <td className="px-4 py-4">92.93%</td>
                <td className="px-4 py-4">93.62%</td>
                <td className="px-4 py-4 text-indigo-300 font-bold">0.9842</td>
              </tr>
              <tr className="bg-slate-900/40 hover:bg-slate-800/40 transition">
                <td className="px-4 py-4 font-sans font-semibold text-slate-200">Calibrated Linear SVM</td>
                <td className="px-4 py-4 text-indigo-300 font-bold">94.11%</td>
                <td className="px-4 py-4">94.69%</td>
                <td className="px-4 py-4">93.47%</td>
                <td className="px-4 py-4">94.08%</td>
                <td className="px-4 py-4 text-indigo-300 font-bold">0.9857</td>
              </tr>
              <tr className="bg-gradient-to-r from-indigo-950/30 to-purple-950/20 border-l-4 border-indigo-500 font-semibold hover:bg-indigo-950/40 transition">
                <td className="px-4 py-4 font-sans text-indigo-300 flex items-center gap-2">
                  <span>DistilBERT (Fine-Tuned)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">MAIN XAI</span>
                </td>
                <td className="px-4 py-4 text-emerald-400 font-bold">96.80%</td>
                <td className="px-4 py-4 text-emerald-400">96.50%</td>
                <td className="px-4 py-4 text-emerald-400">97.10%</td>
                <td className="px-4 py-4 text-emerald-400 font-bold">96.80%</td>
                <td className="px-4 py-4 text-emerald-400 font-bold">0.9940</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Production Deployment Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel rounded-3xl p-6 shadow-xl border border-indigo-500/30">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Server className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-100">Serverless Cloud Architecture</h4>
          </div>
          <ul className="space-y-3 text-xs text-slate-300">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span><strong>Compute:</strong> AWS Lambda (Graviton2 ARM64) with Mangum ASGI adapter</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span><strong>API Gateway:</strong> Amazon API Gateway HTTP v2 with native CORS preflight</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span><strong>Persistence:</strong> Amazon DynamoDB (On-Demand capacity, zero idle cost)</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span><strong>Edge CDN:</strong> Amazon CloudFront with Origin Access Control (OAC) + S3</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span><strong>Cost Guard:</strong> 100% Free-Tier ($0.00/mo) with $0.01 AWS Budget Alarm</span>
            </li>
          </ul>
        </div>

        <div className="glass-panel rounded-3xl p-6 shadow-xl border border-emerald-500/30">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Database className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-100">Inference Engine & Microservice Specs</h4>
          </div>
          <ul className="space-y-3 text-xs text-slate-300">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span><strong>Core API:</strong> FastAPI asynchronous REST microservice with Pydantic validation</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span><strong>XAI Attributions:</strong> Game-theoretic SHAP (Shapley values) & LIME token maps</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span><strong>Model Optimization:</strong> Quantized ONNX Runtime graph execution (&lt;50ms CPU inference)</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span><strong>Data Access Layer:</strong> Storage repository pattern (SQLite / AWS DynamoDB)</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span><strong>Monitoring:</strong> Structured JSON logging with AWS CloudWatch integration</span>
            </li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
