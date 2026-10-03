import React from 'react';

/**
 * High-Precision Parabola Visualizer for VisualBoard AI
 * 
 * Requirements:
 * 1. Viewport dynamically computed from math: roots, vertex, y-intercept, origin, + 25% padding.
 * 2. Range symmetric around origin: all four quadrants visible, x & y axes cross at center.
 * 3. Gridlines, axis arrows (x, -x, y, -y), tick labels, and marked roots, vertex, intercepts with labeled dots.
 * 4. Fixed aspect ratio 16/10: no internal scrolling, curve strictly inside plot area with SVG clipPath.
 */
export default function ParabolaVisualizer({ data, studentValues }) {
  // Coefficients
  const a = studentValues?.a ?? (data?.a ?? 1);
  const b = studentValues?.b ?? (data?.b ?? 0);
  const c = studentValues?.c ?? (data?.c ?? -36);

  const safeA = a === 0 ? 0.0001 : a;
  const D = b * b - 4 * safeA * c;
  const hasRealRoots = D >= 0;
  const r1Raw = hasRealRoots ? (-b - Math.sqrt(D)) / (2 * safeA) : null;
  const r2Raw = hasRealRoots ? (-b + Math.sqrt(D)) / (2 * safeA) : null;

  // Sorted roots
  const r1 = r1Raw !== null && r2Raw !== null ? Math.min(r1Raw, r2Raw) : r1Raw;
  const r2 = r1Raw !== null && r2Raw !== null ? Math.max(r1Raw, r2Raw) : r2Raw;

  // Vertex
  const vertexX = -b / (2 * safeA);
  const vertexY = safeA * vertexX * vertexX + b * vertexX + c;

  // 1. Dynamic Viewport from Math (roots, vertex, y-intercept (0, c), and origin (0, 0))
  const keyPointsX = [0, vertexX];
  const keyPointsY = [0, vertexY, c];

  if (hasRealRoots) {
    if (r1 !== null) keyPointsX.push(r1);
    if (r2 !== null) keyPointsX.push(r2);
  }

  // 2. Symmetric Range around Origin (all 4 quadrants visible, axes cross at center)
  const maxX = Math.max(...keyPointsX.map((x) => Math.abs(x || 0)), 1);
  const maxY = Math.max(...keyPointsY.map((y) => Math.abs(y || 0)), 1);

  // 25% padding
  const xBound = Math.max(maxX * 1.25, 2);
  const yBound = Math.max(maxY * 1.25, 2);

  // 4. Dimensions & Aspect Ratio 16/10 (640 x 400 viewBox)
  const SVG_WIDTH = 640;
  const SVG_HEIGHT = 400; // 640 / 400 = 1.6 = 16/10
  const marginX = 40;
  const marginY = 25;
  const plotWidth = SVG_WIDTH - 2 * marginX; // 560
  const plotHeight = SVG_HEIGHT - 2 * marginY; // 350 (560 / 350 = 16/10)

  // Origin is centered exactly in the middle of plot area
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

  // Generate curve points across [-xBound, xBound]
  const numPoints = 260;
  const stepX = (2 * xBound) / numPoints;
  const pts = [];
  for (let i = 0; i <= numPoints; i++) {
    const x = -xBound + i * stepX;
    const y = safeA * x * x + b * x + c;
    // Keep values within sensible rendering range
    if (y >= -6 * yBound && y <= 6 * yBound) {
      pts.push(`${toPx(x).toFixed(1)},${toPy(y).toFixed(1)}`);
    }
  }
  const pathD = pts.length > 1 ? `M ${pts.join(' L ')}` : '';

  // Critical Points Pixels
  const vPx = toPx(vertexX);
  const vPy = toPy(vertexY);
  const yIntPy = toPy(c);

  // Check if Vertex and Y-Intercept coincide (e.g. b = 0)
  const vertexIsYInt = Math.abs(vertexX) < 0.001 && Math.abs(vertexY - c) < 0.001;

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* 4. Fixed 16/10 Aspect Ratio Container (No internal scrolling) */}
      <div className="w-full aspect-[16/10] bg-[#060a14] rounded-xl border border-slate-800/90 relative overflow-hidden flex items-center justify-center select-none shadow-2xl">
        <svg
          className="w-full h-full"
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* 4. Clip Path keeps curve strictly inside plot area */}
            <clipPath id="parabola-plot-area-clip">
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

          {/* 3. Gridlines (X & Y) */}
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

          {/* 2 & 3. Coordinate Axes crossing in the exact center with Axis Arrows */}
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
          {/* X Axis Labels */}
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
          {/* Y Axis Labels */}
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

          {/* 3. Tick notches and labels on X-Axis */}
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

          {/* 3. Tick notches and labels on Y-Axis */}
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

          {/* 4. Parabola curve (Kept strictly inside plot area with clipPath) */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.5"
              clipPath="url(#parabola-plot-area-clip)"
              className="drop-shadow-[0_0_10px_rgba(56,189,248,0.7)]"
            />
          )}

          {/* 3. Labeled Dots: Vertex and Intercepts */}

          {/* Combined Vertex & Y-Intercept (when vertex is on y-axis) */}
          {vertexIsYInt ? (
            <g className="transition-all duration-300">
              <circle
                cx={vPx}
                cy={vPy}
                r="6"
                fill="#c084fc"
                stroke="#38bdf8"
                strokeWidth="1.5"
                className="animate-pulse"
              />
              {/* Pill badge for Vertex & y-int */}
              <g
                transform={`translate(${vPx > SVG_WIDTH - 160 ? vPx - 150 : Math.max(marginX + 10, vPx - 75)}, ${
                  vertexY < 0 ? Math.max(marginY + 10, vPy - 32) : Math.min(SVG_HEIGHT - marginY - 30, vPy + 12)
                })`}
              >
                <rect
                  width="150"
                  height="22"
                  rx="6"
                  fill="#0b1120"
                  stroke="#c084fc"
                  strokeWidth="1"
                  fillOpacity="0.92"
                />
                <text
                  x="75"
                  y="15"
                  fill="#c084fc"
                  fontSize="10.5"
                  fontFamily="monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  Vertex & y-int (0, {formatCoord(vertexY)})
                </text>
              </g>
            </g>
          ) : (
            <>
              {/* Separate Vertex Dot */}
              <g className="transition-all duration-300">
                <circle
                  cx={vPx}
                  cy={vPy}
                  r="5.5"
                  fill="#c084fc"
                  stroke="#ffffff"
                  strokeWidth="1"
                  className="animate-pulse"
                />
                <g
                  transform={`translate(${vPx > SVG_WIDTH - 140 ? vPx - 130 : Math.max(marginX + 10, vPx - 65)}, ${
                    vertexY < 0 ? Math.max(marginY + 10, vPy - 30) : Math.min(SVG_HEIGHT - marginY - 30, vPy + 12)
                  })`}
                >
                  <rect
                    width="130"
                    height="20"
                    rx="5"
                    fill="#0b1120"
                    stroke="#c084fc"
                    strokeWidth="1"
                    fillOpacity="0.92"
                  />
                  <text
                    x="65"
                    y="14"
                    fill="#c084fc"
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    Vertex ({formatCoord(vertexX)}, {formatCoord(vertexY)})
                  </text>
                </g>
              </g>

              {/* Separate Y-Intercept Dot (0, c) */}
              <g className="transition-all duration-300">
                <circle
                  cx={originX}
                  cy={yIntPy}
                  r="5"
                  fill="#34d399"
                  stroke="#ffffff"
                  strokeWidth="1"
                />
                <g
                  transform={`translate(${originX + 10}, ${
                    yIntPy > SVG_HEIGHT - marginY - 25 ? yIntPy - 25 : Math.max(marginY + 10, yIntPy - 10)
                  })`}
                >
                  <rect
                    width="105"
                    height="20"
                    rx="5"
                    fill="#0b1120"
                    stroke="#34d399"
                    strokeWidth="1"
                    fillOpacity="0.92"
                  />
                  <text
                    x="52"
                    y="14"
                    fill="#34d399"
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    y-int (0, {formatCoord(c)})
                  </text>
                </g>
              </g>
            </>
          )}

          {/* 3. Real Roots Labeled Dots on X-Axis */}
          {hasRealRoots && r1 !== null && (
            <g className="transition-all duration-300">
              <circle
                cx={toPx(r1)}
                cy={originY}
                r="5.5"
                fill="#f43f5e"
                stroke="#ffffff"
                strokeWidth="1"
              />
              <g
                transform={`translate(${toPx(r1) - 40}, ${
                  originY > SVG_HEIGHT / 2 + 30 ? originY - 26 : originY + 12
                })`}
              >
                <rect
                  width="80"
                  height="18"
                  rx="4"
                  fill="#0b1120"
                  stroke="#f43f5e"
                  strokeWidth="1"
                  fillOpacity="0.92"
                />
                <text
                  x="40"
                  y="13"
                  fill="#f43f5e"
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  x₁ = {formatCoord(r1)}
                </text>
              </g>
            </g>
          )}

          {hasRealRoots && r2 !== null && Math.abs(r1 - r2) > 0.05 && (
            <g className="transition-all duration-300">
              <circle
                cx={toPx(r2)}
                cy={originY}
                r="5.5"
                fill="#fbbf24"
                stroke="#ffffff"
                strokeWidth="1"
              />
              <g
                transform={`translate(${toPx(r2) - 40}, ${
                  originY > SVG_HEIGHT / 2 + 30 ? originY - 26 : originY + 12
                })`}
              >
                <rect
                  width="80"
                  height="18"
                  rx="4"
                  fill="#0b1120"
                  stroke="#fbbf24"
                  strokeWidth="1"
                  fillOpacity="0.92"
                />
                <text
                  x="40"
                  y="13"
                  fill="#fbbf24"
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  x₂ = {formatCoord(r2)}
                </text>
              </g>
            </g>
          )}
        </svg>

        {/* Live Parameter Badge */}
        <div className="absolute top-2.5 right-2.5 bg-slate-900/90 border border-slate-800 rounded-lg p-2 font-mono text-[11px] shadow-lg text-right pointer-events-none backdrop-blur-sm">
          <div className="text-cyan-300 font-bold">
            y = {a !== 1 ? (a === -1 ? '-' : a) : ''}x² {b > 0 ? `+ ${b}x` : b < 0 ? `- ${Math.abs(b)}x` : ''} {c > 0 ? `+ ${c}` : c < 0 ? `- ${Math.abs(c)}` : ''}
          </div>
          <div className="text-slate-400 text-[10px]">
            Δ = {D.toFixed(1)} ({hasRealRoots ? (Math.abs(r1 - r2) < 0.001 ? '1 repeated root' : '2 real roots') : 'No real roots'})
          </div>
        </div>
      </div>
    </div>
  );
}
