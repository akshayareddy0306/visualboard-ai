import React from 'react';

export default function TrigVisualizer({ data, studentValues }) {
  const amp = studentValues?.amplitude ?? (data?.amplitude ?? 1);
  const freq = studentValues?.frequency ?? (data?.frequency ?? 1);
  const shift = studentValues?.verticalShift ?? (data?.verticalShift ?? 0);
  const func = data?.func || 'sin';
  const isTan = func === 'tan';

  const width = 520;
  const height = 280;
  const originX = 50;
  const originY = height / 2;
  const scaleX = 36;
  const scaleY = isTan ? 18 : 24;

  // Generate curve segments (separated at asymptotes for tan)
  const segments = [];
  let currentSegment = [];
  const step = 0.03;

  for (let x = 0; x <= 12; x += step) {
    let y = 0;
    let valid = true;

    if (func === 'cos') {
      y = amp * Math.cos(freq * x) + shift;
    } else if (isTan) {
      const angle = freq * x;
      // Distance from odd multiple of pi/2
      const modPi = ((angle % Math.PI) + Math.PI) % Math.PI;
      if (Math.abs(modPi - Math.PI / 2) < 0.08) {
        valid = false;
      } else {
        const rawTan = Math.tan(angle);
        if (Math.abs(rawTan) > 8) {
          valid = false;
        } else {
          y = amp * rawTan + shift;
        }
      }
    } else {
      y = amp * Math.sin(freq * x) + shift;
    }

    if (valid) {
      const px = originX + x * scaleX;
      const py = originY - y * scaleY;
      if (py >= -20 && py <= height + 20) {
        currentSegment.push(`${px.toFixed(1)},${py.toFixed(1)}`);
      } else {
        if (currentSegment.length > 0) {
          segments.push(currentSegment);
          currentSegment = [];
        }
      }
    } else {
      if (currentSegment.length > 0) {
        segments.push(currentSegment);
        currentSegment = [];
      }
    }
  }
  if (currentSegment.length > 0) {
    segments.push(currentSegment);
  }

  const pathD = segments.map((seg) => `M ${seg.join(' L ')}`).join(' ');
  const midlinePy = originY - shift * scaleY;
  const periodVal = isTan
    ? Math.PI / (Math.abs(freq) || 1)
    : (2 * Math.PI) / (Math.abs(freq) || 1);

  return (
    <div className="relative w-full flex flex-col items-center">
      <div className="w-full h-[280px] bg-[#060a14] rounded-xl border border-slate-800/90 relative overflow-hidden flex items-center justify-center">
        <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`}>
          {/* Grid lines */}
          <line x1={0} y1={originY} x2={width} y2={originY} stroke="#334155" strokeWidth="1.5" />
          <line x1={originX} y1={0} x2={originX} y2={height} stroke="#475569" strokeWidth="1.5" />

          {/* Midline */}
          <line
            x1={0}
            y1={midlinePy}
            x2={width}
            y2={midlinePy}
            stroke="#c084fc"
            strokeWidth="1.5"
            strokeDasharray="4,4"
          />
          <text x={width - 100} y={midlinePy - 6} fill="#c084fc" fontSize="10" fontFamily="monospace">
            Midline y = {shift}
          </text>

          {/* Sine/Cosine/Tangent Curve */}
          <path
            d={pathD}
            fill="none"
            stroke={isTan ? '#38bdf8' : '#a855f7'}
            strokeWidth="2.5"
            className={isTan ? 'drop-shadow-[0_0_10px_rgba(56,189,248,0.7)]' : 'drop-shadow-[0_0_10px_rgba(168,85,247,0.7)]'}
          />

          {/* Period markers on x-axis */}
          <text x={originX + 6} y={originY - 6} fill="#94a3b8" fontSize="10" fontFamily="monospace">0</text>
          <text x={originX + periodVal * scaleX} y={originY + 14} fill="#fbbf24" fontSize="10" fontFamily="monospace" fontWeight="bold">
            T = {periodVal.toFixed(2)} rad
          </text>
          <line
            x1={originX + periodVal * scaleX}
            y1={originY - 5}
            x2={originX + periodVal * scaleX}
            y2={originY + 5}
            stroke="#fbbf24"
            strokeWidth="2"
          />
        </svg>

        {/* Live Metrics Badge */}
        <div className="absolute top-2 right-2 bg-slate-900/90 border border-slate-800 rounded-lg p-2 font-mono text-[11px] shadow-lg text-right">
          <div className={isTan ? 'text-cyan-300 font-bold' : 'text-purple-300 font-bold'}>
            y = {amp !== 1 ? (amp === -1 ? '-' : amp) : ''}{func}({freq !== 1 ? (freq === -1 ? '-' : freq) : ''}x){shift !== 0 ? (shift > 0 ? ` + ${shift}` : ` - ${Math.abs(shift)}`) : ''}
          </div>
          <div className="text-slate-400 text-[10px]">
            {isTan ? 'Scale: ' : 'Amp: '}<span className="text-cyan-300 font-semibold">{amp}</span> | Period: <span className="text-amber-300 font-semibold">{periodVal.toFixed(2)} rad</span>
          </div>
          <div className="text-slate-400 text-[10px]">
            Range: {isTan ? '(-∞, +∞)' : `[${shift - Math.abs(amp)}, ${shift + Math.abs(amp)}]`}
          </div>
        </div>
      </div>
    </div>
  );
}
