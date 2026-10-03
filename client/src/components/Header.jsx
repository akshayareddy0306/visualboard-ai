import React from 'react';
import { Cpu, Sparkles, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

export default function Header({ aiHealth, onRefreshHealth, isCheckingHealth }) {
  const getStatusBadge = () => {
    if (isCheckingHealth) {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>Checking AI...</span>
        </div>
      );
    }
    if (aiHealth?.geminiWorking) {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>AI Online ({aiHealth.model || 'Gemini'})</span>
        </div>
      );
    }
    return (
      <div 
        onClick={onRefreshHealth}
        className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30 cursor-pointer hover:bg-rose-500/20 transition-colors"
        title={aiHealth?.error || 'Gemini backend not connected. Click to retry.'}
      >
        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
        <span>AI Standby / Config Needed</span>
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#0B0F19]/90 backdrop-blur-md px-6 py-3.5">
      <div className="max-w-[1700px] mx-auto flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-indigo-500 to-purple-600 p-[1px] shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-[#0B0F19] rounded-[11px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400 bg-clip-text text-transparent">
                VISUALBOARD AI
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/50">
                School & JEE Main
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Zero-Hardcoding Neural Math Reasoner & Dynamic Visualizer
            </p>
          </div>
        </div>

        {/* Status & Badge */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>mathjs engine</span>
            <span className="text-slate-600">•</span>
            <span>SVG 2D</span>
            <span className="text-slate-600">•</span>
            <span>Three.js 3D</span>
          </div>

          {getStatusBadge()}
        </div>
      </div>
    </header>
  );
}
