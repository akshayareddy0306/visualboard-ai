import React from 'react';

/**
 * Visualizer for Probability & Distributions
 * Displays sample space, distribution bars, or tree branches
 */
export default function ProbabilityVisualizer({ data, studentValues }) {
  const prob = studentValues?.p ?? (data?.p ?? 0.5);
  const n = studentValues?.n ?? (data?.n ?? 4);

  // Compute simple binomial distribution for n trials
  const factorial = (num) => (num <= 1 ? 1 : num * factorial(num - 1));
  const nCr = (n, r) => factorial(n) / (factorial(r) * factorial(n - r));

  const distribution = [];
  for (let k = 0; k <= n; k++) {
    const pVal = nCr(n, k) * Math.pow(prob, k) * Math.pow(1 - prob, n - k);
    distribution.push({ k, pVal });
  }

  const maxP = Math.max(...distribution.map((d) => d.pVal), 0.01);

  return (
    <div className="relative w-full flex flex-col items-center">
      <div className="w-full h-[290px] bg-[#060a14] rounded-xl border border-slate-800/90 relative overflow-hidden flex flex-col items-center justify-center p-4">
        
        <h4 className="text-xs font-mono uppercase text-slate-400 mb-2">
          Binomial Probability Distribution (n = {n}, p = {prob.toFixed(2)})
        </h4>

        {/* Bar Chart Representation */}
        <div className="w-full max-w-md h-36 flex items-end justify-center gap-3 pt-4 border-b border-slate-700">
          {distribution.map(({ k, pVal }) => {
            const barHeightPct = (pVal / maxP) * 100;
            return (
              <div key={k} className="flex-1 flex flex-col items-center gap-1 group">
                <span className="text-[10px] font-mono text-cyan-300 opacity-90">
                  {pVal.toFixed(3)}
                </span>
                <div
                  className="w-full bg-gradient-to-t from-cyan-600 via-blue-500 to-indigo-400 rounded-t-md transition-all duration-300 shadow-md group-hover:from-cyan-400 group-hover:to-pink-500"
                  style={{ height: `${Math.max(6, barHeightPct)}%` }}
                />
                <span className="text-xs font-mono text-slate-300 font-bold mt-1">k={k}</span>
              </div>
            );
          })}
        </div>

        {/* Expected Value & Variance */}
        <div className="mt-4 flex items-center justify-center gap-6 font-mono text-xs">
          <div><span className="text-slate-400">Expected Value E(X) = n·p: </span><span className="text-cyan-300 font-bold">{(n * prob).toFixed(2)}</span></div>
          <div><span className="text-slate-400">Variance Var(X) = n·p·q: </span><span className="text-purple-300 font-bold">{(n * prob * (1 - prob)).toFixed(2)}</span></div>
        </div>

        {/* Live Metrics Overlay */}
        <div className="absolute top-2 right-2 bg-slate-900/90 border border-slate-800 rounded-lg p-2 font-mono text-[11px] shadow-lg text-right">
          <div><span className="text-slate-400">P(Success): </span><span className="text-cyan-300 font-bold">{prob.toFixed(2)}</span></div>
          <div><span className="text-slate-400">P(Failure): </span><span className="text-rose-400 font-bold">{(1 - prob).toFixed(2)}</span></div>
        </div>
      </div>
    </div>
  );
}
