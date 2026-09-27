import React from 'react';

/**
 * Visualizer for Calculus: Derivatives and Tangent Lines
 * Displays curve y = f(x) alongside tangent line at x0 with slope m = f'(x0)
 */
export default function DerivativeTangentVisualizer({ data, studentValues }) {
  const x0 = studentValues?.x0 ?? (data?.x0 ?? 1.5);
  const a = studentValues?.a ?? (data?.a ?? 0.5); // f(x) = a*x^2
  
  // f(x) = a * x^2
  // f'(x) = 2 * a * x
  // Tangent at x0: y - y0 = m * (x - x0) => y = m*x + (y0 - m*x0)
  const y0 = a * x0 * x0;
  const slope = 2 * a * x0;
  const intercept = y0 - slope * x0;

  const viewBoxW = 520;
  const viewBoxH = 280;
  const cx = viewBoxW / 2;
  const cy = viewBoxH - 50;
  const scaleX = 45;
  const scaleY = 22;

  // Generate curve points
  const curvePoints = [];
  for (let x = -4; x <= 4; x += 0.15) {
    const y = a * x * x;
    const px = cx + x * scaleX;
    const py = cy - y * scaleY;
    curvePoints.push(`${px.toFixed(1)},${py.toFixed(1)}`);
  }

  // Tangent line endpoints
  const tanX1 = x0 - 2.5;
  const tanY1 = slope * tanX1 + intercept;
  const tanX2 = x0 + 2.5;
  const tanY2 = slope * tanX2 + intercept;

  const pTanX1 = cx + tanX1 * scaleX;
  const pTanY1 = cy - tanY1 * scaleY;
  const pTanX2 = cx + tanX2 * scaleX;
  const pTanY2 = cy - tanY2 * scaleY;

  const pPtX = cx + x0 * scaleX;
  const pPtY = cy - y0 * scaleY;

  return (
    <div className="relative w-full flex flex-col items-center">
      <div className="w-full h-[290px] bg-[#060a14] rounded-xl border border-slate-800/90 relative overflow-hidden flex items-center justify-center">
        <svg className="w-full h-full" viewBox={`0 0 ${viewBoxW} ${viewBoxH}`}>
          {/* Coordinate Axes */}
          <line x1="20" y1={cy} x2="500" y2={cy} stroke="#334155" strokeWidth="1.5" />
          <line x1={cx} y1="20" x2={cx} y2="270" stroke="#334155" strokeWidth="1.5" />
          <text x="495" y={cy - 8} fill="#64748b" fontSize="10" fontFamily="monospace">x</text>
          <text x={cx + 8} y="25" fill="#64748b" fontSize="10" fontFamily="monospace">y</text>

          {/* Curve y = f(x) */}
          <polyline
            points={curvePoints.join(' ')}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2.5"
          />

          {/* Tangent Line */}
          <line
            x1={pTanX1}
            y1={pTanY1}
            x2={pTanX2}
            y2={pTanY2}
            stroke="#f43f5e"
            strokeWidth="2"
            strokeDasharray="4,2"
          />

          {/* Point of Tangency */}
          <circle cx={pPtX} cy={pPtY} r="5" fill="#f43f5e" className="animate-pulse" />
          <circle cx={pPtX} cy={pPtY} r="9" fill="none" stroke="#f43f5e" strokeWidth="1.5" opacity="0.5" />

          {/* Tangency Coordinates Label */}
          <text
            x={pPtX + 10}
            y={pPtY - 10}
            fill="#ffffff"
            fontSize="11"
            fontFamily="monospace"
            fontWeight="bold"
          >
            P({x0.toFixed(2)}, {y0.toFixed(2)})
          </text>

          {/* Slope Vector Marker */}
          <text
            x={pPtX - 10}
            y={pPtY + 24}
            fill="#f43f5e"
            fontSize="11"
            fontFamily="monospace"
            fontWeight="bold"
          >
            Slope m = {slope.toFixed(2)}
          </text>
        </svg>

        {/* Live Metrics Overlay */}
        <div className="absolute top-2 right-2 bg-slate-900/90 border border-slate-800 rounded-lg p-2 font-mono text-[11px] shadow-lg text-right">
          <div><span className="text-slate-400">Function: </span><span className="text-cyan-300 font-bold">f(x) = {a}x²</span></div>
          <div><span className="text-slate-400">Derivative: </span><span className="text-purple-300 font-bold">f'(x) = {2 * a}x</span></div>
          <div><span className="text-slate-400">Tangent at x={x0.toFixed(1)}: </span><span className="text-rose-400 font-bold">m = {slope.toFixed(2)}</span></div>
        </div>
      </div>
    </div>
  );
}
