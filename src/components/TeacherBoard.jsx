import React, { useRef, useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { PenTool, Keyboard } from 'lucide-react';
import { SAMPLE_PROBLEMS } from '../data/sampleProblems';

const TeacherBoard = forwardRef(function TeacherBoard({
  tool = 'pen',
  color = '#38bdf8',
  strokeWidth = 3,
  eraserWidth = 24,
  gridStyle = 'dots',
  onStrokeCountChange,
  onColorChange,
  inputMode = 'draw', // 'draw' | 'type'
  setInputMode,
  typedText = '',
  setTypedText,
  onSubmitTyped,
}, ref) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const pointsRef = useRef([]);
  const historyRef = useRef([]);
  const [strokeCount, setStrokeCount] = useState(0);
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100, visible: false });

  // Persistent refs for active tool settings to avoid stale closures and ensure immediate context updates
  const colorRef = useRef(color);
  const strokeWidthRef = useRef(strokeWidth);
  const toolRef = useRef(tool);

  // Get canvas context
  const getContext = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext('2d');
  }, []);

  // Update context when color or tool changes
  useEffect(() => {
    colorRef.current = color;
    const ctx = getContext();
    if (ctx && tool === 'pen') {
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
    }
  }, [color, tool, getContext]);

  useEffect(() => {
    strokeWidthRef.current = strokeWidth;
    const ctx = getContext();
    if (ctx && tool === 'pen') {
      ctx.lineWidth = strokeWidth;
    }
  }, [strokeWidth, tool, getContext]);

  useEffect(() => {
    toolRef.current = tool;
    const ctx = getContext();
    if (ctx) {
      if (tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = eraserWidth;
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = colorRef.current || color;
        ctx.fillStyle = colorRef.current || color;
        ctx.lineWidth = strokeWidthRef.current || strokeWidth;
      }
    }
  }, [tool, color, strokeWidth, eraserWidth, getContext]);

  // Save current canvas state to history stack
  const saveSnapshot = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = getContext();
    if (!canvas || !ctx) return;
    
    if (historyRef.current.length >= 30) {
      historyRef.current.shift();
    }
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    historyRef.current.push(imageData);
  }, [getContext]);

  // Resize canvas to match display size with HiDPI support
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const dpr = window.devicePixelRatio || 1;
    const targetWidth = Math.round(rect.width * dpr);
    const targetHeight = Math.round(rect.height * dpr);

    // If buffer already matches target dimensions, ensure style is synced and return without wiping canvas
    if (canvas.width === targetWidth && canvas.height === targetHeight) {
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let tempCanvas = null;
    if (canvas.width > 0 && canvas.height > 0) {
      tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.drawImage(canvas, 0, 0);
    }

    // Set physical buffer dimensions matching device pixel ratio
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    // Set CSS display dimensions to match parent container exactly
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    // Reset transform matrix to exact DPR scale (prevents compounding or magnification)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = colorRef.current || color;
    ctx.fillStyle = colorRef.current || color;
    ctx.lineWidth = strokeWidthRef.current || strokeWidth;

    if (tempCanvas) {
      ctx.drawImage(tempCanvas, 0, 0, tempCanvas.width / dpr, tempCanvas.height / dpr);
    } else {
      saveSnapshot();
    }
  }, [saveSnapshot]);

  // Keep canvas sized and observe container changes whenever in draw mode
  useEffect(() => {
    if (inputMode === 'draw') {
      const handleResize = () => {
        resizeCanvas();
      };

      handleResize();
      const raf = requestAnimationFrame(handleResize);

      const container = containerRef.current;
      let ro = null;
      if (container && window.ResizeObserver) {
        ro = new ResizeObserver(() => {
          requestAnimationFrame(handleResize);
        });
        ro.observe(container);
      }

      window.addEventListener('resize', handleResize);

      // Global window pointerup/cancel to ensure pen never gets stuck if pointer leaves canvas or button is released
      const handleGlobalPointerUp = () => {
        if (isDrawingRef.current) {
          isDrawingRef.current = false;
          pointsRef.current = [];
          saveSnapshot();
          setStrokeCount((prev) => {
            const next = prev + 1;
            setTimeout(() => {
              if (onStrokeCountChange) onStrokeCountChange(next);
            }, 0);
            return next;
          });
        }
      };

      window.addEventListener('pointerup', handleGlobalPointerUp);
      window.addEventListener('pointercancel', handleGlobalPointerUp);

      return () => {
        cancelAnimationFrame(raf);
        if (ro) ro.disconnect();
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('pointerup', handleGlobalPointerUp);
        window.removeEventListener('pointercancel', handleGlobalPointerUp);
      };
    }
  }, [inputMode, resizeCanvas, saveSnapshot, onStrokeCountChange]);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: e.pressure && e.pressure > 0 ? e.pressure : 0.5
    };
  };

  const handlePointerDown = (e) => {
    if (inputMode !== 'draw') return;
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    try {
      e.target.setPointerCapture(e.pointerId);
    } catch {
      // Ignore
    }

    isDrawingRef.current = true;
    const pt = getCoordinates(e);
    pointsRef.current = [pt];

    const ctx = getContext();
    if (!ctx) return;

    const activeColor = colorRef.current || color;
    const activeWidth = strokeWidthRef.current || strokeWidth;
    const isEraser = toolRef.current === 'eraser';

    // Direct context configuration before every stroke
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (isEraser) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = eraserWidth;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, eraserWidth / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = activeColor;
      ctx.fillStyle = activeColor;
      ctx.lineWidth = activeWidth;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, activeWidth / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const handlePointerMove = (e) => {
    if (inputMode !== 'draw') return;
    const pt = getCoordinates(e);
    setCursorPos({ x: pt.x, y: pt.y, visible: true });

    if (!isDrawingRef.current) return;

    const pts = pointsRef.current;
    pts.push(pt);

    const ctx = getContext();
    if (!ctx || pts.length < 2) return;

    const activeColor = colorRef.current || color;
    const activeWidth = strokeWidthRef.current || strokeWidth;
    const isEraser = toolRef.current === 'eraser';

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (isEraser) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = eraserWidth;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = activeColor;
      ctx.fillStyle = activeColor;
      ctx.lineWidth = activeWidth;
    }

    ctx.beginPath();
    if (pts.length === 2) {
      ctx.moveTo(pts[0].x, pts[0].y);
      ctx.lineTo(pts[1].x, pts[1].y);
      ctx.stroke();
    } else {
      const p1 = pts[pts.length - 2];
      const p2 = pts[pts.length - 1];
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;

      ctx.moveTo(pts[pts.length - 3].x, pts[pts.length - 3].y);
      ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
      ctx.stroke();
    }
  };

  const handlePointerUp = (e) => {
    if (inputMode !== 'draw') return;
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    pointsRef.current = [];

    try {
      if (e.target.hasPointerCapture(e.pointerId)) {
        e.target.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore
    }

    saveSnapshot();
    setStrokeCount((prev) => {
      const next = prev + 1;
      setTimeout(() => {
        if (onStrokeCountChange) onStrokeCountChange(next);
      }, 0);
      return next;
    });
  };

  const undo = useCallback(() => {
    if (historyRef.current.length <= 1) return;
    const canvas = canvasRef.current;
    const ctx = getContext();
    if (!canvas || !ctx) return;

    historyRef.current.pop();
    const previousState = historyRef.current[historyRef.current.length - 1];
    if (previousState) {
      ctx.putImageData(previousState, 0, 0);
    }
    const nextCount = Math.max(0, strokeCount - 1);
    setStrokeCount(nextCount);
    if (onStrokeCountChange) {
      onStrokeCountChange(nextCount);
    }
  }, [getContext, strokeCount, onStrokeCountChange]);

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = getContext();
    if (!canvas || !ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    historyRef.current = [];
    saveSnapshot();
    setStrokeCount(0);
    if (onStrokeCountChange) {
      onStrokeCountChange(0);
    }
  }, [getContext, saveSnapshot, onStrokeCountChange]);

  const drawSampleStrokes = useCallback((strokes, sampleColor = '#38bdf8') => {
    clear();
    const canvas = canvasRef.current;
    const ctx = getContext();
    if (!canvas || !ctx || !strokes || strokes.length === 0) return;

    ctx.save();
    ctx.strokeStyle = sampleColor;
    ctx.fillStyle = sampleColor;
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    strokes.forEach((stroke) => {
      if (stroke.length === 1) {
        ctx.beginPath();
        ctx.arc(stroke[0].x, stroke[0].y, 2, 0, Math.PI * 2);
        ctx.fill();
        return;
      }
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i].x, stroke[i].y);
      }
      ctx.stroke();
    });
    ctx.restore();

    saveSnapshot();
    setStrokeCount(strokes.length);
    if (onStrokeCountChange) onStrokeCountChange(strokes.length);
  }, [clear, getContext, saveSnapshot, onStrokeCountChange]);

  const getCanvasDataURL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const offscreen = document.createElement('canvas');
    offscreen.width = canvas.width;
    offscreen.height = canvas.height;
    const offCtx = offscreen.getContext('2d');
    if (offCtx) {
      offCtx.fillStyle = '#070a12';
      offCtx.fillRect(0, 0, offscreen.width, offscreen.height);
      offCtx.drawImage(canvas, 0, 0);
      return offscreen.toDataURL('image/png');
    }
    return canvas.toDataURL('image/png');
  }, []);

  useImperativeHandle(ref, () => ({
    undo,
    clear,
    drawSampleStrokes,
    getCanvasDataURL,
    canUndo: historyRef.current.length > 1,
    strokeCount,
  }));

  const gridClass = 
    gridStyle === 'dots' 
      ? 'canvas-grid-dots' 
      : gridStyle === 'lines' 
        ? 'canvas-grid-lines' 
        : '';

  return (
    <div className="flex flex-col h-full bg-[#090d18] rounded-2xl border border-slate-800/80 shadow-2xl overflow-hidden relative">
      
      {/* Top Header of Teacher Board */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 bg-[#0c1222] border-b border-slate-800/80 select-none gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400"></div>
          <span className="text-xs font-bold tracking-wider uppercase text-slate-200 font-mono">
            Teacher Board
          </span>
          
          {/* Mode Switch: Draw vs Type */}
          <div className="flex items-center bg-slate-900/90 p-0.5 rounded-lg border border-slate-800 ml-2">
            <button
              onClick={() => setInputMode('draw')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                inputMode === 'draw'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <PenTool className="w-3 h-3" />
              <span>Draw</span>
            </button>
            <button
              onClick={() => setInputMode('type')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                inputMode === 'type'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Keyboard className="w-3 h-3" />
              <span>Type</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-xs text-slate-400">
          {inputMode === 'draw' ? (
            <>
              {/* Quick color indicator & swatches */}
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-900/90 border border-slate-800">
                {[
                  { name: 'Cyan', hex: '#38bdf8' },
                  { name: 'White', hex: '#ffffff' },
                  { name: 'Purple', hex: '#c084fc' },
                  { name: 'Green', hex: '#4ade80' },
                  { name: 'Yellow', hex: '#fde047' },
                ].map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => {
                      if (onColorChange) onColorChange(c.hex);
                    }}
                    className={`w-3.5 h-3.5 rounded-full transition-transform ${
                      color.toLowerCase() === c.hex.toLowerCase() && tool === 'pen'
                        ? 'scale-125 ring-2 ring-cyan-400 ring-offset-1 ring-offset-slate-900 shadow-sm'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={`Draw Color: ${c.name}`}
                  />
                ))}
              </div>

              <span className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Canvas Ready
              </span>
              <span className="text-slate-700">|</span>
              <span className="font-mono text-[11px] text-cyan-300">
                {strokeCount} {strokeCount === 1 ? 'stroke' : 'strokes'}
              </span>
            </>
          ) : (
            <span className="font-mono text-[11px] text-purple-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
              Text Input Mode
            </span>
          )}
        </div>
      </div>

      {/* Main Board Content - Both modes kept mounted to preserve canvas state and drawing fidelity */}
      {/* 1. Typed Input Mode Container */}
      <div className={`flex-1 w-full p-4 sm:p-5 flex flex-col justify-between bg-[#070a12] ${inputMode === 'type' ? 'flex' : 'hidden'}`}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 font-mono mb-2">
              Type Any Mathematical Equation or Geometry Problem:
            </label>
            <div className="relative">
              <textarea
                value={typedText}
                onChange={(e) => setTypedText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (onSubmitTyped) onSubmitTyped();
                  }
                }}
                placeholder="e.g. x^2 = 16, y = sin(2x) - 1, y = mx + c, A cube has side length 4 cm, or A circle of radius 4 is divided into 4 equal parts..."
                rows={4}
                className="w-full p-3.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white font-mono text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 shadow-inner resize-none"
              />
            </div>
          </div>

          {/* Helpful Input Guidance */}
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 text-xs text-slate-400">
            <span className="text-cyan-400 font-semibold font-mono">Teacher Input: </span>
            Type ANY JEE mathematics question above, or select a preset from the bottom benchmark bar. Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 font-mono text-[10px]">Enter</kbd> or click <strong className="text-white">VISUALIZE</strong> to solve!
          </div>
        </div>

        <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 text-xs text-slate-400">
          <span className="text-cyan-400 font-semibold font-mono">Gemini Multimodal Solver: </span>
          Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 font-mono text-[10px]">Enter</kbd> or click the glowing <strong className="text-white">VISUALIZE</strong> button to generate step-by-step solution and live interactive visual model!
        </div>
      </div>

      {/* 2. Digital Canvas Drawing Mode Container */}
      <div 
        ref={containerRef}
        className={`relative flex-1 w-full min-h-[360px] bg-[#070a12] cursor-crosshair overflow-hidden touch-none select-none ${gridClass} ${inputMode === 'draw' ? 'block' : 'hidden'}`}
        onPointerLeave={() => setCursorPos((p) => ({ ...p, visible: false }))}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full block"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />

        {tool === 'eraser' && cursorPos.visible && (
          <div
            className="pointer-events-none absolute rounded-full border-2 border-pink-400/80 bg-pink-500/10 -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 ease-out shadow-sm"
            style={{
              left: `${cursorPos.x}px`,
              top: `${cursorPos.y}px`,
              width: `${eraserWidth}px`,
              height: `${eraserWidth}px`,
            }}
          />
        )}

        {strokeCount === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-6 text-center select-none opacity-60">
            <div className="w-12 h-12 rounded-2xl bg-cyan-950/40 border border-cyan-800/40 flex items-center justify-center mb-3 text-cyan-400">
              <PenTool className="w-6 h-6 stroke-[1.5]" />
            </div>
            <p className="text-sm font-semibold text-slate-300">
              Write an equation or geometry problem here
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Use stylus, touch screen, or mouse. Or toggle to "Type" mode above!
            </p>
          </div>
        )}
      </div>
      
      {/* 3. Draw Mode Equation Transcription & Quick Demo Bar */}
      {inputMode === 'draw' && (
        <div className="flex items-center justify-between px-3.5 py-2 bg-[#0c1222] border-t border-slate-800/80 gap-2 select-none flex-wrap">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <span className="text-[11px] font-mono text-cyan-400 font-semibold whitespace-nowrap flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              Drawn Equation:
            </span>
            <input
              type="text"
              value={typedText}
              onChange={(e) => setTypedText && setTypedText(e.target.value)}
              placeholder="e.g. x^2 = 25"
              className="flex-1 max-w-sm px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-700/80 text-white font-mono text-xs focus:outline-none focus:border-cyan-400 shadow-inner"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-slate-500 uppercase">Demo:</span>
            <button
              type="button"
              onClick={() => {
                if (setTypedText) setTypedText('x^2 = 25');
                const sample = SAMPLE_PROBLEMS['quadratic_25'];
                if (sample && sample.handwritingStrokes) {
                  drawSampleStrokes(sample.handwritingStrokes, colorRef.current || '#38bdf8');
                }
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold border transition-all ${
                typedText === 'x^2 = 25'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
              title="Demonstration Equation: x² = 25"
            >
              x² = 25
            </button>
          </div>
        </div>
      )}

    </div>
  );
});

export default TeacherBoard;
