import React from 'react';

/**
 * Visualizer for 2D Regular Polygons
 * Displays regular polygon with n sides, side length s, radius, apothem, perimeter, and area
 */
export default function PolygonVisualizer({ data, studentValues }) {
  const sides = studentValues?.sides ?? (data?.sides ?? 6);
  const sideLength = studentValues?.sideLength ?? studentValues?.s ?? (data?.sideLength ?? data?.s ?? 6);
  const unit = data?.unit || 'cm';

  const n = Math.max(3, Math.min(12, Math.round(sides)));
  const s = Math.max(1, sideLength);

  // Geometry calculations:
  // Interior angle = (n - 2) * 180 / n
  // Apothem a = s / (2 * tan(pi / n))
  // Radius R = s / (2 * sin(pi / n))
  // Area = (n * s * apothem) / 2
  // Perimeter = n * s
  const interiorAngle = ((n - 2) * 180) / n;
  const apothem = s / (2 * Math.tan(Math.PI / n));
  const radius = s / (2 * Math.sin(Math.PI / n));
  const perimeter = n * s;
  const area = (n * s * apothem) / 2;

  const viewBoxW = 520;
  const viewBoxH = 280;
  const cx = viewBoxW / 2;
  const cy = viewBoxH / 2;

  // Scale to fit comfortably
  const maxR = 95;
  const scale = maxR / Math.max(radius, 1);
  const svgR = radius * scale;

  const points = [];
  for (let i = 0; i < n; i++) {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    const px = cx + svgR * Math.cos(angle);
    const py = cy + svgR * Math.sin(angle);
    points.push(`${px.toFixed(1)},${py.toFixed(1)}`);
  }

  return (
    <div className="relative w-full flex flex-col items-center">
      <div className="w-full h-[290px] bg-[#060a14] rounded-xl border border-slate-800/90 relative overflow-hidden flex items-center justify-center">
        <svg className="w-full h-full" viewBox={`0 0 ${viewBoxW} ${viewBoxH}`}>
          <defs>
            <radialGradient id="polyGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0.08" />
            </radialGradient>
          </defs>

          {/* Regular Polygon */}
          <polygon
            points={points.join(' ')}
            fill="url(#polyGrad)"
            stroke="#22d3ee"
            strokeWidth="2.5"
            className="drop-shadow-[0_0_12px_rgba(6,182,212,0.4)]"
          />

          {/* Center Point */}
          <circle cx={cx} cy={cy} r="3.5" fill="#f43f5e" />

          {/* Apothem Line to first edge midpoint */}
          <line
            x1={cx}
            y1={cy}
            x2={cx + apothem * scale * Math.cos((2 * Math.PI * 0.5) / n - Math.PI / 2)}
            y2={cy + apothem * scale * Math.sin((2 * Math.PI * 0.5) / n - Math.PI / 2)}
            stroke="#fde047"
            strokeWidth="1.5"
            strokeDasharray="3,2"
          />

          {/* Vertices */}
          {points.map((pt, i) => {
            const [px, py] = pt.split(',').map(Number);
            return <circle key={i} cx={px} cy={py} r="4" fill="#38bdf8" />;
          })}

          {/* Interior Area Label */}
          <text
            x={cx}
            y={cy + 4}
            fill="#ffffff"
            fontSize="13"
            fontFamily="monospace"
            fontWeight="bold"
            textAnchor="middle"
          >
            Area = {area.toFixed(2)} {unit}²
          </text>
        </svg>

        {/* Live Metrics Overlay */}
        <div className="absolute top-2 right-2 bg-slate-900/90 border border-slate-800 rounded-lg p-2 font-mono text-[11px] shadow-lg text-right">
          <div><span className="text-slate-400">Polygon: </span><span className="text-cyan-300 font-bold">n = {n} sides</span></div>
          <div><span className="text-slate-400">Perimeter: </span><span className="text-purple-300 font-bold">{perimeter.toFixed(1)} {unit}</span></div>
          <div><span className="text-slate-400">Interior Angle: </span><span className="text-amber-300 font-bold">{interiorAngle.toFixed(1)}°</span></div>
        </div>
      </div>
    </div>
  );
}
