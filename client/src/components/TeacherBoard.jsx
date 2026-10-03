import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  PenTool, 
  Type, 
  Eraser, 
  RotateCcw, 
  Trash2, 
  Sparkles, 
  Send, 
  ChevronRight,
  HelpCircle,
  Maximize2
} from 'lucide-react';

const COLORS = [
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Cyan', hex: '#06B6D4' },
  { name: 'Purple', hex: '#A855F7' },
  { name: 'Yellow', hex: '#FACC15' },
  { name: 'Coral Red', hex: '#FF4C4C' },
];

const PRESETS = [
  {
    category: 'Calculus',
    text: 'Find the area bounded between the parabola y = x^2 and the line y = 4.',
  },
  {
    category: '3D Geometry',
    text: 'A right circular cone has base radius 3 and height 4. Find its volume and curved surface area.',
  },
  {
    category: 'Coordinate Geometry',
    text: 'A circle has diameter endpoints at (1, 2) and (5, 6). Find its center, radius, and equation.',
  },
  {
    category: 'Vectors',
    text: 'Two vectors u = (3, 4) and v = (4, -3). Find their dot product, angle between them, and magnitude of each.',
  },
  {
    category: 'Geometry',
    text: 'A regular pentagon has side length 6. Find its perimeter, area, and interior angle.',
  },
  {
    category: 'Trigonometry',
    text: 'Plot y = 2*sin(x) from x = 0 to 2*pi and find its amplitude and period.',
  },
  {
    category: 'Algebra',
    text: 'Solve the quadratic equation 2*x^2 - 7*x + 3 = 0 and visualize its roots and vertex.',
  }
];

