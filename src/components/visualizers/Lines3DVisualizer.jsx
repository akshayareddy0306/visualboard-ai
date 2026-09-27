import React from 'react';

export default function Lines3DVisualizer({ data, studentValues }) {
  const p1x = studentValues?.p1x ?? (data?.line1?.point?.[0] ?? 0);
  const p1y = data?.line1?.point?.[1] ?? 0;
  const p1z = data?.line1?.point?.[2] ?? 0;

  const p2x = studentValues?.p2x ?? (data?.line2?.point?.[0] ?? 1);
  const p2y = data?.line2?.point?.[1] ?? 1;
  const p2z = data?.line2?.point?.[2] ?? 1;

  const d1 = data?.line1?.dir ?? [1, 0, 0];
  const d2 = data?.line2?.dir ?? [0, 1, 0];

  const yaw = studentValues?.yaw ?? 45;
  const pitch = 25;

  // Compute live cross product & distance
  const cxVal = d1[1] * d2[2] - d1[2] * d2[1];
  const cyVal = d1[2] * d2[0] - d1[0] * d2[2];
  const czVal = d1[0] * d2[1] - d1[1] * d2[0];
  const crossMag = Math.sqrt(cxVal * cxVal + cyVal * cyVal + czVal * czVal);

  const diffX = p2x - p1x;
  const diffY = p2y - p1y;
  const diffZ = p2z - p1z;
  const dot = diffX * cxVal + diffY * cyVal + diffZ * czVal;
  const liveDist = crossMag > 0 ? Math.abs(dot) / crossMag : 0;

  const width = 520;
  const height = 280;
  const centerX = width / 2;
  const centerY = height / 2;
  const scale = 14;

  const radYaw = (yaw * Math.PI) / 180;
  const radPitch = (pitch * Math.PI) / 180;

  const project = (x, y, z) => {
    const x1 = x * Math.cos(radYaw) + z * Math.sin(radYaw);
    const z1 = -x * Math.sin(radYaw) + z * Math.cos(radYaw);
    const y2 = y * Math.cos(radPitch) - z1 * Math.sin(radPitch);
    return { px: centerX + x1 * scale, py: centerY - y2 * scale };
  };

  // Line 1: points along p1 + t * d1 (t from -3 to 3)
  const l1_start = project(p1x - 3 * d1[0], p1y - 3 * d1[1], p1z - 3 * d1[2]);
  const l1_end = project(p1x + 3 * d1[0], p1y + 3 * d1[1], p1z + 3 * d1[2]);
  const l1_point = project(p1x, p1y, p1z);

  // Line 2: points along p2 + t * d2 (t from -3 to 3)
  const l2_start = project(p2x - 3 * d2[0], p2y - 3 * d2[1], p2z - 3 * d2[2]);
  const l2_end = project(p2x + 3 * d2[0], p2y + 3 * d2[1], p2z + 3 * d2[2]);
  const l2_point = project(p2x, p2y, p2z);

  // Perpendicular distance segment points
  // Approximate closest points for visual representation
  const distSegmentStart = project(p1x, p1y, p1z);
  const distSegmentEnd = project(
    p1x + (crossMag > 0 ? (cxVal / crossMag) * liveDist : 0),
    p1y + (crossMag > 0 ? (cyVal / crossMag) * liveDist : 0),
    p1z + (crossMag > 0 ? (czVal / crossMag) * liveDist : 0)
  );

  return (
    <div className="relative w-full flex flex-col items-center">
      <div className="w-full h-[280px] bg-[#060a14] rounded-xl border border-slate-800/90 relative overflow-hidden flex items-center justify-center">
        <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`}>
          {/* Reference origin and ground grid lines */}
          <line x1={centerX - 80} y1={centerY + 60} x2={centerX + 80} y2={centerY + 60} stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />

          {/* Line 1 (Cyan) */}
          <line
            x1={l1_start.px}
            y1={l1_start.py}
            x2={l1_end.px}
            y2={l1_end.py}
            stroke="#38bdf8"
            strokeWidth="3"
            className="drop-shadow-[0_0_8px_rgba(56,189,248,0.7)]"
          />
          <circle cx={l1_point.px} cy={l1_point.py} r="4" fill="#38bdf8" />
          <text
            x={l1_end.px + 6}
            y={l1_end.py - 6}
            fill="#38bdf8"
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
          >
            L₁: ⟨{d1.join(', ')}⟩
          </text>

          {/* Line 2 (Purple) */}
          <line
            x1={l2_start.px}
            y1={l2_start.py}
            x2={l2_end.px}
            y2={l2_end.py}
            stroke="#c084fc"
            strokeWidth="3"
            className="drop-shadow-[0_0_8px_rgba(192,132,252,0.7)]"
          />
          <circle cx={l2_point.px} cy={l2_point.py} r="4" fill="#c084fc" />
          <text
            x={l2_end.px + 6}
            y={l2_end.py + 12}
            fill="#c084fc"
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
          >
            L₂: ⟨{d2.join(', ')}⟩
          </text>

          {/* Common Perpendicular Shortest Distance Segment (Yellow) */}
          <line
            x1={distSegmentStart.px}
            y1={distSegmentStart.py}
            x2={distSegmentEnd.px}
            y2={distSegmentEnd.py}
            stroke="#fbbf24"
            strokeWidth="2.5"
            strokeDasharray="4,2"
            className="animate-pulse"
          />
          <circle cx={distSegmentStart.px} cy={distSegmentStart.py} r="4" fill="#fbbf24" />
          <circle cx={distSegmentEnd.px} cy={distSegmentEnd.py} r="4" fill="#fbbf24" />
          <text
            x={(distSegmentStart.px + distSegmentEnd.px) / 2 + 10}
            y={(distSegmentStart.py + distSegmentEnd.py) / 2}
            fill="#fbbf24"
            fontSize="11"
            fontFamily="monospace"
            fontWeight="bold"
          >
            d = {liveDist.toFixed(2)}
          </text>
        </svg>

        {/* Live Metrics Badge */}
        <div className="absolute top-2 right-2 bg-slate-900/90 border border-slate-800 rounded-lg p-2 font-mono text-[11px] shadow-lg text-right">
          <div><span className="text-slate-400">Shortest Distance: </span><span className="text-amber-300 font-bold">{liveDist.toFixed(2)} units</span></div>
          <div><span className="text-slate-400">Normal Vector: </span><span className="text-cyan-300">⟨{cxVal}, {cyVal}, {czVal}⟩</span></div>
          <div className="text-[10px] text-slate-500">3D Skew Lines Configuration</div>
        </div>
      </div>
    </div>
  );
}
