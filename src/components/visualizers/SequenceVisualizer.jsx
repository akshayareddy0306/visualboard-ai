import React from 'react';

/**
 * Visualizer for Sequences and Series (AP & GP)
 * Displays discrete sequence terms, common difference/ratio, and cumulative sum bars
 */
export default function SequenceVisualizer({ data, studentValues }) {
  const isGP = data?.seqType === 'GP';
  const a = studentValues?.a ?? (data?.a ?? 2);
  const diffOrRatio = studentValues?.d ?? studentValues?.r ?? (data?.d ?? data?.r ?? 3);
  const n = studentValues?.n ?? (data?.n ?? 5);

  const terms = [];
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const val = isGP ? a * Math.pow(diffOrRatio, i) : a + i * diffOrRatio;
    sum += val;
    terms.push({ idx: i + 1, val });
  }

  const maxVal = Math.max(...terms.map((t) => Math.abs(t.val)), 1);

  return (
    <div className="relative w-full flex flex-col items-center">
      <div className="w-full h-[290px] bg-[#060a14] rounded-xl border border-slate-800/90 relative overflow-hidden flex flex-col items-center justify-center p-4">
        
        <h4 className="text-xs font-mono uppercase text-slate-400 mb-2">
          {isGP ? 'Geometric Progression (GP)' : 'Arithmetic Progression (AP)'}: a₁ = {a}, {isGP ? `r = ${diffOrRatio}` : `d = ${diffOrRatio}`}
        </h4>

        {/* Discrete Bar Chart of Terms */}
        <div className="w-full max-w-md h-36 flex items-end justify-center gap-3 pt-4 border-b border-slate-700">
          {terms.map(({ idx, val }) => {
            const barHeightPct = (Math.abs(val) / maxVal) * 100;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                <span className="text-[11px] font-mono text-cyan-300 font-bold">
                  {val}
                </span>
                <div
                  className="w-full bg-gradient-to-t from-indigo-600 via-cyan-500 to-teal-300 rounded-t-md transition-all duration-300 shadow-md group-hover:from-purple-500 group-hover:to-pink-400"
                  style={{ height: `${Math.max(8, barHeightPct)}%` }}
                />
                <span className="text-xs font-mono text-slate-300 font-semibold mt-1">T{idx}</span>
              </div>
            );
          })}
        </div>

        {/* Sum of Series */}
        <div className="mt-4 flex items-center justify-center gap-6 font-mono text-xs">
          <div>
            <span className="text-slate-400">Sum of first {n} terms (S_{n}): </span>
            <span className="text-emerald-400 font-bold text-sm">{sum}</span>
          </div>
        </div>

        {/* Live Metrics Overlay */}
        <div className="absolute top-2 right-2 bg-slate-900/90 border border-slate-800 rounded-lg p-2 font-mono text-[11px] shadow-lg text-right">
          <div><span className="text-slate-400">Type: </span><span className="text-cyan-300 font-bold">{isGP ? 'GP' : 'AP'}</span></div>
          <div><span className="text-slate-400">{isGP ? 'Ratio r:' : 'Diff d:'} </span><span className="text-purple-300 font-bold">{diffOrRatio}</span></div>
          <div><span className="text-slate-400">Sum S_{n}: </span><span className="text-emerald-400 font-bold">{sum}</span></div>
        </div>
      </div>
    </div>
  );
}