export default function TeacherBoard({ onSolve, isLoading }) {
  const [activeTab, setActiveTab] = useState('type'); // 'type' | 'draw'
  const [questionText, setQuestionText] = useState('');
  
  // Drawing state
  const [activeTool, setActiveTool] = useState('pen'); // 'pen' | 'eraser'
  const [selectedColor, setSelectedColor] = useState('#06B6D4');
  const [strokeWidth, setStrokeWidth] = useState(3);
  
  // Canvas refs
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const currentPathRef = useRef([]);
  const [history, setHistory] = useState([]); // Array of paths: { tool, color, width, points: [{x, y}] }

  // Canvas size and DPR management
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    redrawCanvas(ctx);
  }, [history]);

  useEffect(() => {
    if (activeTab === 'draw') {
      // Small timeout to allow container layout calculation
      const timer = setTimeout(resizeCanvas, 50);
      window.addEventListener('resize', resizeCanvas);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', resizeCanvas);
      };
    }
  }, [activeTab, resizeCanvas]);

  // Redraw all paths from history
  const redrawCanvas = (ctx) => {
    const canvas = canvasRef.current;
    if (!canvas || !ctx) return;
    
    // Clear canvas
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    // Redraw grid background subtle dots
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;
    
    ctx.fillStyle = 'rgba(100, 116, 139, 0.15)';
    const gridSpacing = 24;
    for (let x = gridSpacing; x < width; x += gridSpacing) {
      for (let y = gridSpacing; y < height; y += gridSpacing) {
        ctx.fillRect(x, y, 1.5, 1.5);
      }
    }

    // Render paths
    history.forEach(path => {
      if (!path.points || path.points.length === 0) return;
      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = path.width;

      if (path.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = path.color;
      }

      if (path.points.length === 1) {
        ctx.arc(path.points[0].x, path.points[0].y, path.width / 2, 0, Math.PI * 2);
        ctx.fillStyle = path.color;
        ctx.fill();
      } else {
        ctx.moveTo(path.points[0].x, path.points[0].y);
        for (let i = 1; i < path.points.length; i++) {
          const xc = (path.points[i].x + path.points[i - 1].x) / 2;
          const yc = (path.points[i].y + path.points[i - 1].y) / 2;
          ctx.quadraticCurveTo(path.points[i - 1].x, path.points[i - 1].y, xc, yc);
        }
        ctx.lineTo(
          path.points[path.points.length - 1].x,
          path.points[path.points.length - 1].y
        );
        ctx.stroke();
      }
    });

    ctx.globalCompositeOperation = 'source-over';
  };

  // Re-render when history changes
  useEffect(() => {
    if (activeTab === 'draw' && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      redrawCanvas(ctx);
    }
  }, [history, activeTab]);

  // Pointer event handlers
  const handlePointerDown = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    isDrawingRef.current = true;
    currentPathRef.current = [{ x, y }];

    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = activeTool === 'eraser' ? strokeWidth * 3 : strokeWidth;

    if (activeTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = selectedColor;
    }

    ctx.beginPath();
    ctx.arc(x, y, (activeTool === 'eraser' ? strokeWidth * 3 : strokeWidth) / 2, 0, Math.PI * 2);
    ctx.fillStyle = activeTool === 'eraser' ? 'rgba(0,0,0,1)' : selectedColor;
    ctx.fill();
  };

  const handlePointerMove = (e) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    currentPathRef.current.push({ x, y });

    const ctx = canvas.getContext('2d');
    const points = currentPathRef.current;
    if (points.length >= 2) {
      const p1 = points[points.length - 2];
      const p2 = points[points.length - 1];
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
  };

  const handlePointerUp = (e) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();
    isDrawingRef.current = false;

    if (currentPathRef.current.length > 0) {
      setHistory(prev => [
        ...prev,
        {
          tool: activeTool,
          color: selectedColor,
          width: activeTool === 'eraser' ? strokeWidth * 3 : strokeWidth,
          points: currentPathRef.current,
        }
      ]);
    }
    currentPathRef.current = [];
  };

  const handleUndo = () => {
    setHistory(prev => prev.slice(0, -1));
  };

  const handleClearCanvas = () => {
    setHistory([]);
  };

  const insertSymbol = (sym) => {
    setQuestionText(prev => prev + sym);
  };

  const handleSubmit = () => {
    if (isLoading) return;

    if (activeTab === 'type') {
      if (!questionText.trim()) return;
      onSolve({
        inputType: 'text',
        content: questionText.trim(),
      });
    } else {
      if (history.length === 0) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // Export canvas drawing as PNG base64
      // Create a background-filled temporary copy so handwriting is clear on dark/transparent
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      // Dark navy background for handwriting OCR
      tempCtx.fillStyle = '#0B0F19';
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      tempCtx.drawImage(canvas, 0, 0);

      const dataUrl = tempCanvas.toDataURL('image/png');
      onSolve({
        inputType: 'image',
        content: dataUrl,
      });
    }
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1527]/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
      {/* Top Header of Teacher Board */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-900/60">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <h2 className="text-sm font-bold tracking-wide text-slate-200 uppercase">
            Teacher Board
          </h2>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('type')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'type'
                ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Type Math</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('draw')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'draw'
                ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Draw / Pen</span>
          </button>
        </div>
      </div>

      {/* Main Board Content */}
      <div className="flex-1 flex flex-col p-5 overflow-hidden">
        {activeTab === 'type' ? (
          <div className="flex-1 flex flex-col gap-4">
            {/* Quick Math Symbols Bar */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase mr-1">Insert:</span>
              {['x²', 'x³', '√', 'π', 'θ', '∫', 'lim', '±', '≤', '≥', '∞', 'sin', 'cos', 'tan', 'log'].map((sym) => (
                <button
                  key={sym}
                  type="button"
                  onClick={() => insertSymbol(sym + (sym.length > 2 ? '(' : ''))}
                  className="px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-cyan-300 font-mono text-xs border border-slate-700/60 transition-colors"
                >
                  {sym}
                </button>
              ))}
            </div>

            {/* Question Input Textarea */}
            <div className="flex-1 relative flex flex-col">
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type any math question (Algebra, Geometry, Vectors, Calculus, 3D Geometry)...&#10;&#10;e.g. Find the area enclosed between y = x^2 and y = 4&#10;e.g. A right circular cone has radius 3 and height 4. Find its volume."
                className="w-full flex-1 p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder:text-slate-600 text-sm leading-relaxed focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/50 resize-none font-mono"
              />
              {questionText && (
                <button
                  type="button"
                  onClick={() => setQuestionText('')}
                  className="absolute bottom-3 right-3 text-xs text-slate-500 hover:text-slate-300 px-2 py-1 rounded bg-slate-900 border border-slate-800"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Preset Questions for Quick Testing */}
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  Quick JEE & School Presets
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                {PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setQuestionText(p.text)}
                    className="text-left px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800/60 text-xs text-slate-300 transition-colors group flex items-start gap-1.5"
                  >
                    <span className="text-[10px] font-bold text-cyan-400 uppercase mt-0.5 whitespace-nowrap">
                      {p.category}:
                    </span>
                    <span className="truncate group-hover:text-white">{p.text}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Draw Mode Canvas with complete controls */
          <div className="flex-1 flex flex-col gap-3">
            {/* Canvas Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-950/80 rounded-xl border border-slate-800">
              {/* Tool Selection */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTool('pen')}
                  className={`p-2 rounded-lg transition-colors ${
                    activeTool === 'pen'
                      ? 'bg-purple-600/40 text-purple-300 border border-purple-500/50'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                  title="Pen Tool"
                >
                  <PenTool className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTool('eraser')}
                  className={`p-2 rounded-lg transition-colors ${
                    activeTool === 'eraser'
                      ? 'bg-rose-600/40 text-rose-300 border border-rose-500/50'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                  title="Eraser Tool"
                >
                  <Eraser className="w-4 h-4" />
                </button>
              </div>

              {/* Color Swatches (5 colors as requested) */}
              <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-900 rounded-lg border border-slate-800">
                {COLORS.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => {
                      setSelectedColor(c.hex);
                      setActiveTool('pen');
                    }}
                    style={{ backgroundColor: c.hex }}
                    className={`w-5 h-5 rounded-full transition-transform ${
                      selectedColor === c.hex && activeTool === 'pen'
                        ? 'scale-125 ring-2 ring-cyan-400 shadow-md'
                        : 'opacity-70 hover:opacity-100 hover:scale-110'
                    }`}
                    title={c.name}
                  />
                ))}
              </div>

              {/* Stroke Size */}
              <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Width:</span>
                {[2, 4, 8].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setStrokeWidth(size)}
                    className={`w-6 h-6 flex items-center justify-center rounded text-xs font-mono ${
                      strokeWidth === size ? 'bg-cyan-500/30 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>

              {/* Actions: Undo & Clear */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={history.length === 0}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Undo Stroke"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleClearCanvas}
                  disabled={history.length === 0}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Clear Canvas"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Drawing Canvas Container */}
            <div className="relative flex-1 min-h-[300px] rounded-xl bg-[#090D16] border border-slate-800 overflow-hidden shadow-inner">
              <canvas
                ref={canvasRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onPointerLeave={handlePointerUp}
                style={{ touchAction: 'none' }}
                className="w-full h-full cursor-crosshair block"
              />
              {history.length === 0 && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-600 text-xs">
                  <PenTool className="w-8 h-8 mb-2 opacity-30 text-cyan-400" />
                  <p>Write or draw an equation, graph, or geometry problem</p>
                  <p className="text-[10px] text-slate-600 mt-1">Pointer events & DPI-scaled canvas</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Button: Solve & Visualize */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-4">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <span className="hidden sm:inline">Press</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 font-mono text-[10px]">
              Ctrl + Enter
            </kbd>
            <span className="hidden sm:inline">to solve</span>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || (activeTab === 'type' ? !questionText.trim() : history.length === 0)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-cyan-500 via-sky-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>AI Solving...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-200" />
                <span>Solve & Visualize</span>
                <ChevronRight className="w-4 h-4 text-cyan-200" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
