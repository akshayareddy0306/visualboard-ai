import React from 'react';
import { CheckCircle2, ShieldCheck, AlertCircle, Info } from 'lucide-react';
import MathView from './MathView';

export default function AnswerCard({ 
  finalAnswer, 
  finalAnswerExpression, 
  understanding, 
  assumptions = [], 
  confidence = 1,
  isCalculatedByMathjs = true 
}) {
  if (!finalAnswer && !finalAnswerExpression && !understanding) return null;

  return (
    <div className="bg-[#0e1628]/90 rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col gap-4">
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF4C4C]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Final Answer
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Verified by Calculation Badge (mathjs computed) */}
          {isCalculatedByMathjs && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified by calculation (mathjs)</span>
            </div>
          )}

          {confidence && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
              Confidence: {Math.round(confidence * 100)}%
            </span>
          )}
        </div>
      </div>

      {/* Understanding / Question Restatement */}
      {understanding && (
        <div className="text-xs text-slate-300 font-medium bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
            Semantic Problem Interpretation:
          </span>
          {understanding}
        </div>
      )}

      {/* Primary Final Answer Display - STRICT RED #FF4C4C IDENTITY */}
      <div className="p-4 rounded-xl bg-slate-950 border border-red-950/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF4C4C]/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="text-[11px] font-bold uppercase tracking-wider text-[#FF4C4C]/80 mb-1">
          Result / Value
        </div>
        
        <div className="text-2xl sm:text-3xl font-extrabold text-[#FF4C4C] tracking-wide font-mono flex items-center gap-3">
          {finalAnswerExpression ? (
            <MathView math={String(finalAnswer ?? finalAnswerExpression)} inline={false} className="text-[#FF4C4C]" />
          ) : (
            <span>{String(finalAnswer)}</span>
          )}
        </div>

        {finalAnswerExpression && finalAnswer !== undefined && (
          <div className="mt-2 text-xs text-slate-500 font-mono">
            Formula: <span className="text-slate-400">{finalAnswerExpression}</span>
          </div>
        )}
      </div>

      {/* Assumptions Applied List */}
      {assumptions && assumptions.length > 0 && (
        <div className="bg-slate-950/40 rounded-xl p-3 border border-slate-800/60">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-cyan-400 mb-2">
            <Info className="w-3.5 h-3.5" />
            <span>Assumptions & Geometric Constraints</span>
          </div>
          <ul className="space-y-1 text-xs text-slate-400 list-disc list-inside">
            {assumptions.map((assump, idx) => (
              <li key={idx} className="leading-relaxed">
                {assump}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
