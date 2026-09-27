import React from 'react';

export default function TriangleVisualizer({ data, studentValues }) {
  const base = studentValues?.base ?? (data?.base ?? 10);
  const heightVal = studentValues?.height ?? (data?.height ?? 8);
  const unit = data?.unit || 'cm';

  const liveArea = 0.5 * base * heightVal;

  const viewBoxW = 520;
  const viewBoxH = 280;
  const cx = viewBoxW / 2;
  const bottomY = viewBoxH - 55;
  const topY = bottomY - 150;

  const triW = 220;
  const pA = { x: cx, y: topY };
  const pB = { x: cx - triW / 2, y: bottomY };
  const pC = { x: cx + triW / 2, y: bottomY };

  return (
    <div className="relative w-full flex flex-col items-center">
      <div className="w-full h-[280px] bg-[#060a14] rounded-xl border border-slate-800/90 relative overflow-hidden flex items-center justify-center">
        <svg className="w-full h-full" viewBox={`0 0 ${viewBoxW} ${viewBoxH}`}>
          <defs>
            <marker id="dimArrowTri" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 z" fill="#38bdf8" />
            </marker>
            <marker id="dimArrowStartTri" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M6,0 L0,3 L6,6 z" fill="#38bdf8" />
            </marker>
            <linearGradient id="triGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.10" />
            </linearGradient>
          </defs>

          {/* Triangle Shape */}
          <polygon
            points={`${pA.x},${pA.y} ${pB.x},${pB.y} ${pC.x},${pC.y}`}
            fill="url(#triGrad)"
            stroke="#a855f7"
            strokeWidth="2.5"
            className="drop-shadow-[0_0_12px_rgba(168,85,247,0.5)]"
          />

          {/* Altitude (Height) Dashed Line */}
          <line
            x1={pA.x}
            y1={pA.y}
            x2={pA.x}
            y2={bottomY}
            stroke="#fbbf24"
            strokeWidth="2"
            strokeDasharray="4,3"
          />
          {/* Right Angle Indicator at base of altitude */}
          <path
            d={`M ${pA.x},${bottomY - 10} L ${pA.x + 10},${bottomY - 10} L ${pA.x + 10},${bottomY}`}
            fill="none"
            stroke="#fbbf24"
            strokeWidth="1.5"
          />
          <text
            x={pA.x + 14}
            y={(pA.y + bottomY) / 2}
            fill="#fbbf24"
            fontSize="11"
            fontFamily="monospace"
            fontWeight="bold"
          >
            h = {heightVal} {unit}
          </text>

          {/* Base Dimension Line */}
          <line
            x1={pB.x}
            y1={bottomY + 22}
            x2={pC.x}
            y2={bottomY + 22}
            stroke="#38bdf8"
            strokeWidth="1.5"
            markerStart="url(#dimArrowStartTri)"
            markerEnd="url(#dimArrowTri)"
          />
          <text
            x={cx}
            y={bottomY + 38}
            fill="#38bdf8"
            fontSize="12"
            fontFamily="monospace"
            fontWeight="bold"
            textAnchor="middle"
          >
            Base b = {base} {unit}
          </text>

          {/* Vertices */}
          <circle cx={pA.x} cy={pA.y} r="4" fill="#ffffff" />
          <circle cx={pB.x} cy={pB.y} r="4" fill="#ffffff" />
          <circle cx={pC.x} cy={pC.y} r="4" fill="#ffffff" />
          <text x={pA.x} y={pA.y - 8} fill="#94a3b8" fontSize="11" fontFamily="monospace" textAnchor="middle">A</text>
          <text x={pB.x - 10} y={pB.y + 4} fill="#94a3b8" fontSize="11" fontFamily="monospace" textAnchor="end">B</text>
          <text x={pC.x + 10} y={pC.y + 4} fill="#94a3b8" fontSize="11" fontFamily="monospace" textAnchor="start">C</text>

          {/* Interior Area Label */}
          <text
            x={cx - 35}
            y={bottomY - 25}
            fill="#ffffff"
            fontSize="13"
            fontFamily="monospace"
            fontWeight="bold"
          >
            Area = {liveArea.toFixed(1)} {unit}²
          </text>
        </svg>

        {/* Live Metrics Badge */}
        <div className="absolute top-2 right-2 bg-slate-900/90 border border-slate-800 rounded-lg p-2 font-mono text-[11px] shadow-lg text-right">
          <div><span className="text-slate-400">Area (½·b·h): </span><span className="text-purple-300 font-bold">{liveArea.toFixed(2)} {unit}²</span></div>
          <div><span className="text-slate-400">Base: </span><span className="text-cyan-300 font-bold">{base} {unit}</span></div>
          <div><span className="text-slate-400">Height: </span><span className="text-amber-300 font-bold">{heightVal} {unit}</span></div>
        </div>
      </div>
    </div>
  );
}
