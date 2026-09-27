import React from 'react';

export default function Curved3DVisualizer({ data, studentValues, type = 'CYLINDER' }) {
  const r = studentValues?.radius ?? (data?.radius ?? 5);
  const h = studentValues?.height ?? (data?.height ?? 10);
  const unit = data?.unit || 'cm';

  const viewBoxW = 520;
  const viewBoxH = 280;
  const cx = viewBoxW / 2;
  const cy = viewBoxH / 2;

  if (type === 'SPHERE') {
    const sphereR = Math.min(85, Math.max(30, r * 12));
    const vol = (4 / 3) * Math.PI * Math.pow(r, 3);
    const sa = 4 * Math.PI * Math.pow(r, 2);

    return (
      <div className="relative w-full flex flex-col items-center">
        <div className="w-full h-[280px] bg-[#060a14] rounded-xl border border-slate-800/90 relative overflow-hidden flex items-center justify-center">
          <svg className="w-full h-full" viewBox={`0 0 ${viewBoxW} ${viewBoxH}`}>
            <defs>
              <radialGradient id="sphereGrad" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                <stop offset="60%" stopColor="#0284c7" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#082f49" stopOpacity="0.05" />
              </radialGradient>
            </defs>

            {/* Sphere Body */}
            <circle
              cx={cx}
              cy={cy}
              r={sphereR}
              fill="url(#sphereGrad)"
              stroke="#0284c7"
              strokeWidth="2.5"
              className="drop-shadow-[0_0_12px_rgba(2,132,199,0.5)]"
            />

            {/* Equator Ellipse */}
            <ellipse
              cx={cx}
              cy={cy}
              rx={sphereR}
              ry={sphereR * 0.3}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.5"
              strokeDasharray="4,3"
            />

            {/* Center & Radius Arrow */}
            <circle cx={cx} cy={cy} r="4" fill="#ffffff" />
            <line x1={cx} y1={cy} x2={cx + sphereR} y2={cy} stroke="#fbbf24" strokeWidth="2" strokeDasharray="3,2" />
            <text x={cx + sphereR / 2} y={cy - 6} fill="#fbbf24" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
              r = {r} {unit}
            </text>
          </svg>

          {/* Live Metrics */}
          <div className="absolute top-2 right-2 bg-slate-900/90 border border-slate-800 rounded-lg p-2 font-mono text-[11px] shadow-lg text-right">
            <div><span className="text-slate-400">Volume (4/3·π·r³): </span><span className="text-cyan-300 font-bold">{vol.toFixed(2)} {unit}³</span></div>
            <div><span className="text-slate-400">Surface Area (4πr²): </span><span className="text-purple-300 font-bold">{sa.toFixed(2)} {unit}²</span></div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'CONE') {
    const rx = Math.min(80, Math.max(35, r * 10));
    const coneH = Math.min(150, Math.max(60, h * 12));
    const topY = cy - coneH / 2;
    const bottomY = cy + coneH / 2;
    const ry = rx * 0.32;

    const slant = Math.sqrt(r * r + h * h);
    const vol = (1 / 3) * Math.PI * r * r * h;

    return (
      <div className="relative w-full flex flex-col items-center">
        <div className="w-full h-[280px] bg-[#060a14] rounded-xl border border-slate-800/90 relative overflow-hidden flex items-center justify-center">
          <svg className="w-full h-full" viewBox={`0 0 ${viewBoxW} ${viewBoxH}`}>
            {/* Cone Lateral Outline */}
            <path
              d={`M ${cx - rx},${bottomY} L ${cx},${topY} L ${cx + rx},${bottomY} Z`}
              fill="rgba(168, 85, 247, 0.15)"
              stroke="#a855f7"
              strokeWidth="2.5"
            />

            {/* Base Ellipse */}
            <ellipse
              cx={cx}
              cy={bottomY}
              rx={rx}
              ry={ry}
              fill="rgba(168, 85, 247, 0.25)"
              stroke="#c084fc"
              strokeWidth="2"
            />

            {/* Altitude line */}
            <line x1={cx} y1={topY} x2={cx} y2={bottomY} stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="3,3" />
            <line x1={cx} y1={bottomY} x2={cx + rx} y2={bottomY} stroke="#38bdf8" strokeWidth="2" />
            <text x={cx + rx / 2} y={bottomY - 4} fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold">r = {r}</text>
            <text x={cx - 10} y={cy} fill="#fbbf24" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="end">h = {h}</text>
          </svg>

          {/* Metrics */}
          <div className="absolute top-2 right-2 bg-slate-900/90 border border-slate-800 rounded-lg p-2 font-mono text-[11px] shadow-lg text-right">
            <div><span className="text-slate-400">Volume (⅓·π·r²·h): </span><span className="text-purple-300 font-bold">{vol.toFixed(2)} {unit}³</span></div>
            <div><span className="text-slate-400">Slant Height: </span><span className="text-amber-300 font-bold">{slant.toFixed(2)} {unit}</span></div>
          </div>
        </div>
      </div>
    );
  }

  // CYLINDER (Default)
  const rx = Math.min(85, Math.max(35, r * 10));
  const cylH = Math.min(140, Math.max(50, h * 10));
  const topY = cy - cylH / 2;
  const bottomY = cy + cylH / 2;
  const ry = rx * 0.32;

  const vol = Math.PI * r * r * h;
  const curvedArea = 2 * Math.PI * r * h;

  return (
    <div className="relative w-full flex flex-col items-center">
      <div className="w-full h-[280px] bg-[#060a14] rounded-xl border border-slate-800/90 relative overflow-hidden flex items-center justify-center">
        <svg className="w-full h-full" viewBox={`0 0 ${viewBoxW} ${viewBoxH}`}>
          {/* Cylinder Body Shading */}
          <path
            d={`M ${cx - rx},${topY} L ${cx - rx},${bottomY} A ${rx},${ry} 0 0,0 ${cx + rx},${bottomY} L ${cx + rx},${topY} Z`}
            fill="rgba(56, 189, 248, 0.14)"
            stroke="#0284c7"
            strokeWidth="2"
          />

          {/* Bottom Ellipse */}
          <ellipse cx={cx} cy={bottomY} rx={rx} ry={ry} fill="rgba(56, 189, 248, 0.22)" stroke="#38bdf8" strokeWidth="2" />

          {/* Top Ellipse */}
          <ellipse cx={cx} cy={topY} rx={rx} ry={ry} fill="rgba(56, 189, 248, 0.3)" stroke="#38bdf8" strokeWidth="2.5" />

          {/* Height Dimension Line */}
          <line x1={cx - rx - 18} y1={topY} x2={cx - rx - 18} y2={bottomY} stroke="#fbbf24" strokeWidth="1.5" />
          <text x={cx - rx - 24} y={cy} fill="#fbbf24" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="end">h = {h} {unit}</text>

          {/* Radius Arrow */}
          <line x1={cx} y1={topY} x2={cx + rx} y2={topY} stroke="#ffffff" strokeWidth="1.5" />
          <circle cx={cx} cy={topY} r="3" fill="#ffffff" />
          <text x={cx + rx / 2} y={topY - 6} fill="#ffffff" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">r = {r} {unit}</text>
        </svg>

        {/* Live Metrics */}
        <div className="absolute top-2 right-2 bg-slate-900/90 border border-slate-800 rounded-lg p-2 font-mono text-[11px] shadow-lg text-right">
          <div><span className="text-slate-400">Volume (π·r²·h): </span><span className="text-cyan-300 font-bold">{vol.toFixed(2)} {unit}³</span></div>
          <div><span className="text-slate-400">Curved Area (2πrh): </span><span className="text-purple-300 font-bold">{curvedArea.toFixed(2)} {unit}²</span></div>
        </div>
      </div>
    </div>
  );
}
