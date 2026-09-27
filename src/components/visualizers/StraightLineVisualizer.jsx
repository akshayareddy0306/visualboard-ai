import React from 'react';

export default function StraightLineVisualizer({ data, studentValues }) {
  const m = studentValues?.m ?? (data?.m ?? 1);
  const c = studentValues?.c ?? (data?.c ?? 2);

  const width = 520;
  const height = 280;
  const originX = width / 2;
  const originY = height / 2 + 10;
  const scaleX = 26;
  const scaleY = 16;

  // Generate line points across [-10, 10]
  const pts = [];
  for (let x = -10; x <= 10; x += 0.5) {
    const y = m * x + c;
    const px = originX + x * scaleX;
    const py = originY - y * scaleY;
    pts.push(`${px.toFixed(1)},${py.toFixed(1)}`);
  }
  const lineD = `M ${pts.join(' L ')}`;

  const xIntercept = m !== 0 ? -c / m : null;
  const xIntPx = xIntercept !== null ? originX + xIntercept * scaleX : null;
  const yIntPy = originY - c * scaleY;

  const angleDeg = (Math.atan(m) * (180 / Math.PI)).toFixed(1);

  return (
    <div className="relative w-full flex flex-col items-center">
      <div className="w-full h-[280px] bg-[#060a14] rounded-xl border border-slate-800/90 relative overflow-hidden flex items-center justify-center">
        <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`}>
          {/* Coordinate axes */}
          <line x1={0} y1={originY} x2={width} y2={originY} stroke="#475569" strokeWidth="1.5" />
          <line x1={originX} y1={0} x2={originX} y2={height} stroke="#475569" strokeWidth="1.5" />
          <text x={width - 16} y={originY - 6} fill="#94a3b8" fontSize="10" fontFamily="monospace">x</text>
          <text x={originX + 6} y={16} fill="#94a3b8" fontSize="10" fontFamily="monospace">y</text>

          {/* Line y = mx + c */}
          <path
            d={lineD}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2.5"
            className="drop-shadow-[0_0_8px_rgba(56,189,248,0.7)]"
          />

          {/* y-intercept point (0, c) */}
          <circle cx={originX} cy={yIntPy} r="5" fill="#f43f5e" />
          <text
            x={originX + 10}
            y={yIntPy + 4}
            fill="#f43f5e"
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
          >
            (0, {c})
          </text>

          {/* x-intercept point (-c/m, 0) */}
          {xIntPx !== null && (
            <>
              <circle cx={xIntPx} cy={originY} r="5" fill="#fbbf24" className="animate-pulse" />
              <text
                x={xIntPx}
                y={originY + 16}
                fill="#fbbf24"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
              >
                x = {xIntercept.toFixed(2)}
              </text>
            </>
          )}
        </svg>

        {/* Live Metrics Badge */}
        <div className="absolute top-2 right-2 bg-slate-900/90 border border-slate-800 rounded-lg p-2 font-mono text-[11px] shadow-lg text-right">
          <div className="text-cyan-300 font-bold">
            y = {m}x {c >= 0 ? `+ ${c}` : `- ${Math.abs(c)}`}
          </div>
          <div><span className="text-slate-400">Slope m: </span><span className="text-purple-300 font-bold">{m} ({angleDeg}°)</span></div>
          <div><span className="text-slate-400">Intercept c: </span><span className="text-rose-400 font-bold">{c}</span></div>
        </div>
      </div>
    </div>
  );
}
