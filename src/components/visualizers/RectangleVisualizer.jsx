import React from 'react';

export default function RectangleVisualizer({ data, studentValues }) {
  const length = studentValues?.length ?? (data?.length ?? 4);
  const widthVal = studentValues?.width ?? studentValues?.breadth ?? (data?.width ?? data?.breadth ?? 2);
  const unit = data?.unit || 'units';

  const liveArea = length * widthVal;
  const livePerimeter = 2 * (length + widthVal);
  const liveDiagonal = Math.sqrt(length * length + widthVal * widthVal);

  const viewBoxW = 520;
  const viewBoxH = 280;
  const cx = viewBoxW / 2;
  const cy = viewBoxH / 2;

  // Compute scaled dimensions to fit comfortably inside canvas (max rect: 340w x 180h)
  const maxAvailW = 320;
  const maxAvailH = 170;
  const aspect = length / Math.max(0.1, widthVal);

  let rectW, rectH;
  if (aspect >= maxAvailW / maxAvailH) {
    rectW = maxAvailW;
    rectH = Math.max(30, maxAvailW / aspect);
  } else {
    rectH = maxAvailH;
    rectW = Math.max(40, maxAvailH * aspect);
  }

  const x0 = cx - rectW / 2;
  const y0 = cy - rectH / 2;
  const cornerSize = 10;

  return (
    <div className="relative w-full flex flex-col items-center">
      <div className="w-full h-[280px] bg-[#060a14] rounded-xl border border-slate-800/90 relative overflow-hidden flex items-center justify-center">
        <svg className="w-full h-full" viewBox={`0 0 ${viewBoxW} ${viewBoxH}`}>
          <defs>
            <marker id="dimArrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 z" fill="#38bdf8" />
            </marker>
            <marker id="dimArrowStart" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M6,0 L0,3 L6,6 z" fill="#38bdf8" />
            </marker>
            <linearGradient id="rectGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0.10" />
            </linearGradient>
          </defs>

          {/* Dimension Line: Top (Length) */}
          <line
            x1={x0}
            y1={y0 - 18}
            x2={x0 + rectW}
            y2={y0 - 18}
            stroke="#38bdf8"
            strokeWidth="1.5"
            markerStart="url(#dimArrowStart)"
            markerEnd="url(#dimArrow)"
          />
          <line x1={x0} y1={y0 - 24} x2={x0} y2={y0 - 5} stroke="#38bdf8" strokeWidth="1" strokeDasharray="2,2" opacity="0.6" />
          <line x1={x0 + rectW} y1={y0 - 24} x2={x0 + rectW} y2={y0 - 5} stroke="#38bdf8" strokeWidth="1" strokeDasharray="2,2" opacity="0.6" />
          <text
            x={cx}
            y={y0 - 24}
            fill="#38bdf8"
            fontSize="12"
            fontFamily="monospace"
            fontWeight="bold"
            textAnchor="middle"
          >
            {length} {unit}
          </text>

          {/* Dimension Line: Left (Width) */}
          <line
            x1={x0 - 18}
            y1={y0}
            x2={x0 - 18}
            y2={y0 + rectH}
            stroke="#38bdf8"
            strokeWidth="1.5"
            markerStart="url(#dimArrowStart)"
            markerEnd="url(#dimArrow)"
          />
          <line x1={x0 - 24} y1={y0} x2={x0 - 5} y2={y0} stroke="#38bdf8" strokeWidth="1" strokeDasharray="2,2" opacity="0.6" />
          <line x1={x0 - 24} y1={y0 + rectH} x2={x0 - 5} y2={y0 + rectH} stroke="#38bdf8" strokeWidth="1" strokeDasharray="2,2" opacity="0.6" />
          <text
            x={x0 - 26}
            y={cy + 4}
            fill="#38bdf8"
            fontSize="12"
            fontFamily="monospace"
            fontWeight="bold"
            textAnchor="end"
          >
            {widthVal} {unit}
          </text>

          {/* The Geometric Rectangle */}
          <rect
            x={x0}
            y={y0}
            width={rectW}
            height={rectH}
            fill="url(#rectGrad)"
            stroke="#22d3ee"
            strokeWidth="2.5"
            rx="2"
            className="drop-shadow-[0_0_12px_rgba(6,182,212,0.5)]"
          />

          {/* Right-angle indicator at top-left corner */}
          <path
            d={`M ${x0},${y0 + cornerSize} L ${x0 + cornerSize},${y0 + cornerSize} L ${x0 + cornerSize},${y0}`}
            fill="none"
            stroke="#64748b"
            strokeWidth="1.5"
          />
          {/* Right-angle indicator at bottom-right corner */}
          <path
            d={`M ${x0 + rectW},${y0 + rectH - cornerSize} L ${x0 + rectW - cornerSize},${y0 + rectH - cornerSize} L ${x0 + rectW - cornerSize},${y0 + rectH}`}
            fill="none"
            stroke="#64748b"
            strokeWidth="1.5"
          />

          {/* Interior Area Label & Formula */}
          <text
            x={cx}
            y={cy - 4}
            fill="#ffffff"
            fontSize="14"
            fontFamily="monospace"
            fontWeight="bold"
            textAnchor="middle"
            className="drop-shadow-md"
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
            ({length} × {widthVal})
          </text>

          {/* 4 Corner Vertices */}
          <circle cx={x0} cy={y0} r="3.5" fill="#38bdf8" />
          <circle cx={x0 + rectW} cy={y0} r="3.5" fill="#38bdf8" />
          <circle cx={x0 + rectW} cy={y0 + rectH} r="3.5" fill="#38bdf8" />
          <circle cx={x0} cy={y0 + rectH} r="3.5" fill="#38bdf8" />
        </svg>

        {/* Live Metrics Badge */}
        <div className="absolute top-2 right-2 bg-slate-900/90 border border-slate-800 rounded-lg p-2 font-mono text-[11px] shadow-lg text-right">
          <div><span className="text-slate-400">Area (l × w): </span><span className="text-cyan-300 font-bold">{liveArea} {unit}²</span></div>
          <div><span className="text-slate-400">Perimeter 2(l+w): </span><span className="text-purple-300 font-bold">{livePerimeter} {unit}</span></div>
          <div><span className="text-slate-400">Diagonal √(l²+w²): </span><span className="text-emerald-300 font-bold">{liveDiagonal.toFixed(2)} {unit}</span></div>
        </div>
      </div>
    </div>
  );
}
