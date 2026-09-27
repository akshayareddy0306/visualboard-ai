import React from 'react';

export default function Solid3DVisualizer({ data, studentValues, type = 'CUBE' }) {
  const isCube = type === 'CUBE' || !data?.length;

  const side = studentValues?.side ?? (data?.side ?? 6);
  const l = studentValues?.length ?? (data?.length ?? 8);
  const w = studentValues?.width ?? (data?.width ?? 5);
  const h = studentValues?.height ?? (data?.height ?? 3);
  const yaw = studentValues?.yaw ?? 40;
  const pitch = 25;

  const dimX = isCube ? side : l;
  const dimY = isCube ? side : h;
  const dimZ = isCube ? side : w;

  const unit = data?.unit || 'cm';
  const liveVol = isCube ? Math.pow(side, 3) : l * w * h;
  const liveArea = isCube ? 6 * Math.pow(side, 2) : 2 * (l * w + w * h + h * l);

  const width = 520;
  const height = 280;
  const cx = width / 2;
  const cy = height / 2;

  // Scale down dimensions to fit nicely within 280px height
  const maxDim = Math.max(dimX, dimY, dimZ, 1);
  const baseScale = (100 / maxDim);

  const radYaw = (yaw * Math.PI) / 180;
  const radPitch = (pitch * Math.PI) / 180;

  const project = (x, y, z) => {
    // Center at (0, 0, 0)
    const sx = (x - dimX / 2) * baseScale;
    const sy = (y - dimY / 2) * baseScale;
    const sz = (z - dimZ / 2) * baseScale;

    // Rotate around Y axis (yaw)
    const x1 = sx * Math.cos(radYaw) + sz * Math.sin(radYaw);
    const z1 = -sx * Math.sin(radYaw) + sz * Math.cos(radYaw);

    // Rotate around X axis (pitch)
    const y2 = sy * Math.cos(radPitch) - z1 * Math.sin(radPitch);

    return { px: cx + x1, py: cy - y2 };
  };

  // 8 vertices of cuboid/cube:
  // 0: (0,0,0), 1: (dimX,0,0), 2: (dimX,dimY,0), 3: (0,dimY,0)
  // 4: (0,0,dimZ), 5: (dimX,0,dimZ), 6: (dimX,dimY,dimZ), 7: (0,dimY,dimZ)
  const v = [
    project(0, 0, 0),
    project(dimX, 0, 0),
    project(dimX, dimY, 0),
    project(0, dimY, 0),
    project(0, 0, dimZ),
    project(dimX, 0, dimZ),
    project(dimX, dimY, dimZ),
    project(0, dimY, dimZ),
  ];

  return (
    <div className="relative w-full flex flex-col items-center">
      <div className="w-full h-[280px] bg-[#060a14] rounded-xl border border-slate-800/90 relative overflow-hidden flex items-center justify-center">
        <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`}>
          {/* Back hidden edges */}
          <line x1={v[0].px} y1={v[0].py} x2={v[1].px} y2={v[1].py} stroke="#334155" strokeWidth="1.5" strokeDasharray="3,3" />
          <line x1={v[0].px} y1={v[0].py} x2={v[3].px} y2={v[3].py} stroke="#334155" strokeWidth="1.5" strokeDasharray="3,3" />
          <line x1={v[0].px} y1={v[0].py} x2={v[4].px} y2={v[4].py} stroke="#334155" strokeWidth="1.5" strokeDasharray="3,3" />

          {/* Shaded Translucent Faces */}
          {/* Top Face (3, 2, 6, 7) */}
          <polygon
            points={`${v[3].px},${v[3].py} ${v[2].px},${v[2].py} ${v[6].px},${v[6].py} ${v[7].px},${v[7].py}`}
            fill="rgba(168, 85, 247, 0.25)"
            stroke="#c084fc"
            strokeWidth="2"
          />

          {/* Right Face (1, 5, 6, 2) */}
          <polygon
            points={`${v[1].px},${v[1].py} ${v[5].px},${v[5].py} ${v[6].px},${v[6].py} ${v[2].px},${v[2].py}`}
            fill="rgba(99, 102, 241, 0.22)"
            stroke="#6366f1"
            strokeWidth="2"
          />

          {/* Front Face (4, 5, 6, 7) */}
          <polygon
            points={`${v[4].px},${v[4].py} ${v[5].px},${v[5].py} ${v[6].px},${v[6].py} ${v[7].px},${v[7].py}`}
            fill="rgba(56, 189, 248, 0.2)"
            stroke="#38bdf8"
            strokeWidth="2"
          />

          {/* Vertices */}
          {v.map((pt, i) => (
            <circle key={`v-${i}`} cx={pt.px} cy={pt.py} r="3" fill="#ffffff" />
          ))}

          {/* Dimension Labels */}
          {isCube ? (
            <text
              x={(v[4].px + v[5].px) / 2}
              y={(v[4].py + v[5].py) / 2 + 18}
              fill="#38bdf8"
              fontSize="12"
              fontFamily="monospace"
              fontWeight="bold"
              textAnchor="middle"
            >
              s = {side} {unit}
            </text>
          ) : (
            <>
              <text
                x={(v[4].px + v[5].px) / 2}
                y={(v[4].py + v[5].py) / 2 + 18}
                fill="#38bdf8"
                fontSize="11"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
              >
                l = {l} {unit}
              </text>
              <text
                x={(v[5].px + v[6].px) / 2 + 16}
                y={(v[5].py + v[6].py) / 2}
                fill="#c084fc"
                fontSize="11"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="start"
              >
                h = {h} {unit}
              </text>
              <text
                x={(v[4].px + v[7].px) / 2 - 16}
                y={(v[4].py + v[7].py) / 2}
                fill="#fbbf24"
                fontSize="11"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="end"
              >
                w = {w} {unit}
              </text>
            </>
          )}
        </svg>

        {/* Live Metrics Badge */}
        <div className="absolute top-2 right-2 bg-slate-900/90 border border-slate-800 rounded-lg p-2 font-mono text-[11px] shadow-lg text-right">
          <div><span className="text-slate-400">Volume V: </span><span className="text-cyan-300 font-bold">{liveVol} {unit}³</span></div>
          <div><span className="text-slate-400">Surface Area: </span><span className="text-purple-300 font-bold">{liveArea} {unit}²</span></div>
          <div className="text-[10px] text-slate-500">Angle: {yaw}°</div>
        </div>
      </div>
    </div>
  );
}
