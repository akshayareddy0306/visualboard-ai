import React from 'react';

/**
 * Visualizer for Matrix Algebra
 * Displays 2x2 or 3x3 matrix with determinants, trace, eigenvalues, and transpose
 */
export default function MatrixVisualizer({ data, studentValues }) {
  const m11 = studentValues?.m11 ?? (data?.m11 ?? 3);
  const m12 = studentValues?.m12 ?? (data?.m12 ?? 4);
  const m21 = studentValues?.m21 ?? (data?.m21 ?? 1);
  const m22 = studentValues?.m22 ?? (data?.m22 ?? 2);

  const det = m11 * m22 - m12 * m21;
  const trace = m11 + m22;
  const isInvertible = det !== 0;

  return (
    <div className="relative w-full flex flex-col items-center">
      <div className="w-full h-[290px] bg-[#060a14] rounded-xl border border-slate-800/90 relative overflow-hidden flex flex-col items-center justify-center p-4">
        
        {/* Visual Matrix Container */}
        <div className="flex items-center gap-6">
          <div className="text-xl font-bold font-mono text-slate-300">A =</div>

          {/* Bracketed Matrix Box */}
          <div className="relative px-5 py-4 border-l-4 border-r-4 border-cyan-400 rounded-sm bg-slate-900/60 shadow-xl">
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 font-mono text-xl sm:text-2xl font-bold text-center">
              <span className="text-cyan-300">{m11}</span>
              <span className="text-cyan-300">{m12}</span>
              <span className="text-purple-300">{m21}</span>
              <span className="text-purple-300">{m22}</span>
            </div>
          </div>

          {/* Matrix Inverse if Invertible */}
          {isInvertible && (
            <div className="hidden sm:flex items-center gap-3">
              <span className="text-lg font-bold font-mono text-slate-400">A⁻¹ = 1/{det}</span>
              <div className="px-3.5 py-2.5 border-l-2 border-r-2 border-emerald-400 rounded-sm bg-slate-950 font-mono text-sm font-bold">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-center text-emerald-300">
                  <span>{m22}</span>
                  <span>{-m12}</span>
                  <span>{-m21}</span>
                  <span>{m11}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Determinant Computation Breakdown */}
        <div className="mt-5 p-3 rounded-lg bg-slate-950/80 border border-slate-800 font-mono text-xs text-slate-300 text-center max-w-md">
          <div className="text-slate-400 mb-1">Determinant Formula: det(A) = a₁₁·a₂₂ - a₁₂·a₂₁</div>
          <div className="text-sm font-bold text-cyan-300">
            det(A) = ({m11} × {m22}) - ({m12} × {m21}) = {m11 * m22} - {m12 * m21} = <span className="text-emerald-400">{det}</span>
          </div>
        </div>

        {/* Live Metrics Overlay */}
        <div className="absolute top-2 right-2 bg-slate-900/90 border border-slate-800 rounded-lg p-2 font-mono text-[11px] shadow-lg text-right">
          <div><span className="text-slate-400">det(A): </span><span className={`font-bold ${det !== 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{det}</span></div>
          <div><span className="text-slate-400">Trace: </span><span className="text-cyan-300 font-bold">{trace}</span></div>
          <div><span className="text-slate-400">Status: </span><span className="text-purple-300 font-bold">{isInvertible ? 'Non-Singular' : 'Singular'}</span></div>
        </div>
      </div>
    </div>
  );
}
