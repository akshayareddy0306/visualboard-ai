import React from 'react';

export default function AreaUnderCurveVisualizer({ data, studentValues }) {
  const targetY = studentValues?.targetY ?? (data?.targetY ?? 4);
  const a = studentValues?.a ?? (data?.a ?? 1);

  const boundX = Math.sqrt(Math.max(0, targetY / (a || 1)));
  const liveArea = 2 * (targetY * boundX - (a * Math.pow(boundX, 3)) / 3);

  const width = 520;
  const height = 280;
  const originX = width / 2;
  const originY = height - 45;
  const scaleX = 35;
  const scaleY = 14;

  // Generate Parabola Curve points
  const parabolaPts = [];
  for (let x = -5.5; x <= 5.5; x += 0.1) {
    const y = a * x * x;
    const px = originX + x * scaleX;
    const py = originY - y * scaleY;
    parabolaPts.push(`${px.toFixed(1)},${py.toFixed(1)}`);
  }
  const parabolaD = `M ${parabolaPts.join(' L ')}`;

  // Shaded polygon points between -boundX and +boundX
  const shadedPts = [];
  // top horizontal line from -boundX to +boundX at y = targetY
  const topY = originY - targetY * scaleY;
  const xLeftPx = originX - boundX * scaleX;
  const xRightPx = originX + boundX * scaleX;

  shadedPts.push(`${xLeftPx.toFixed(1)},${topY.toFixed(1)}`);
  shadedPts.push(`${xRightPx.toFixed(1)},${topY.toFixed(1)}`);

  // along parabola from +boundX down to -boundX
  for (let x = boundX; x >= -boundX; x -= 0.1) {
    const y = a * x * x;
    const px = originX + x * scaleX;
    const py = originY - y * scaleY;
    shadedPts.push(`${px.toFixed(1)},${py.toFixed(1)}`);
  }
  const shadedD = `M ${shadedPts.join(' L ')} Z`;

  return (
    <div className="relative w-full flex flex-col items-center">
      <div className="w-full h-[280px] bg-[#060a14] rounded-xl border border-slate-800/90 relative overflow-hidden flex items-center justify-center">
        <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`}>
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.15" />
            </linearGradient>
          </defs>

          {/* Coordinate axes */}
          <line x1={0} y1={originY} x2={width} y2={originY} stroke="#475569" strokeWidth="1.5" />
          <line x1={originX} y1={0} x2={originX} y2={height} stroke="#475569" strokeWidth="1.5" />
          <text x={width - 16} y={originY - 6} fill="#94a3b8" fontSize="10" fontFamily="monospace">x</text>
          <text x={originX + 6} y={16} fill="#94a3b8" fontSize="10" fontFamily="monospace">y</text>

          {/* Shaded Area between curves */}
          {boundX > 0 && (
            <path
              d={shadedD}
              fill="url(#areaGradient)"
              stroke="#38bdf8"
              strokeWidth="1"
              strokeDasharray="2,2"
              className="transition-all duration-200"
            />
          )}

          {/* Parabola y = ax² */}
          <path
            d={parabolaD}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2.5"
            className="drop-shadow-[0_0_8px_rgba(56,189,248,0.7)]"
          />

          {/* Horizontal line y = targetY */}
          <line
            x1={0}
            y1={topY}
            x2={width}
            y2={topY}
            stroke="#f43f5e"
            strokeWidth="2"
            strokeDasharray="4,4"
          />
          <text x={width - 75} y={topY - 6} fill="#f43f5e" fontSize="10" fontFamily="monospace" fontWeight="bold">
            y = {targetY}
          </text>

          {/* Intersection Points */}
          {boundX > 0 && (
            <>
              <circle cx={xLeftPx} cy={topY} r="5" fill="#fbbf24" className="animate-pulse" />
              <text x={xLeftPx - 10} y={topY - 8} fill="#fbbf24" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="end">
                (-{boundX.toFixed(2)}, {targetY})
              </text>

              <circle cx={xRightPx} cy={topY} r="5" fill="#fbbf24" className="animate-pulse" />
              <text x={xRightPx + 10} y={topY - 8} fill="#fbbf24" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="start">
                (+{boundX.toFixed(2)}, {targetY})
              </text>
            </>
          )}

          {/* Area label in center of shaded region */}
          {boundX > 0 && (
            <text
              x={originX}
              y={originY - (targetY * scaleY) / 2}
              fill="#ffffff"
              fontSize="12"
              fontFamily="monospace"
              fontWeight="bold"
              textAnchor="middle"
              className="drop-shadow-md"
            >
              Area = {liveArea.toFixed(2)}
            </text>
          )}
        </svg>

        {/* Live Metrics Badge */}
        <div className="absolute top-2 right-2 bg-slate-900/90 border border-slate-800 rounded-lg p-2 font-mono text-[11px] shadow-lg text-right">
          <div><span className="text-slate-400">Curve: </span><span className="text-cyan-300 font-bold">y = {a !== 1 ? a : ''}x²</span></div>
          <div><span className="text-slate-400">Boundary: </span><span className="text-rose-400 font-bold">y = {targetY}</span></div>
          <div><span className="text-slate-400">Integral Area: </span><span className="text-amber-300 font-bold">{liveArea.toFixed(2)} sq units</span></div>
        </div>
      </div>
    </div>
  );
}
