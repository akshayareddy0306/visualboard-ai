import React from 'react';

export default function CircleGeometryVisualizer({ data, studentValues }) {
  const r = studentValues?.radius ?? (data?.radius ?? 4);
  const parts = studentValues?.parts ?? (data?.parts ?? 4);
  const unit = data?.unit || 'cm';

  const width = 520;
  const height = 280;
  const cx = width / 2;
  const cy = height / 2;
  const rPixels = Math.max(10, Math.min(105, r * 18));
  const sectorAngle = (2 * Math.PI) / (parts || 1);

  const sectorColors = [
    'rgba(6, 182, 212, 0.25)',
    'rgba(168, 85, 247, 0.25)',
    'rgba(99, 102, 241, 0.25)',
    'rgba(16, 185, 129, 0.25)',
    'rgba(245, 158, 11, 0.25)',
    'rgba(244, 63, 94, 0.25)',
    'rgba(56, 189, 248, 0.25)',
    'rgba(192, 132, 252, 0.25)',
  ];

  const sectors = [];
  for (let i = 0; i < parts; i++) {
    const a1 = i * sectorAngle;
    const a2 = (i + 1) * sectorAngle;
    const x1 = cx + rPixels * Math.cos(a1);
    const y1 = cy + rPixels * Math.sin(a1);
    const x2 = cx + rPixels * Math.cos(a2);
    const y2 = cy + rPixels * Math.sin(a2);
    const largeArc = sectorAngle > Math.PI ? 1 : 0;
    const d = `M ${cx},${cy} L ${x1},${y1} A ${rPixels},${rPixels} 0 ${largeArc},1 ${x2},${y2} Z`;
    sectors.push({ d, color: sectorColors[i % sectorColors.length], index: i + 1 });
  }

  const totalArea = Math.PI * r * r;
  const sectorArea = totalArea / (parts || 1);

  return (
    <div className="relative w-full flex flex-col items-center">
      <div className="w-full h-[280px] bg-[#060a14] rounded-xl border border-slate-800/90 relative overflow-hidden flex items-center justify-center">
        <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`}>
          {/* Shaded Sectors */}
          {sectors.map((sec, idx) => (
            <path
              key={idx}
              d={sec.d}
              fill={sec.color}
              stroke="#38bdf8"
              strokeWidth="1.5"
              className="transition-all duration-200"
            />
          ))}

          {/* Outer ring */}
          <circle cx={cx} cy={cy} r={rPixels} fill="none" stroke="#22d3ee" strokeWidth="2.5" className="drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
          <circle cx={cx} cy={cy} r="4" fill="#ffffff" />

          {/* Radius Arrow */}
          <line x1={cx} y1={cy} x2={cx + rPixels} y2={cy} stroke="#fbbf24" strokeWidth="2" strokeDasharray="3,3" />
          <text x={cx + rPixels / 2} y={cy - 6} fill="#fbbf24" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
            r = {r} {unit}
          </text>

          {/* Sector Labels */}
          {sectors.map((sec, idx) => {
            const midAngle = (idx + 0.5) * sectorAngle;
            const lblX = cx + (rPixels * 0.6) * Math.cos(midAngle);
            const lblY = cy + (rPixels * 0.6) * Math.sin(midAngle) + 4;
            return (
              <text key={`lbl-${idx}`} x={lblX} y={lblY} fill="#ffffff" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                P{sec.index}
              </text>
            );
          })}
        </svg>

        {/* Live Metrics Badge */}
        <div className="absolute top-2 right-2 bg-slate-900/90 border border-slate-800 rounded-lg p-2 font-mono text-[11px] shadow-lg text-right">
          <div><span className="text-slate-400">Total Area: </span><span className="text-cyan-300 font-bold">{totalArea.toFixed(2)} {unit}²</span></div>
          <div><span className="text-slate-400">Sector Area ({parts} parts): </span><span className="text-purple-300 font-bold">{sectorArea.toFixed(2)} {unit}²</span></div>
          <div><span className="text-slate-400">Angle: </span><span className="text-emerald-300 font-bold">{(360 / parts).toFixed(1)}°</span></div>
        </div>
      </div>
    </div>
  );
}
