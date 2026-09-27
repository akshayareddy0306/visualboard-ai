import React from 'react';

/**
 * Visualizer for Trigonometric Heights and Distances
 * Displays right-angled triangle with observer, tower/height, horizontal distance,
 * angle of elevation/depression, and line of sight.
 */
export default function HeightsDistancesVisualizer({ data, studentValues }) {
  const angleDeg = studentValues?.angle ?? studentValues?.angleDeg ?? (data?.angleDeg ?? data?.angle ?? 45);
  const height = studentValues?.height ?? (data?.height ?? 50);
  const distance = studentValues?.distance ?? (data?.distance ?? (height / Math.tan((angleDeg * Math.PI) / 180)));
  const unit = data?.unit || 'm';

  const angleRad = (angleDeg * Math.PI) / 180;
  const liveHypot = Math.sqrt(height * height + distance * distance);
  const hypotStr = liveHypot.toFixed(2);

  const viewBoxW = 520;
  const viewBoxH = 280;

  // Triangle coordinates fitting inside viewBox
  const x0 = 80;
  const y0 = 230; // ground level
  const triW = 340;
  const triH = Math.min(180, Math.max(50, (triW * Math.tan(angleRad)) / 2));

  const xGroundEnd = x0 + triW;
  const yTop = y0 - triH;

  return (
    <div className="relative w-full flex flex-col items-center">
      <div className="w-full h-[290px] bg-[#060a14] rounded-xl border border-slate-800/90 relative overflow-hidden flex items-center justify-center">
        <svg className="w-full h-full" viewBox={`0 0 ${viewBoxW} ${viewBoxH}`}>
          <defs>
            <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="triangleFill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.08" />
            </linearGradient>
          </defs>

          {/* Ground Plane Line */}
          <line x1="30" y1={y0} x2="490" y2={y0} stroke="#475569" strokeWidth="2" strokeDasharray="4,4" />
          <text x="490" y={y0 + 16} fill="#64748b" fontSize="10" fontFamily="monospace" textAnchor="end">Ground Level</text>

          {/* Shaded Triangle */}
          <polygon
            points={`${x0},${y0} ${xGroundEnd},${y0} ${xGroundEnd},${yTop}`}
            fill="url(#triangleFill)"
            stroke="#38bdf8"
            strokeWidth="2"
          />

          {/* Vertical Object / Tower */}
          <line x1={xGroundEnd} y1={y0} x2={xGroundEnd} y2={yTop} stroke="#f43f5e" strokeWidth="3.5" />
          {/* Tower Top Indicator */}
          <circle cx={xGroundEnd} cy={yTop} r="5" fill="#f43f5e" className="animate-pulse" />

          {/* Line of Sight (Hypotenuse) */}
          <line x1={x0} y1={y0} x2={xGroundEnd} y2={yTop} stroke="#a855f7" strokeWidth="2" strokeDasharray="3,3" />

          {/* Right Angle Marker */}
          <path
            d={`M ${xGroundEnd - 14},${y0} L ${xGroundEnd - 14},${y0 - 14} L ${xGroundEnd},${y0 - 14}`}
            fill="none"
            stroke="#94a3b8"
            strokeWidth="1.5"
          />

          {/* Angle Arc at Observer */}
          <path
            d={`M ${x0 + 35},${y0} A 35 35 0 0 0 ${x0 + 35 * Math.cos(angleRad)},${y0 - 35 * Math.sin(angleRad)}`}
            fill="none"
            stroke="#fde047"
            strokeWidth="2"
          />
          <text
            x={x0 + 44}
            y={y0 - 10}
            fill="#fde047"
            fontSize="12"
            fontFamily="monospace"
            fontWeight="bold"
          >
            θ = {typeof angleDeg === 'number' ? angleDeg.toFixed(1) : angleDeg}°
          </text>

          {/* Observer Pin */}
          <circle cx={x0} cy={y0} r="4" fill="#38bdf8" />
          <text x={x0 - 5} y={y0 + 20} fill="#38bdf8" fontSize="11" fontFamily="monospace" textAnchor="middle">
            Observer (A)
          </text>

          {/* Horizontal Distance Label */}
          <text
            x={(x0 + xGroundEnd) / 2}
            y={y0 + 20}
            fill="#38bdf8"
            fontSize="12"
            fontFamily="monospace"
            fontWeight="bold"
            textAnchor="middle"
          >
            Distance d = {typeof distance === 'number' ? distance.toFixed(1) : distance} {unit}
          </text>

          {/* Vertical Height Label */}
          <text
            x={xGroundEnd + 12}
            y={(y0 + yTop) / 2}
            fill="#f43f5e"
            fontSize="12"
            fontFamily="monospace"
            fontWeight="bold"
            textAnchor="start"
          >
            Height h = {typeof height === 'number' ? height.toFixed(1) : height} {unit}
          </text>

          {/* Line of Sight Label */}
          <text
            x={(x0 + xGroundEnd) / 2 - 10}
            y={(y0 + yTop) / 2 - 15}
            fill="#c084fc"
            fontSize="11"
            fontFamily="monospace"
            textAnchor="middle"
            transform={`rotate(${-angleDeg / 2}, ${(x0 + xGroundEnd) / 2}, ${(y0 + yTop) / 2})`}
          >
            Sight = {hypotStr} {unit}
          </text>
        </svg>

        {/* Live Calculation Pill */}
        <div className="absolute top-2 right-2 bg-slate-900/90 border border-slate-800 rounded-lg p-2 font-mono text-[11px] shadow-lg text-right">
          <div><span className="text-slate-400">Formula: </span><span className="text-amber-300 font-bold">tan(θ) = h / d</span></div>
          <div><span className="text-slate-400">tan({angleDeg}°) = </span><span className="text-cyan-300 font-bold">{Math.tan(angleRad).toFixed(3)}</span></div>
          <div><span className="text-slate-400">Hypotenuse: </span><span className="text-purple-300 font-bold">{hypotStr} {unit}</span></div>
        </div>
      </div>
    </div>
  );
}
