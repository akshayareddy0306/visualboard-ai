import React from 'react';

export default function CircleVisualizer({ data, studentValues }) {
  const h = studentValues?.h ?? (data?.h ?? 0);
  const k = studentValues?.k ?? (data?.k ?? 0);
  const r = studentValues?.r ?? (data?.r ?? 5);

  const width = 520;
  const height = 280;
  const originX = width / 2;
  const originY = height / 2;
  
  // Dynamic scale ensuring circle and center fit within viewport
  const maxExtent = Math.max(Math.abs(h) + r, Math.abs(k) + r, 4);
  const scale = Math.min(25, Math.max(8, 115 / maxExtent));

  const centerPx = originX + h * scale;
  const centerPy = originY - k * scale;
  const rPixels = Math.max(5, r * scale);

  const liveArea = Math.PI * r * r;
  const liveCircum = 2 * Math.PI * r;
  const liveDiam = 2 * r;
  const isOrigin = h === 0 && k === 0;

  return (
    <div className="relative w-full flex flex-col items-center">
      <div className="w-full h-[280px] bg-[#060a14] rounded-xl border border-slate-800/90 relative overflow-hidden flex items-center justify-center">
        <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`}>
          {/* Grid lines */}
          {[-8, -6, -4, -2, 2, 4, 6, 8].map((i) => (
            <line
              key={`grid-x-${i}`}
              x1={originX + i * scale}
              y1={0}
              x2={originX + i * scale}
              y2={height}
              stroke="#1e293b"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
          ))}
          {[-6, -4, -2, 2, 4, 6].map((i) => (
            <line
              key={`grid-y-${i}`}
              x1={0}
              y1={originY - i * scale}
              x2={width}
              y2={originY - i * scale}
              stroke="#1e293b"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
          ))}

          {/* Coordinate axes */}
          <line x1={0} y1={originY} x2={width} y2={originY} stroke="#475569" strokeWidth="1.5" />
          <line x1={originX} y1={0} x2={originX} y2={height} stroke="#475569" strokeWidth="1.5" />
          <text x={width - 16} y={originY - 6} fill="#94a3b8" fontSize="10" fontFamily="monospace">x</text>
          <text x={originX + 6} y={16} fill="#94a3b8" fontSize="10" fontFamily="monospace">y</text>

          {/* Circle Fill & Perimeter */}
          <circle
            cx={centerPx}
            cy={centerPy}
            r={rPixels}
            fill="rgba(56, 189, 248, 0.12)"
            stroke="#38bdf8"
            strokeWidth="2.5"
            className="drop-shadow-[0_0_10px_rgba(56,189,248,0.6)]"
          />

          {/* Center Point */}
          <circle cx={centerPx} cy={centerPy} r="5" fill="#f43f5e" className="animate-pulse" />
          <text
            x={centerPx + 8}
            y={centerPy - 6}
            fill="#f43f5e"
            fontSize="11"
            fontFamily="monospace"
            fontWeight="bold"
          >
            C({h}, {k})
          </text>

          {/* Radius Arrow */}
          <line
            x1={centerPx}
            y1={centerPy}
            x2={centerPx + rPixels}
            y2={centerPy}
            stroke="#fbbf24"
            strokeWidth="2"
            strokeDasharray="3,3"
          />
          <text
            x={centerPx + rPixels / 2}
            y={centerPy - 6}
            fill="#fbbf24"
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
            textAnchor="middle"
          >
            r = {r}
          </text>
        </svg>

        {/* Live Metrics Badge */}
        <div className="absolute top-2 right-2 bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 font-mono text-[11px] shadow-lg text-right space-y-0.5">
          <div className="text-cyan-300 font-bold">
            {isOrigin ? `x² + y² = ${(r * r).toFixed(0)}` : `(x ${h >= 0 ? `- ${h}` : `+ ${Math.abs(h)}`})² + (y ${k >= 0 ? `- ${k}` : `+ ${Math.abs(k)}`})² = ${(r * r).toFixed(0)}`}
          </div>
          <div><span className="text-slate-400">Radius: </span><span className="text-amber-300 font-bold">{r}</span> | <span className="text-slate-400">Diameter: </span><span className="text-amber-300 font-bold">{liveDiam.toFixed(1)}</span></div>
          <div><span className="text-slate-400">Area: </span><span className="text-purple-300 font-bold">{liveArea.toFixed(2)}</span></div>
          <div><span className="text-slate-400">Circumference: </span><span className="text-emerald-300 font-bold">{liveCircum.toFixed(2)}</span></div>
          {data?.assumedOrigin && (
            <div className="text-[10px] text-cyan-400/90 italic pt-0.5 border-t border-slate-800">
              Assumed Center at Origin (0,0)
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
