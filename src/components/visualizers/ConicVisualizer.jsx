import React from 'react';

/**
 * Visualizer for Conic Sections: Ellipse & Hyperbola
 * Standard form:
 * Ellipse: x^2/a^2 + y^2/b^2 = 1
 * Hyperbola: x^2/a^2 - y^2/b^2 = 1
 */
export default function ConicVisualizer({ data, studentValues, type = 'ELLIPSE' }) {
  const isHyperbola = type === 'HYPERBOLA' || data?.conicType === 'HYPERBOLA';
  const a = studentValues?.a ?? (data?.a ?? 5);
  const b = studentValues?.b ?? (data?.b ?? 3);

  const viewBoxW = 520;
  const viewBoxH = 280;
  const cx = viewBoxW / 2;
  const cy = viewBoxH / 2;
  const scale = 24;

  const rx = a * scale;
  const ry = b * scale;

  // Metric computations
  const e = isHyperbola
    ? Math.sqrt(1 + (b * b) / (a * a))
    : Math.sqrt(Math.max(0, 1 - (b * b) / (a * a)));
  const c = a * e; // distance to foci
  const area = isHyperbola ? null : Math.PI * a * b;

  // Hyperbola branches
  const hyperbolaLeft = [];
  const hyperbolaRight = [];
  if (isHyperbola) {
    for (let y = -5; y <= 5; y += 0.2) {
      const x = a * Math.sqrt(1 + (y * y) / (b * b));
      hyperbolaRight.push(`${cx + x * scale},${cy - y * scale}`);
      hyperbolaLeft.push(`${cx - x * scale},${cy - y * scale}`);
    }
  }

  return (
    <div className="relative w-full flex flex-col items-center">
      <div className="w-full h-[290px] bg-[#060a14] rounded-xl border border-slate-800/90 relative overflow-hidden flex items-center justify-center">
        <svg className="w-full h-full" viewBox={`0 0 ${viewBoxW} ${viewBoxH}`}>
          <defs>
            <radialGradient id="ellipseFill" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0.05" />
            </radialGradient>
          </defs>

          {/* Coordinate Axes */}
          <line x1="20" y1={cy} x2="500" y2={cy} stroke="#334155" strokeWidth="1.5" />
          <line x1={cx} y1="20" x2={cx} y2="260" stroke="#334155" strokeWidth="1.5" />
          <text x="495" y={cy - 8} fill="#64748b" fontSize="10" fontFamily="monospace">x</text>
          <text x={cx + 8} y="30" fill="#64748b" fontSize="10" fontFamily="monospace">y</text>

          {!isHyperbola ? (
            <>
              {/* Ellipse */}
              <ellipse
                cx={cx}
                cy={cy}
                rx={Math.min(220, rx)}
                ry={Math.min(110, ry)}
                fill="url(#ellipseFill)"
                stroke="#38bdf8"
                strokeWidth="2.5"
                className="drop-shadow-[0_0_12px_rgba(56,189,248,0.4)]"
              />

              {/* Major Axis Vertex Markers */}
              <circle cx={cx + rx} cy={cy} r="4" fill="#38bdf8" />
              <circle cx={cx - rx} cy={cy} r="4" fill="#38bdf8" />
              <text x={cx + rx + 8} y={cy + 4} fill="#38bdf8" fontSize="11" fontFamily="monospace">
                A({a}, 0)
              </text>
              <text x={cx - rx - 8} y={cy + 4} fill="#38bdf8" fontSize="11" fontFamily="monospace" textAnchor="end">
                A'(-{a}, 0)
              </text>

              {/* Minor Axis Vertex Markers */}
              <circle cx={cx} cy={cy - ry} r="4" fill="#818cf8" />
              <circle cx={cx} cy={cy + ry} r="4" fill="#818cf8" />
              <text x={cx + 8} y={cy - ry - 6} fill="#818cf8" fontSize="11" fontFamily="monospace">
                B(0, {b})
              </text>

              {/* Foci */}
              <circle cx={cx + c * scale} cy={cy} r="4" fill="#f43f5e" />
              <circle cx={cx - c * scale} cy={cy} r="4" fill="#f43f5e" />
              <text x={cx + c * scale} y={cy - 8} fill="#f43f5e" fontSize="10" fontFamily="monospace" textAnchor="middle">
                F₁
              </text>
              <text x={cx - c * scale} y={cy - 8} fill="#f43f5e" fontSize="10" fontFamily="monospace" textAnchor="middle">
                F₂
              </text>
            </>
          ) : (
            <>
              {/* Hyperbola Branches */}
              <polyline points={hyperbolaRight.join(' ')} fill="none" stroke="#f43f5e" strokeWidth="2.5" />
              <polyline points={hyperbolaLeft.join(' ')} fill="none" stroke="#f43f5e" strokeWidth="2.5" />

              {/* Asymptotes y = ±(b/a)x */}
              <line
                x1={cx - 200}
                y1={cy - (200 * b) / a}
                x2={cx + 200}
                y2={cy + (200 * b) / a}
                stroke="#64748b"
                strokeWidth="1"
                strokeDasharray="4,4"
              />
              <line
                x1={cx - 200}
                y1={cy + (200 * b) / a}
                x2={cx + 200}
                y2={cy - (200 * b) / a}
                stroke="#64748b"
                strokeWidth="1"
                strokeDasharray="4,4"
              />
              <text x={cx + 180} y={cy + (180 * b) / a - 6} fill="#94a3b8" fontSize="10" fontFamily="monospace">
                Asymptote
              </text>
            </>
          )}
        </svg>

        {/* Live Metrics Overlay */}
        <div className="absolute top-2 right-2 bg-slate-900/90 border border-slate-800 rounded-lg p-2 font-mono text-[11px] shadow-lg text-right">
          <div><span className="text-slate-400">Equation: </span><span className="text-cyan-300 font-bold">x²/{a * a} {isHyperbola ? '-' : '+'} y²/{b * b} = 1</span></div>
          <div><span className="text-slate-400">Eccentricity e: </span><span className="text-purple-300 font-bold">{e.toFixed(3)}</span></div>
          {area !== null && (
            <div><span className="text-slate-400">Area (πab): </span><span className="text-emerald-300 font-bold">{area.toFixed(2)} sq units</span></div>
          )}
        </div>
      </div>
    </div>
  );
}
