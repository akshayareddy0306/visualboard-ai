import React from 'react';

/**
 * Visualizer for 3D Geometry: Plane in 3D Space
 * Standard form: Ax + By + Cz + D = 0
 * Displays intercept triangle / plane surface and normal vector n = <A, B, C>
 */
export default function Plane3DVisualizer({ data, studentValues }) {
  const A = studentValues?.A ?? (data?.A ?? 2);
  const B = studentValues?.B ?? (data?.B ?? 3);
  const C = studentValues?.C ?? (data?.C ?? 4);
  const D = studentValues?.D ?? (data?.D ?? -12);

  // Intercepts: x = -D/A, y = -D/B, z = -D/C
  const xInt = A !== 0 ? -D / A : 0;
  const yInt = B !== 0 ? -D / B : 0;
  const zInt = C !== 0 ? -D / C : 0;
  const normMag = Math.sqrt(A * A + B * B + C * C);
  const distOrigin = Math.abs(D) / normMag;

  const viewBoxW = 520;
  const viewBoxH = 280;
  const cx = viewBoxW / 2;
  const cy = viewBoxH / 2 + 30;

  // Isometric 3D Projection
  const project = (x, y, z) => {
    const isoX = cx + (x - y) * 16 * Math.cos(Math.PI / 6);
    const isoY = cy + (x + y) * 16 * Math.sin(Math.PI / 6) - z * 16;
    return { x: isoX, y: isoY };
  };

  const pOrigin = project(0, 0, 0);
  const pX = project(Math.min(8, Math.max(-8, xInt)), 0, 0);
  const pY = project(0, Math.min(8, Math.max(-8, yInt)), 0);
  const pZ = project(0, 0, Math.min(8, Math.max(-8, zInt)));

  // Normal vector point
  const pNorm = project(A, B, C);

  return (
    <div className="relative w-full flex flex-col items-center">
      <div className="w-full h-[290px] bg-[#060a14] rounded-xl border border-slate-800/90 relative overflow-hidden flex items-center justify-center">
        <svg className="w-full h-full" viewBox={`0 0 ${viewBoxW} ${viewBoxH}`}>
          <defs>
            <linearGradient id="planeGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0.1" />
            </linearGradient>
            <marker id="planeArrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 z" fill="#f43f5e" />
            </marker>
          </defs>

          {/* 3D Coordinate Axes */}
          <line x1={pOrigin.x} y1={pOrigin.y} x2={pOrigin.x + 140 * Math.cos(Math.PI / 6)} y2={pOrigin.y + 140 * Math.sin(Math.PI / 6)} stroke="#475569" strokeWidth="1.5" />
          <line x1={pOrigin.x} y1={pOrigin.y} x2={pOrigin.x - 140 * Math.cos(Math.PI / 6)} y2={pOrigin.y + 140 * Math.sin(Math.PI / 6)} stroke="#475569" strokeWidth="1.5" />
          <line x1={pOrigin.x} y1={pOrigin.y} x2={pOrigin.x} y2={pOrigin.y - 120} stroke="#475569" strokeWidth="1.5" />

          <text x={pOrigin.x + 145 * Math.cos(Math.PI / 6)} y={pOrigin.y + 145 * Math.sin(Math.PI / 6)} fill="#64748b" fontSize="10" fontFamily="monospace">x-axis</text>
          <text x={pOrigin.x - 145 * Math.cos(Math.PI / 6) - 30} y={pOrigin.y + 145 * Math.sin(Math.PI / 6)} fill="#64748b" fontSize="10" fontFamily="monospace">y-axis</text>
          <text x={pOrigin.x + 8} y={pOrigin.y - 120} fill="#64748b" fontSize="10" fontFamily="monospace">z-axis</text>

          {/* Plane Surface (Intercept Triangle) */}
          <polygon
            points={`${pX.x},${pX.y} ${pY.x},${pY.y} ${pZ.x},${pZ.y}`}
            fill="url(#planeGrad)"
            stroke="#38bdf8"
            strokeWidth="2"
            className="drop-shadow-[0_0_12px_rgba(56,189,248,0.3)]"
          />

          {/* Intercept Markers */}
          <circle cx={pX.x} cy={pX.y} r="4" fill="#38bdf8" />
          <text x={pX.x + 6} y={pX.y + 12} fill="#38bdf8" fontSize="10" fontFamily="monospace">
            ({xInt.toFixed(1)}, 0, 0)
          </text>

          <circle cx={pY.x} cy={pY.y} r="4" fill="#818cf8" />
          <text x={pY.x - 10} y={pY.y + 12} fill="#818cf8" fontSize="10" fontFamily="monospace" textAnchor="end">
            (0, {yInt.toFixed(1)}, 0)
          </text>

          <circle cx={pZ.x} cy={pZ.y} r="4" fill="#34d399" />
          <text x={pZ.x + 8} y={pZ.y} fill="#34d399" fontSize="10" fontFamily="monospace">
            (0, 0, {zInt.toFixed(1)})
          </text>

          {/* Normal Vector */}
          <line
            x1={pOrigin.x}
            y1={pOrigin.y}
            x2={pNorm.x}
            y2={pNorm.y}
            stroke="#f43f5e"
            strokeWidth="2.5"
            markerEnd="url(#planeArrow)"
          />
          <text x={pNorm.x + 8} y={pNorm.y} fill="#f43f5e" fontSize="11" fontFamily="monospace" fontWeight="bold">
            n = ⟨{A}, {B}, {C}⟩
          </text>
        </svg>

        {/* Live Metrics Overlay */}
        <div className="absolute top-2 right-2 bg-slate-900/90 border border-slate-800 rounded-lg p-2 font-mono text-[11px] shadow-lg text-right">
          <div><span className="text-slate-400">Equation: </span><span className="text-cyan-300 font-bold">{A}x + {B}y + {C}z + {D} = 0</span></div>
          <div><span className="text-slate-400">Normal Vector: </span><span className="text-rose-400 font-bold">⟨{A}, {B}, {C}⟩</span></div>
          <div><span className="text-slate-400">Dist to Origin: </span><span className="text-emerald-300 font-bold">{distOrigin.toFixed(2)} units</span></div>
        </div>
      </div>
    </div>
  );
}
