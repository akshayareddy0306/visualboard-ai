import React from 'react';
import { Pen, Eraser, RotateCcw, Trash2, Sparkles, Grid, ChevronRight } from 'lucide-react';
import { SAMPLE_PROBLEMS } from '../data/sampleProblems';

const COLORS = [
  { name: 'Cyan', hex: '#38bdf8' },
  { name: 'White', hex: '#ffffff' },
  { name: 'Purple', hex: '#c084fc' },
  { name: 'Green', hex: '#4ade80' },
  { name: 'Yellow', hex: '#fde047' },
];

const STROKE_WIDTHS = [
  { label: 'Fine', value: 1.5 },
  { label: 'Medium', value: 2.5 },
  { label: 'Bold', value: 4 },
];

export default function Toolbar({
  tool,
  setTool,
  color,
  setColor,
  strokeWidth,
  setStrokeWidth,
  canUndo,
  onUndo,
  onClear,
  onSelectSample,
  activeSampleId,
  onVisualize,
  isAnalyzing,
  gridStyle,
  setGridStyle,
}) {
  return (
    <div className="w-full bg-[#0a0f1d]/95 backdrop-blur-lg border-t border-slate-800/80 px-4 py-3 shadow-2xl sticky bottom-0 z-40">
      <div className="max-w-[1720px] mx-auto flex flex-wrap items-center justify-between gap-3">
        
        {/* Left Side: Drawing Tools */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Main Drawing Tools Group */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-800 shadow-inner">
            {/* Pen Tool */}
            <button
              onClick={() => setTool('pen')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                tool === 'pen'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
              title="Pen Tool (draw with stylus or mouse)"
            >
              <Pen className="w-4 h-4" />
              <span>Pen</span>
            </button>

            {/* Eraser Tool */}
            <button
              onClick={() => setTool('eraser')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                tool === 'eraser'
                  ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-300 border border-pink-500/50 shadow-sm shadow-pink-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
              title="Eraser Tool"
            >
              <Eraser className="w-4 h-4" />
              <span>Eraser</span>
            </button>

            <div className="w-px h-6 bg-slate-800 mx-0.5"></div>

            {/* Undo */}
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                canUndo
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95'
                  : 'text-slate-600 cursor-not-allowed'
              }`}
              title="Undo last stroke"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden md:inline">Undo</span>
            </button>

            {/* Clear */}
            <button
              onClick={onClear}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-rose-400/80 hover:text-rose-300 hover:bg-rose-950/30 transition-all duration-200 active:scale-95"
              title="Clear entire canvas"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden md:inline">Clear</span>
            </button>
          </div>

          {/* Stroke Width Selector */}
          <div className="hidden lg:flex items-center gap-1 p-1 rounded-xl bg-slate-900/90 border border-slate-800">
            {STROKE_WIDTHS.map((sw) => (
              <button
                key={sw.label}
                type="button"
                onClick={() => setStrokeWidth(sw.value)}
                className={`px-2 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                  strokeWidth === sw.value
                    ? 'bg-slate-800 text-cyan-300 font-bold border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sw.label}
              </button>
            ))}
          </div>

          {/* Color Palette */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-900/90 border border-slate-800">
            {COLORS.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => {
                  setColor(c.hex);
                  if (tool !== 'pen') setTool('pen');
                }}
                className={`w-5 h-5 rounded-full transition-transform ${
                  color.toLowerCase() === c.hex.toLowerCase() && tool === 'pen'
                    ? 'scale-125 ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900 shadow-md'
                    : 'opacity-70 hover:opacity-100 hover:scale-110'
                }`}
                style={{ backgroundColor: c.hex }}
                title={`Color: ${c.name}`}
              />
            ))}
          </div>

          {/* Grid Toggle */}
          <button
            onClick={() => {
              const next = gridStyle === 'dots' ? 'lines' : gridStyle === 'lines' ? 'none' : 'dots';
              setGridStyle(next);
            }}
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs"
            title="Toggle background grid"
          >
            <Grid className="w-3.5 h-3.5 text-cyan-400" />
            <span className="capitalize">{gridStyle}</span>
          </button>
        </div>

        {/* Center: JEE Benchmark Problem Chips */}
        <div className="flex items-center gap-1.5 flex-wrap max-w-2xl">
          <span className="hidden 2xl:inline text-[10px] font-mono text-slate-500 uppercase tracking-wider mr-1">
            JEE Benchmarks:
          </span>

          {Object.entries(SAMPLE_PROBLEMS).map(([id, sample]) => {
            const isActive = activeSampleId === id;
            return (
              <button
                key={id}
                onClick={() => onSelectSample(id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium font-mono border transition-all duration-200 active:scale-95 ${
                  isActive
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-500 shadow-md shadow-cyan-950/50'
                    : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
                title={sample.title}
              >
                {sample.label}
              </button>
            );
          })}
        </div>

        {/* Right Side: Glowing VISUALIZE Button */}
        <div>
          <button
            onClick={onVisualize}
            disabled={isAnalyzing}
            className={`relative group flex items-center gap-2.5 px-6 py-2.5 rounded-xl font-bold text-sm tracking-wide text-white transition-all duration-300 active:scale-95 shadow-xl ${
              isAnalyzing
                ? 'bg-slate-800 cursor-wait opacity-80'
                : 'bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:from-cyan-400 hover:via-indigo-400 hover:to-purple-500 glow-visualize'
            }`}
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>PROCESSING...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-200 animate-pulse" />
                <span className="font-extrabold tracking-wider uppercase">VISUALIZE</span>
                <ChevronRight className="w-4 h-4 text-white/70 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
