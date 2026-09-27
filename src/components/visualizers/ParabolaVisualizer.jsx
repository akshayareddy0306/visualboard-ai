import React from 'react';

export default function ParabolaVisualizer({ data, studentValues }) {
  const a = studentValues?.a ?? (data?.a ?? 3);
  const b = studentValues?.b ?? (data?.b ?? -7);
  const c = studentValues?.c ?? (data?.c ?? 2);

  const D = b * b - 4 * a * c;
  const hasRealRoots = D >= 0;
  const r1 = hasRealRoots ? (-b - Math.sqrt(D)) / (2 * (a || 1)) : null;
  const r2 = hasRealRoots ? (-b + Math.sqrt(D)) / (2 * (a || 1)) : null;

  const vertexX = -b / (2 * (a || 1));
  const vertexY = a * vertexX * vertexX + b * vertexX + c;

  const width = 520;
  const height = 280;
  const originX = width / 2;
  const originY = height / 2 + 30;
  const scaleX = 28;
  const scaleY = 9;

  // Generate curve points
  const pts = [];
  for (let x = -8; x <= 8; x += 0.1) {
    const y = a * x * x + b * x + c;
    const px = originX + x * scaleX;
    const py = originY - y * scaleY;
    if (py >= -100 && py <= height + 100) {
      pts.push(`${px.toFixed(1)},${py.toFixed(1)}`);
    }
  }
  const pathD = pts.length > 1 ? `M ${pts.join(' L ')}` : '';

  const vertexPx = originX + vertexX * scaleX;
  const vertexPy = originY - vertexY * scaleY;

  return (
    <div className="relative w-full flex flex-col items-center">
      <div className="w-full h-[280px] bg-[#060a14] rounded-xl border border-slate-800/90 relative overflow-hidden flex items-center justify-center">
        <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`}>
          {/* Grid lines */}
          {[-6, -4, -2, 2, 4, 6].map((i) => (
            <line
              key={`grid-x-${i}`}
              x1={originX + i * scaleX}
              y1={0}
              x2={originX + i * scaleX}
              y2={height}
              stroke="#1e293b"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
          ))}
          {[-10, 0, 10, 20].map((i) => (
            <line
              key={`grid-y-${i}`}
              x1={0}
              y1={originY - i * scaleY}
              x2={width}
              y2={originY - i * scaleY}
              stroke="#1e293b"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
          ))}

          {/* Coordinate axes */}
          <line x1={0} y1={originY} x2={width} y2={originY} stroke="#475569" strokeWidth="1.5" />
          <line x1={originX} y1={0} x2={originX} y2={height} stroke="#475569" strokeWidth="1.5" />
          <text x={width - 16} y={originY - 6} fill="#94a3b8" fontSize="10" fontFamily="monospace">x</text>
          <text x={originX + 6} y={14} fill="#94a3b8" fontSize="10" fontFamily="monospace">y</text>

          {/* Parabola curve */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.5"
              className="drop-shadow-[0_0_10px_rgba(56,189,248,0.7)]"
            />
          )}

          {/* Vertex point */}
          <circle cx={vertexPx} cy={vertexPy} r="5" fill="#c084fc" className="animate-pulse" />
          <text
            x={vertexPx + 8}
            y={vertexPy - 6}
            fill="#c084fc"
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
          >
            Vertex ({vertexX.toFixed(2)}, {vertexY.toFixed(2)})
          </text>

          {/* Real roots on x-axis */}
          {hasRealRoots && r1 !== null && (
            <>
              <circle cx={originX + r1 * scaleX} cy={originY} r="5" fill="#f43f5e" />
              <text
                x={originX + r1 * scaleX}
                y={originY + 16}
                fill="#f43f5e"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
              >
                x₁ = {r1.toFixed(2)}
              </text>
            </>
          )}

          {hasRealRoots && r2 !== null && Math.abs(r1 - r2) > 0.1 && (
            <>
              <circle cx={originX + r2 * scaleX} cy={originY} r="5" fill="#fbbf24" />
              <text
                x={originX + r2 * scaleX}
                y={originY + 16}
                fill="#fbbf24"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
              >
                x₂ = {r2.toFixed(2)}
              </text>
            </>
          )}
        </svg>

        {/* Live Parameter Badge */}
        <div className="absolute top-2 right-2 bg-slate-900/90 border border-slate-800 rounded-lg p-2 font-mono text-[11px] shadow-lg text-right">
          <div className="text-cyan-300 font-bold">
            y = {a}x² {b >= 0 ? `+ ${b}x` : `- ${Math.abs(b)}x`} {c >= 0 ? `+ ${c}` : `- ${Math.abs(c)}`}
          </div>
          <div className="text-slate-400 text-[10px]">
            Δ = {D.toFixed(1)} ({hasRealRoots ? (D === 0 ? '1 root' : '2 real roots') : 'No real roots'})
          </div>
        </div>
      </div>
    </div>
  );
}
