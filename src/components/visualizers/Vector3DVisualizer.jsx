import React from 'react';

export default function Vector3DVisualizer({ data, studentValues }) {
  const v1x = studentValues?.v1x ?? (data?.v1?.[0] ?? 2);
  const v1y = studentValues?.v1y ?? (data?.v1?.[1] ?? 3);
  const v1z = studentValues?.v1z ?? (data?.v1?.[2] ?? 1);

  const v2x = studentValues?.v2x ?? (data?.v2?.[0] ?? 1);
  const v2y = studentValues?.v2y ?? (data?.v2?.[1] ?? -1);
  const v2z = studentValues?.v2z ?? (data?.v2?.[2] ?? 2);

  const dot = v1x * v2x + v1y * v2y + v1z * v2z;
  const mag1 = Math.sqrt(v1x * v1x + v1y * v1y + v1z * v1z);
  const mag2 = Math.sqrt(v2x * v2x + v2y * v2y + v2z * v2z);
  const cosTheta = mag1 * mag2 > 0 ? Math.max(-1, Math.min(1, dot / (mag1 * mag2))) : 0;
  const thetaRad = Math.acos(cosTheta);
  const thetaDeg = thetaRad * (180 / Math.PI);

  const width = 520;
  const height = 280;
  const cx = width / 2;
  const cy = height / 2 + 15;
  const scale = 26;

  // Isometric 3D Projection
  const project = (x, y, z) => {
    // x along down-left (cos 210°, sin 210°)
    // y along right (cos 330°, sin 330°)
    // z straight up
    const px = cx + (y * 0.866 - x * 0.866) * scale;
    const py = cy + (x * 0.5 + y * 0.5 - z * 1.0) * scale;
    return { px, py };
  };

  const o = project(0, 0, 0);
  const xAxis = project(5, 0, 0);
  const yAxis = project(0, 5, 0);
  const zAxis = project(0, 0, 5);

  const aPt = project(v1x, v1y, v1z);
  const bPt = project(v2x, v2y, v2z);

  return (
    <div className="relative w-full flex flex-col items-center">
      <div className="w-full h-[280px] bg-[#060a14] rounded-xl border border-slate-800/90 relative overflow-hidden flex items-center justify-center">
        <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`}>
          <defs>
            <marker id="arrowCyan" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#38bdf8" />
            </marker>
            <marker id="arrowPurple" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#c084fc" />
            </marker>
          </defs>

          {/* 3D Axes */}
          <line x1={o.px} y1={o.py} x2={xAxis.px} y2={xAxis.py} stroke="#475569" strokeWidth="1.5" strokeDasharray="3,3" />
          <line x1={o.px} y1={o.py} x2={yAxis.px} y2={yAxis.py} stroke="#475569" strokeWidth="1.5" strokeDasharray="3,3" />
          <line x1={o.px} y1={o.py} x2={zAxis.px} y2={zAxis.py} stroke="#475569" strokeWidth="1.5" strokeDasharray="3,3" />

          <text x={xAxis.px - 14} y={xAxis.py + 14} fill="#64748b" fontSize="10" fontFamily="monospace">X (i)</text>
          <text x={yAxis.px + 8} y={yAxis.py + 10} fill="#64748b" fontSize="10" fontFamily="monospace">Y (j)</text>
          <text x={zAxis.px} y={zAxis.py - 8} fill="#64748b" fontSize="10" fontFamily="monospace" textAnchor="middle">Z (k)</text>

          {/* Origin Dot */}
          <circle cx={o.px} cy={o.py} r="4" fill="#ffffff" />
          <text x={o.px - 14} y={o.py - 6} fill="#94a3b8" fontSize="10" fontFamily="monospace">O</text>

          {/* Vector a (Cyan) */}
          <line
            x1={o.px}
            y1={o.py}
            x2={aPt.px}
            y2={aPt.py}
            stroke="#38bdf8"
            strokeWidth="3"
            markerEnd="url(#arrowCyan)"
            className="drop-shadow-[0_0_8px_rgba(56,189,248,0.7)]"
          />
          <text
            x={aPt.px + 8}
            y={aPt.py - 6}
            fill="#38bdf8"
            fontSize="11"
            fontFamily="monospace"
            fontWeight="bold"
          >
            a = ⟨{v1x}, {v1y}, {v1z}⟩
          </text>

          {/* Vector b (Purple) */}
          <line
            x1={o.px}
            y1={o.py}
            x2={bPt.px}
            y2={bPt.py}
            stroke="#c084fc"
            strokeWidth="3"
            markerEnd="url(#arrowPurple)"
            className="drop-shadow-[0_0_8px_rgba(192,132,252,0.7)]"
          />
          <text
            x={bPt.px + 8}
            y={bPt.py + 12}
            fill="#c084fc"
            fontSize="11"
            fontFamily="monospace"
            fontWeight="bold"
          >
            b = ⟨{v2x}, {v2y}, {v2z}⟩
          </text>

          {/* Angle θ Indicator Arc */}
          <path
            d={`M ${o.px + (aPt.px - o.px) * 0.25},${o.py + (aPt.py - o.py) * 0.25} Q ${o.px + 10},${o.py - 15} ${o.px + (bPt.px - o.px) * 0.25},${o.py + (bPt.py - o.py) * 0.25}`}
            fill="none"
            stroke="#fbbf24"
            strokeWidth="2"
            strokeDasharray="2,2"
          />
          <text
            x={o.px + 22}
            y={o.py - 16}
            fill="#fbbf24"
            fontSize="11"
            fontFamily="monospace"
            fontWeight="bold"
          >
            θ = {thetaDeg.toFixed(1)}°
          </text>
        </svg>

        {/* Live Metrics Badge */}
        <div className="absolute top-2 right-2 bg-slate-900/90 border border-slate-800 rounded-lg p-2 font-mono text-[11px] shadow-lg text-right">
          <div><span className="text-slate-400">Angle θ: </span><span className="text-amber-300 font-bold">{thetaDeg.toFixed(2)}° ({thetaRad.toFixed(3)} rad)</span></div>
          <div><span className="text-slate-400">Dot Product: </span><span className="text-cyan-300 font-bold">{dot}</span></div>
          <div><span className="text-slate-400">|a|: </span><span className="text-slate-200">{mag1.toFixed(2)}</span> | <span className="text-slate-400">|b|: </span><span className="text-slate-200">{mag2.toFixed(2)}</span></div>
        </div>
      </div>
    </div>
  );
}
