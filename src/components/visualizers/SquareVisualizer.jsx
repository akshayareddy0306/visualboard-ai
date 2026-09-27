import React from 'react';

export default function SquareVisualizer({ data, studentValues }) {
  const side = studentValues?.side ?? (data?.side ?? 8);
  const unit = data?.unit || 'cm';

  const liveArea = side * side;
  const livePerimeter = 4 * side;
  const liveDiagonal = side * Math.SQRT2;

  const viewBoxW = 520;
  const viewBoxH = 280;
  const cx = viewBoxW / 2;
  const cy = viewBoxH / 2;

  const rectSize = 160;
  const x0 = cx - rectSize / 2;
  const y0 = cy - rectSize / 2;
  const cornerSize = 10;

  return (
    <div className="relative w-full flex flex-col items-center">
      <div className="w-full h-[280px] bg-[#060a14] rounded-xl border border-slate-800/90 relative overflow-hidden flex items-center justify-center">
        <svg className="w-full h-full" viewBox={`0 0 ${viewBoxW} ${viewBoxH}`}>
          <defs>
            <marker id="dimArrowSq" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 z" fill="#38bdf8" />
            </marker>
            <marker id="dimArrowStartSq" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M6,0 L0,3 L6,6 z" fill="#38bdf8" />
            </marker>
            <linearGradient id="sqGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.12" />
            </linearGradient>
          </defs>

          {/* Top Dimension: Side s */}
          <line
            x1={x0}
            y1={y0 - 18}
            x2={x0 + rectSize}
            y2={y0 - 18}
            stroke="#38bdf8"
            strokeWidth="1.5"
            markerStart="url(#dimArrowStartSq)"
            markerEnd="url(#dimArrowSq)"
          />
          <text
            x={cx}
            y={y0 - 24}
            fill="#38bdf8"
            fontSize="12"
            fontFamily="monospace"
            fontWeight="bold"
            textAnchor="middle"
          >
            s = {side} {unit}
          </text>

          {/* Square Outline */}
          <rect
            x={x0}
            y={y0}
            width={rectSize}
            height={rectSize}
            fill="url(#sqGrad)"
            stroke="#22d3ee"
            strokeWidth="2.5"
            rx="2"
            className="drop-shadow-[0_0_12px_rgba(6,182,212,0.5)]"
          />

          {/* Equal side hatch marks */}
          <line x1={cx - 4} y1={y0 - 4} x2={cx + 4} y2={y0 + 4} stroke="#22d3ee" strokeWidth="2" />
          <line x1={cx - 4} y1={y0 + rectSize - 4} x2={cx + 4} y2={y0 + rectSize + 4} stroke="#22d3ee" strokeWidth="2" />
          <line x1={x0 - 4} y1={cy - 4} x2={x0 + 4} y2={cy + 4} stroke="#22d3ee" strokeWidth="2" />
          <line x1={x0 + rectSize - 4} y1={cy - 4} x2={x0 + rectSize + 4} stroke="#22d3ee" strokeWidth="2" />

          {/* Right angle corner */}
          <path
            d={`M ${x0},${y0 + cornerSize} L ${x0 + cornerSize},${y0 + cornerSize} L ${x0 + cornerSize},${y0}`}
            fill="none"
            stroke="#64748b"
            strokeWidth="1.5"
          />

          {/* Center Area Text */}
          <text
            x={cx}
            y={cy - 4}
            fill="#ffffff"
            fontSize="14"
            fontFamily="monospace"
            fontWeight="bold"
            textAnchor="middle"
          >
            Area = {liveArea} {unit}²
          </text>
          <text
            x={cx}
            y={cy + 16}
            fill="#94a3b8"
            fontSize="11"
            fontFamily="monospace"
            textAnchor="middle"
          >
            ({side} × {side})
          </text>
        </svg>

        {/* Live Metrics Badge */}
        <div className="absolute top-2 right-2 bg-slate-900/90 border border-slate-800 rounded-lg p-2 font-mono text-[11px] shadow-lg text-right">
          <div><span className="text-slate-400">Area (s²): </span><span className="text-cyan-300 font-bold">{liveArea} {unit}²</span></div>
          <div><span className="text-slate-400">Perimeter (4s): </span><span className="text-purple-300 font-bold">{livePerimeter} {unit}</span></div>
          <div><span className="text-slate-400">Diagonal (s√2): </span><span className="text-emerald-300 font-bold">{liveDiagonal.toFixed(2)} {unit}</span></div>
        </div>
      </div>
    </div>
  );
}
