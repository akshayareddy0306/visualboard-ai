import React from 'react';

/**
 * High-Precision Trigonometric Wave Visualizer for VisualBoard AI
 * 
 * Supports y = A·sin(B·x) + D, y = A·cos(B·x) + D, y = A·tan(B·x) + D
 * 
 * Features:
 * 1. Symmetric 4-quadrant viewport centered at (0, 0) with 25% padding.
 * 2. 16/10 fixed aspect ratio container with zero internal scrolling.
 * 3. Gridlines, axis arrows (x, -x, y, -y), tick labels, dashed midline.
 * 4. Marked and labeled dots for Y-intercept, Peak, Trough, and Roots.
 * 5. SVG clipPath ensuring curve stays strictly within the plot area.
 */
export default function TrigVisualizer({ data, studentValues }) {
  const amp = studentValues?.amplitude ?? (data?.amplitude ?? 3);
  const freq = studentValues?.frequency ?? (data?.frequency ?? 4);
  const shift = studentValues?.verticalShift ?? (data?.verticalShift ?? 2);
  const func = data?.func || 'sin';
  const isTan = func === 'tan';
  const isCos = func === 'cos';

  const safeFreq = freq === 0 ? 0.0001 : freq;
  const periodVal = isTan
    ? Math.PI / Math.abs(safeFreq)
    : (2 * Math.PI) / Math.abs(safeFreq);

  // 1. Dynamic Viewport from Math (Amplitude, Shift, Period, Origin)
  const peakY = isTan ? 10 : shift + Math.abs(amp);
  const troughY = isTan ? -10 : shift - Math.abs(amp);
  const yInterceptVal = isCos ? amp + shift : shift;

  const maxY = Math.max(
    Math.abs(peakY),
    Math.abs(troughY),
    Math.abs(yInterceptVal),
    Math.abs(shift),
    1
  );

  // 25% padding on Y and X
  const yBound = isTan ? 12 : Math.max(maxY * 1.25, 2);
  const xBound = Math.max(2 * periodVal * 1.25, Math.PI);

  // Dimensions & Aspect Ratio 16/10 (640 x 400 viewBox)
  const SVG_WIDTH = 640;
  const SVG_HEIGHT = 400; // 640 / 400 = 1.6 = 16/10
  const marginX = 40;
  const marginY = 25;
  const plotWidth = SVG_WIDTH - 2 * marginX; // 560
  const plotHeight = SVG_HEIGHT - 2 * marginY; // 350 (560 / 350 = 16/10)

  // Origin is centered in the exact middle of plot area
  const originX = SVG_WIDTH / 2; // 320
  const originY = SVG_HEIGHT / 2; // 200

  const scaleX = (plotWidth / 2) / xBound;
  const scaleY = (plotHeight / 2) / yBound;

  const toPx = (x) => originX + x * scaleX;
  const toPy = (y) => originY - y * scaleY;

  // Nice ticks calculation
  const getNiceStep = (bound, targetTicks = 4) => {
    const rough = bound / targetTicks;
    const mag = Math.pow(10, Math.floor(Math.log10(rough)));
    const norm = rough / mag;
    let step;
    if (norm < 1.5) step = 1 * mag;
    else if (norm < 3) step = 2 * mag;
    else if (norm < 7) step = 5 * mag;
    else step = 10 * mag;
    return step;
  };

  const xStep = getNiceStep(xBound, 4);
  const xTicks = [];
  for (let val = xStep; val < xBound * 0.98; val += xStep) {
    xTicks.push(-val, val);
  }
  xTicks.sort((p, q) => p - q);

  const yStep = getNiceStep(yBound, 4);
  const yTicks = [];
  for (let val = yStep; val < yBound * 0.98; val += yStep) {
    yTicks.push(-val, val);
  }
  yTicks.sort((p, q) => p - q);

  const formatTick = (val) => {
    if (Math.abs(val) >= 1000) return val.toExponential(1);
    if (Math.abs(val - Math.round(val)) < 0.001) return Math.round(val).toString();
    return parseFloat(val.toFixed(2)).toString();
  };

  const formatCoord = (val) => {
    if (val === null || val === undefined || isNaN(val)) return '0';
    if (Math.abs(val - Math.round(val)) < 0.001) return Math.round(val).toString();
    return val.toFixed(2);
  };

  // Generate curve segments (separated at asymptotes for tan)
  const segments = [];
  let currentSegment = [];
  const numSteps = 400;
  const step = (2 * xBound) / numSteps;

  for (let i = 0; i <= numSteps; i++) {
    const x = -xBound + i * step;
    let y = 0;
    let valid = true;

    if (isCos) {
      y = amp * Math.cos(safeFreq * x) + shift;
    } else if (isTan) {
      const angle = safeFreq * x;
      const modPi = ((angle % Math.PI) + Math.PI) % Math.PI;
      if (Math.abs(modPi - Math.PI / 2) < 0.08) {
        valid = false;
      } else {
        const rawTan = Math.tan(angle);
        if (Math.abs(rawTan) > 15) {
          valid = false;
        } else {
          y = amp * rawTan + shift;
        }
      }
    } else {
      y = amp * Math.sin(safeFreq * x) + shift;
    }

    if (valid) {
      const px = toPx(x);
      const py = toPy(y);
      if (py >= -200 && py <= SVG_HEIGHT + 200) {
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
  const midlinePy = toPy(shift);

  // Key Feature Points for Labeled Dots
  // 1. Y-intercept: (0, yInterceptVal)
  const yIntPx = originX;
  const yIntPy = toPy(yInterceptVal);

  // 2. Primary Peak and Trough (for sin and cos)
  let peakPoint = null;
  let troughPoint = null;
  if (!isTan && Math.abs(amp) > 0.001) {
    let peakX = 0;
    let troughX = 0;
    if (isCos) {
      peakX = 0;
      troughX = Math.PI / Math.abs(safeFreq);
    } else {
      // sin
      peakX = (Math.PI / 2) / safeFreq;
      troughX = (3 * Math.PI / 2) / safeFreq;
    }
    // bring peakX and troughX close to origin
    while (peakX > periodVal / 2) peakX -= periodVal;
    while (peakX < -periodVal / 2) peakX += periodVal;
    while (troughX > periodVal / 2) troughX -= periodVal;
    while (troughX < -periodVal / 2) troughX += periodVal;

    peakPoint = { x: peakX, y: shift + Math.abs(amp) };
    troughPoint = { x: troughX, y: shift - Math.abs(amp) };
  }

  // 3. Real roots (x-intercepts where y = 0)
  const roots = [];
  if (!isTan && Math.abs(shift) <= Math.abs(amp) && Math.abs(amp) > 0.001) {
    const val = -shift / amp;
    if (Math.abs(val) <= 1) {
      if (isCos) {
        const base = Math.acos(val);
        const r1 = base / safeFreq;
        const r2 = -base / safeFreq;
        if (Math.abs(r1) <= xBound) roots.push(r1);
        if (Math.abs(r2) <= xBound && Math.abs(r1 - r2) > 0.05) roots.push(r2);
      } else {
        const base = Math.asin(val);
        const r1 = base / safeFreq;
        const r2 = (Math.PI - base) / safeFreq;
        if (Math.abs(r1) <= xBound) roots.push(r1);
        if (Math.abs(r2) <= xBound && Math.abs(r1 - r2) > 0.05) roots.push(r2);
      }
    }
  }

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* Fixed 16/10 Aspect Ratio Container */}
      <div className="w-full aspect-[16/10] bg-[#060a14] rounded-xl border border-slate-800/90 relative overflow-hidden flex items-center justify-center select-none shadow-2xl">
        <svg
          className="w-full h-full"
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <clipPath id="trig-plot-area-clip">
              <rect
                x={marginX}
                y={marginY}
                width={plotWidth}
                height={plotHeight}
                rx="4"
              />
            </clipPath>
          </defs>

          {/* Background Plot Area */}
          <rect
            x={marginX}
            y={marginY}
            width={plotWidth}
            height={plotHeight}
            fill="#070c18"
            stroke="#1e293b"
            strokeWidth="1"
            rx="4"
          />

          {/* Gridlines */}
          {xTicks.map((val) => (
            <line
              key={`x-grid-${val}`}
              x1={toPx(val)}
              y1={marginY}
              x2={toPx(val)}
              y2={SVG_HEIGHT - marginY}
              stroke="#172033"
              strokeWidth="1"
              strokeDasharray="3,3"
            />
          ))}
          {yTicks.map((val) => (
            <line
              key={`y-grid-${val}`}
              x1={marginX}
              y1={toPy(val)}
              x2={SVG_WIDTH - marginX}
              y2={toPy(val)}
              stroke="#172033"
              strokeWidth="1"
              strokeDasharray="3,3"
            />
          ))}

          {/* Midline Equilibrium (Dashed) */}
          {midlinePy >= marginY && midlinePy <= SVG_HEIGHT - marginY && (
            <g>
              <line
                x1={marginX}
                y1={midlinePy}
                x2={SVG_WIDTH - marginX}
                y2={midlinePy}
                stroke="#a855f7"
                strokeWidth="1.2"
                strokeDasharray="5,5"
              />
              <text
                x={SVG_WIDTH - marginX - 6}
                y={midlinePy - 6}
                fill="#c084fc"
                fontSize="9.5"
                fontFamily="monospace"
                textAnchor="end"
              >
                Midline y = {shift}
              </text>
            </g>
          )}

          {/* Coordinate Axes crossing in the exact center with Axis Arrows */}
          {/* Horizontal X-Axis */}
          <line
            x1={marginX - 15}
            y1={originY}
            x2={SVG_WIDTH - marginX + 15}
            y2={originY}
            stroke="#64748b"
            strokeWidth="1.5"
          />
          {/* Positive X Arrow */}
          <polygon
            points={`${SVG_WIDTH - marginX + 18},${originY} ${SVG_WIDTH - marginX + 8},${originY - 4} ${SVG_WIDTH - marginX + 8},${originY + 4}`}
            fill="#94a3b8"
          />
          {/* Negative X Arrow */}
          <polygon
            points={`${marginX - 18},${originY} ${marginX - 8},${originY - 4} ${marginX - 8},${originY + 4}`}
            fill="#94a3b8"
          />
          <text
            x={SVG_WIDTH - marginX + 24}
            y={originY + 4}
            fill="#94a3b8"
            fontSize="11"
            fontFamily="monospace"
            fontWeight="bold"
          >
            x
          </text>
          <text
            x={marginX - 24}
            y={originY + 4}
            fill="#94a3b8"
            fontSize="11"
            fontFamily="monospace"
            textAnchor="end"
          >
            -x
          </text>

          {/* Vertical Y-Axis */}
          <line
            x1={originX}
            y1={marginY - 12}
            x2={originX}
            y2={SVG_HEIGHT - marginY + 12}
            stroke="#64748b"
            strokeWidth="1.5"
          />
          {/* Positive Y Arrow */}
          <polygon
            points={`${originX},${marginY - 15} ${originX - 4},${marginY - 5} ${originX + 4},${marginY - 5}`}
            fill="#94a3b8"
          />
          {/* Negative Y Arrow */}
          <polygon
            points={`${originX},${SVG_HEIGHT - marginY + 15} ${originX - 4},${SVG_HEIGHT - marginY + 5} ${originX + 4},${SVG_HEIGHT - marginY + 5}`}
            fill="#94a3b8"
          />
          <text
            x={originX}
            y={marginY - 18}
            fill="#94a3b8"
            fontSize="11"
            fontFamily="monospace"
            fontWeight="bold"
            textAnchor="middle"
          >
            y
          </text>
          <text
            x={originX}
            y={SVG_HEIGHT - marginY + 28}
            fill="#94a3b8"
            fontSize="11"
            fontFamily="monospace"
            textAnchor="middle"
          >
            -y
          </text>

          {/* Origin Label (0, 0) */}
          <text
            x={originX - 6}
            y={originY + 14}
            fill="#64748b"
            fontSize="10"
            fontFamily="monospace"
            textAnchor="end"
          >
            0
          </text>

          {/* Tick Notches and Labels */}
          {xTicks.map((val) => (
            <g key={`x-tick-${val}`}>
              <line
                x1={toPx(val)}
                y1={originY - 3}
                x2={toPx(val)}
                y2={originY + 3}
                stroke="#64748b"
                strokeWidth="1.2"
              />
              <text
                x={toPx(val)}
                y={originY + 14}
                fill="#94a3b8"
                fontSize="10"
                fontFamily="monospace"
                textAnchor="middle"
              >
                {formatTick(val)}
              </text>
            </g>
          ))}
          {yTicks.map((val) => (
            <g key={`y-tick-${val}`}>
              <line
                x1={originX - 3}
                y1={toPy(val)}
                x2={originX + 3}
                y2={toPy(val)}
                stroke="#64748b"
                strokeWidth="1.2"
              />
              <text
                x={originX - 6}
                y={toPy(val) + 3}
                fill="#94a3b8"
                fontSize="10"
                fontFamily="monospace"
                textAnchor="end"
              >
                {formatTick(val)}
              </text>
            </g>
          ))}

          {/* Trigonometric Curve with clipPath */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke={isTan ? '#38bdf8' : '#a855f7'}
              strokeWidth="2.5"
              clipPath="url(#trig-plot-area-clip)"
              className={
                isTan
                  ? 'drop-shadow-[0_0_10px_rgba(56,189,248,0.7)]'
                  : 'drop-shadow-[0_0_10px_rgba(168,85,247,0.7)]'
              }
            />
          )}

          {/* Labeled Dot: Y-Intercept */}
          <g className="transition-all duration-300">
            <circle
              cx={yIntPx}
              cy={yIntPy}
              r="5.5"
              fill="#34d399"
              stroke="#ffffff"
              strokeWidth="1"
            />
            <g
              transform={`translate(${yIntPx + 10}, ${
                yIntPy > SVG_HEIGHT - marginY - 25 ? yIntPy - 25 : Math.max(marginY + 10, yIntPy - 10)
              })`}
            >
              <rect
                width="110"
                height="20"
                rx="5"
                fill="#0b1120"
                stroke="#34d399"
                strokeWidth="1"
                fillOpacity="0.92"
              />
              <text
                x="55"
                y="14"
                fill="#34d399"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
              >
                y-int (0, {formatCoord(yInterceptVal)})
              </text>
            </g>
          </g>

          {/* Labeled Dot: Primary Peak */}
          {peakPoint && (
            <g className="transition-all duration-300">
              <circle
                cx={toPx(peakPoint.x)}
                cy={toPy(peakPoint.y)}
                r="5"
                fill="#c084fc"
                stroke="#ffffff"
                strokeWidth="1"
                className="animate-pulse"
              />
              <g
                transform={`translate(${toPx(peakPoint.x) - 45}, ${
                  toPy(peakPoint.y) < marginY + 25 ? toPy(peakPoint.y) + 12 : toPy(peakPoint.y) - 24
                })`}
              >
                <rect
                  width="90"
                  height="18"
                  rx="4"
                  fill="#0b1120"
                  stroke="#c084fc"
                  strokeWidth="1"
                  fillOpacity="0.92"
                />
                <text
                  x="45"
                  y="13"
                  fill="#c084fc"
                  fontSize="9.5"
                  fontFamily="monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  Peak ({formatCoord(peakPoint.x)}, {formatCoord(peakPoint.y)})
                </text>
              </g>
            </g>
          )}

          {/* Labeled Dot: Primary Trough */}
          {troughPoint && (
            <g className="transition-all duration-300">
              <circle
                cx={toPx(troughPoint.x)}
                cy={toPy(troughPoint.y)}
                r="5"
                fill="#f43f5e"
                stroke="#ffffff"
                strokeWidth="1"
              />
              <g
                transform={`translate(${toPx(troughPoint.x) - 45}, ${
                  toPy(troughPoint.y) > SVG_HEIGHT - marginY - 25 ? toPy(troughPoint.y) - 24 : toPy(troughPoint.y) + 12
                })`}
              >
                <rect
                  width="90"
                  height="18"
                  rx="4"
                  fill="#0b1120"
                  stroke="#f43f5e"
                  strokeWidth="1"
                  fillOpacity="0.92"
                />
                <text
                  x="45"
                  y="13"
                  fill="#f43f5e"
                  fontSize="9.5"
                  fontFamily="monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  Trough ({formatCoord(troughPoint.x)}, {formatCoord(troughPoint.y)})
                </text>
              </g>
            </g>
          )}

          {/* Labeled Dots: Roots (x-intercepts where y = 0) */}
          {roots.map((r, idx) => (
            <g key={`trig-root-${idx}`} className="transition-all duration-300">
              <circle
                cx={toPx(r)}
                cy={originY}
                r="5"
                fill={idx === 0 ? '#38bdf8' : '#fbbf24'}
                stroke="#ffffff"
                strokeWidth="1"
              />
              <g
                transform={`translate(${toPx(r) - 35}, ${
                  originY > SVG_HEIGHT / 2 + 20 ? originY - 24 : originY + 12
                })`}
              >
                <rect
                  width="70"
                  height="18"
                  rx="4"
                  fill="#0b1120"
                  stroke={idx === 0 ? '#38bdf8' : '#fbbf24'}
                  strokeWidth="1"
                  fillOpacity="0.92"
                />
                <text
                  x="35"
                  y="13"
                  fill={idx === 0 ? '#38bdf8' : '#fbbf24'}
                  fontSize="9.5"
                  fontFamily="monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  x = {formatCoord(r)}
                </text>
              </g>
            </g>
          ))}
        </svg>

        {/* Live Metrics Badge */}
        <div className="absolute top-2.5 right-2.5 bg-slate-900/90 border border-slate-800 rounded-lg p-2 font-mono text-[11px] shadow-lg text-right pointer-events-none backdrop-blur-sm">
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
